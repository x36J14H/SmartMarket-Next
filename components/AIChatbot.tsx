'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Send,
  Bot,
  Maximize2,
  Minimize2,
  Package,
  ArrowUpRight,
  Headphones,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { fetchProductBySlug } from '../lib/1c/catalog';
import { getProductImage, formatChatPrice } from '../lib/productMedia';
import { useChatStore, ChatMode } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import {
  getChatHistory,
  sendChatMessage,
  closeChat as close1CChat,
  ChatMessage,
} from '../lib/1c/chat';
import type { Product } from '../types';

type AIMessage = { id: string; role: 'user' | 'model'; text: string };

interface ChatProductItem {
  id: string;
  name: string;
  url: string;
  price?: string;
}

type ParsedChatBlock =
  | { type: 'text'; content: string }
  | { type: 'products'; items: ChatProductItem[] };

/**
 * Парсит сообщение и разделяет его на обычные текстовые блоки
 * и сгруппированные списки товаров для карточного отображения.
 */
function parseMessageContent(text: string): ParsedChatBlock[] {
  const PRODUCT_REGEX =
    /(?:^|\n)?\s*(?:[-*•]|\d+\.)?\s*\[([^\]]+)\]\((\/product\/[^)]+)\)(?:[ \t]*(?:[—–\-:•|,]|\(|\bза\b|\bпо цене\b|\bот\b|\bцена:?\b)?[ \t]*([0-9][0-9\s\u00A0\u202F.,]*(?:[ \t]*(?:руб(?:лей|\.)?|₽|USD|\$|EUR|€))?)\)?)?/gi;

  const matches: {
    start: number;
    end: number;
    item: ChatProductItem;
  }[] = [];

  let m: RegExpExecArray | null;
  while ((m = PRODUCT_REGEX.exec(text)) !== null) {
    const rawUrl = m[2].trim();
    const productId = rawUrl.replace(/^\/product\//, '').trim();
    const rawPrice = m[3]?.trim() || '';
    const formattedPrice = formatChatPrice(rawPrice);

    matches.push({
      start: m.index,
      end: PRODUCT_REGEX.lastIndex,
      item: {
        id: productId,
        name: m[1].trim(),
        url: rawUrl,
        price: formattedPrice,
      },
    });
  }

  if (matches.length === 0) {
    return [{ type: 'text', content: text }];
  }

  const blocks: ParsedChatBlock[] = [];
  let cursor = 0;
  let currentProductGroup: ChatProductItem[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const textBetween = text.slice(cursor, match.start);

    if (textBetween.trim().length > 0) {
      if (currentProductGroup.length > 0) {
        blocks.push({ type: 'products', items: currentProductGroup });
        currentProductGroup = [];
      }
      blocks.push({ type: 'text', content: textBetween.trim() });
    }

    currentProductGroup.push(match.item);
    cursor = match.end;
  }

  if (currentProductGroup.length > 0) {
    blocks.push({ type: 'products', items: currentProductGroup });
  }

  const trailingText = text.slice(cursor).trim();
  if (trailingText.length > 0) {
    blocks.push({ type: 'text', content: trailingText });
  }

  return blocks;
}

const chatProductCache = new Map<string, Product>();

function ProductChatItem({ item }: { item: ChatProductItem }) {
  const [product, setProduct] = useState<Product | null>(
    () => chatProductCache.get(item.id) || null
  );
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [hasImgError, setHasImgError] = useState(false);

  useEffect(() => {
    if (product || !item.id) return;

    let isMounted = true;
    const controller = new AbortController();

    fetchProductBySlug(item.id, controller.signal)
      .then((p) => {
        if (!isMounted || !p) return;
        chatProductCache.set(item.id, p);
        if (p.id) chatProductCache.set(p.id, p);
        if (p.slug) chatProductCache.set(p.slug, p);
        setProduct(p);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [item.id, product]);

  const raw1cImg = hasImgError ? undefined : product?.imageUrl;
  const imageSrc = getProductImage(item.id, item.name, raw1cImg);
  const displayPrice = item.price || (product?.price ? formatChatPrice(product.price) : '');

  return (
    <Link
      href={item.url}
      className="group relative flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/90 bg-white p-2.5 sm:p-3 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-50/10 hover:shadow-md active:translate-y-0"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100 p-1 transition-colors group-hover:border-emerald-200 group-hover:bg-white">
          {!isImgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-zinc-200/60 rounded-xl" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={item.name}
            loading="lazy"
            onLoad={() => setIsImgLoaded(true)}
            onError={() => {
              setHasImgError(true);
              setIsImgLoaded(true);
            }}
            className={`h-full w-full object-contain transition-all duration-300 group-hover:scale-105 ${
              isImgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-semibold text-zinc-900 text-xs sm:text-sm leading-snug line-clamp-2 transition-colors group-hover:text-emerald-700">
            {item.name}
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
            <span>В наличии</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {displayPrice ? (
          <span className="inline-flex items-center rounded-xl bg-emerald-50 px-2.5 py-1 text-xs sm:text-sm font-bold text-emerald-800 ring-1 ring-inset ring-emerald-600/20 whitespace-nowrap shadow-2xs">
            {displayPrice}
          </span>
        ) : null}
        <span
          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-all duration-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0"
          aria-hidden="true"
        >
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
}

export function AIChatbot() {
  const {
    isOpen,
    isFullScreen,
    setIsFullScreen,
    openChat,
    closeChat,
    input,
    setInput,
    pendingPrompt,
    clearPendingPrompt,
    mode,
    setMode,
    chatId,
    setChatId,
    unreadOperatorCount,
    incrementUnread,
    clearUnread,
  } = useChatStore();

  const { user } = useAuthStore();

  const [hasFloatingBar, setHasFloatingBar] = useState(false);

  // --- Состояние ИИ-режима ---
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Привет! Я персональный ИИ-Консультант SmartMarket. Готов помочь подобрать идеальный товар, сравнить характеристики или найти максимальную выгоду. Чем могу помочь?',
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiSessionId = useRef('session-chat');

  // --- Состояние режима Оператора (1С) ---
  const [operatorMessages, setOperatorMessages] = useState<ChatMessage[]>([]);
  const [isOperatorLoading, setIsOperatorLoading] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const [operatorName, setOperatorName] = useState('Консультант SmartMarket');
  const [chatStatus, setChatStatus] = useState('Новый');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts = [
    '🎁 Подобрать подарок',
    '⚡ Лучшие скидки недели',
    '📱 Смартфоны до 40 000 ₽',
  ];

  // Инициализация session_id для ИИ
  useEffect(() => {
    aiSessionId.current = `session-${Date.now()}`;
  }, []);

  // Восстановление только chat_id из localStorage (история загружается исключительно из 1С!)
  useEffect(() => {
    try {
      const savedChatId = localStorage.getItem('smartmarket_chat_id');
      if (savedChatId && !chatId) {
        setChatId(savedChatId);
      }
    } catch {
      // ignore
    }
  }, [chatId, setChatId]);

  // Загрузка истории переписки напрямую из 1С (единый источник правды)
  const loadHistoryFrom1C = useCallback(
    async (idToLoad: string) => {
      if (!idToLoad) return;
      setIsOperatorLoading(true);
      try {
        const data = await getChatHistory(idToLoad);
        if (data && Array.isArray(data.messages)) {
          setOperatorMessages(data.messages);
          if (data.operator_name) setOperatorName(data.operator_name);
          if (data.status) setChatStatus(data.status);
        }
        setIsHistoryLoaded(true);
      } catch (err) {
        console.error('[1C Chat] Ошибка загрузки истории:', err);
      } finally {
        setIsOperatorLoading(false);
      }
    },
    []
  );

  // При переключении на режим оператора — подгружаем историю из 1С
  useEffect(() => {
    if (mode === 'operator' && chatId && !isHistoryLoaded) {
      loadHistoryFrom1C(chatId);
    }
  }, [mode, chatId, isHistoryLoaded, loadHistoryFrom1C]);

  // Подключение к Server-Sent Events (SSE) без polling 1C!
  useEffect(() => {
    if (!chatId) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/chat/stream?chat_id=${encodeURIComponent(chatId)}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.type === 'message' && data.message) {
            const pushMsg = data.message;
            const newMsg: ChatMessage = {
              id: pushMsg.message_id || Date.now().toString(),
              date: pushMsg.date || new Date().toISOString(),
              author: pushMsg.author,
              author_name: pushMsg.author_name || 'Оператор',
              text: pushMsg.text,
              is_operator: pushMsg.author === 'Оператор',
            };

            setOperatorMessages((prev) => {
              // Исключаем дубли
              if (prev.some((m) => m.id === newMsg.id || (m.text === newMsg.text && m.date === newMsg.date))) {
                return prev;
              }
              return [...prev, newMsg];
            });

            if (newMsg.is_operator && newMsg.author_name) {
              setOperatorName(newMsg.author_name);
            }

            // Если чат свернут или открыта вкладка ИИ — увеличиваем бейдж непрочитанных
            if (!isOpen || mode !== 'operator') {
              incrementUnread();
            }
          }
        } catch (e) {
          console.error('[SSE Error parsing data]', e);
        }
      };

      eventSource.onerror = () => {
        // SSE автоматически попытается переподключиться
      };
    } catch (e) {
      console.error('[SSE connection error]', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [chatId, isOpen, mode, incrementUnread]);

  // Сброс непрочитанных при открытии операторского чата
  useEffect(() => {
    if (isOpen && mode === 'operator') {
      clearUnread();
    }
  }, [isOpen, mode, clearUnread]);

  // Следим за floating bar страницы (например, в корзине)
  useEffect(() => {
    const checkFloatingBar = () =>
      setHasFloatingBar(document.documentElement.classList.contains('has-floating-bar'));
    const observer = new MutationObserver(checkFloatingBar);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    checkFloatingBar();
    return () => observer.disconnect();
  }, []);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [aiMessages, operatorMessages, isOpen, mode]);

  // Реактивная обработка авто-отправки prompt
  useEffect(() => {
    if (pendingPrompt && isOpen) {
      const promptText = pendingPrompt;
      clearPendingPrompt();
      if (mode === 'ai') {
        sendAIMessage(promptText);
      } else {
        sendOperatorMessage(promptText);
      }
    }
  }, [pendingPrompt, isOpen, mode]);

  // --- Отправка сообщения в ИИ ---
  const sendAIMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isAiLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend.trim(),
    };
    setAiMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text, session_id: aiSessionId.current }),
      });
      const data = await res.json();
      const text = data.text || 'Извините, не смог сформировать ответ. Попробуйте переформулировать вопрос.';
      setAiMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text }]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'model', text: 'Произошла ошибка связи с сервером. Попробуйте позже.' },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- Отправка сообщения Оператору в 1С ---
  const sendOperatorMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isOperatorLoading) return;

    const trimmed = textToSend.trim();
    setInput('');
    setIsOperatorLoading(true);

    // Оптимистичное добавление реплики клиента
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      date: new Date().toISOString(),
      author: 'Клиент',
      author_name: user?.name || 'Вы',
      text: trimmed,
      is_operator: false,
    };
    setOperatorMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await sendChatMessage({
        chat_id: chatId || undefined,
        text: trimmed,
        client_name: user?.name,
        client_email: user?.email,
        client_phone: user?.phone,
      });

      if (res && res.chat_id) {
        if (!chatId || chatId !== res.chat_id) {
          setChatId(res.chat_id);
          try {
            localStorage.setItem('smartmarket_chat_id', res.chat_id);
          } catch {
            // ignore
          }
        }
        if (res.status) setChatStatus(res.status);
      }
    } catch (err) {
      console.error('[1C Chat] Ошибка отправки сообщения:', err);
      // Если возникла ошибка — уведомляем пользователя
      setOperatorMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          date: new Date().toISOString(),
          author: 'Оператор',
          author_name: 'Система',
          text: 'Не удалось доставить сообщение оператору. Пожалуйста, проверьте подключение и повторите попытку.',
          is_operator: true,
        },
      ]);
    } finally {
      setIsOperatorLoading(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (mode === 'ai') {
      sendAIMessage(input);
    } else {
      sendOperatorMessage(input);
    }
  };

  const handleEndDialog = async () => {
    if (!chatId) return;
    try {
      await close1CChat(chatId);
    } catch {
      // ignore
    }
    setChatId(null);
    try {
      localStorage.removeItem('smartmarket_chat_id');
    } catch {
      // ignore
    }
    setOperatorMessages([]);
    setIsHistoryLoaded(false);
    setChatStatus('Новый');
  };

  const bottomClass = hasFloatingBar ? 'bottom-[88px] sm:bottom-6' : 'bottom-6';

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        suppressHydrationWarning
        onClick={openChat}
        className={`group fixed right-3.5 sm:right-6 z-40 flex h-12 w-12 sm:h-14 sm:w-auto items-center justify-center sm:justify-start rounded-full bg-zinc-950 p-2 sm:pl-3.5 sm:pr-5 text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-zinc-900 focus:outline-none ring-1 ring-white/20 ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        } ${bottomClass}`}
        aria-label="Открыть чат с поддержкой"
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm shrink-0">
          {mode === 'operator' ? <Headphones size={17} /> : <Bot size={18} />}
          {unreadOperatorCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 text-[10px] sm:text-[11px] font-extrabold text-white ring-2 ring-zinc-950 animate-pulse">
              {unreadOperatorCount}
            </span>
          )}
        </div>
        <div className="hidden sm:flex flex-col text-left ml-2.5">
          <span className="font-bold text-xs sm:text-sm tracking-tight leading-none">
            {unreadOperatorCount > 0 ? 'Ответ оператора!' : 'Консультант'}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium mt-0.5">
            {unreadOperatorCount > 0 ? 'Новое сообщение' : '1С • Онлайн'}
          </span>
        </div>
      </button>

      {/* Chat Window */}
      <div
        suppressHydrationWarning
        className={`fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-zinc-200/80 transition-all duration-400 ease-out ${
          isFullScreen
            ? 'bottom-0 right-0 w-full h-full max-h-none max-w-none rounded-none'
            : `right-3 sm:right-6 w-[360px] sm:w-[450px] max-w-[calc(100vw-1.5rem)] h-[600px] sm:h-[660px] max-h-[88vh] rounded-3xl origin-bottom-right ${bottomClass}`
        } ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'pointer-events-none scale-95 opacity-0 translate-y-4'}`}
      >
        {/* Header */}
        <div className="bg-zinc-950 px-5 sm:px-6 pt-4 pb-3 text-white border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm ring-2 ring-white/10">
                {mode === 'operator' ? <Headphones size={20} /> : <Bot size={22} />}
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight font-display">
                  {mode === 'operator' ? 'Поддержка SmartMarket' : 'Консультант SmartMarket'}
                </h3>
                <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  {mode === 'operator'
                    ? `${operatorName} • Реальный представитель`
                    : 'ИИ-Ассистент • Подбор и поиск'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {mode === 'operator' && chatId && (
                <button
                  onClick={handleEndDialog}
                  title="Завершить диалог и начать новый"
                  className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <RefreshCw size={15} />
                </button>
              )}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={isFullScreen ? 'Свернуть экран' : 'Во весь экран'}
              >
                {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={closeChat}
                className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-3 flex items-center gap-1 rounded-xl bg-white/10 p-1">
            <button
              onClick={() => setMode('ai')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                mode === 'ai'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles size={13} className={mode === 'ai' ? 'text-emerald-600' : ''} />
              <span>ИИ-Консультант</span>
            </button>
            <button
              onClick={() => {
                setMode('operator');
                clearUnread();
              }}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                mode === 'operator'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Headphones size={13} className={mode === 'operator' ? 'text-emerald-600' : ''} />
              <span>Оператор 1С</span>
              {unreadOperatorCount > 0 && (
                <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white">
                  {unreadOperatorCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#fbfbfd] space-y-4">
          {/* ================================================= */}
          {/* РЕЖИМ 1: ИИ-КОНСУЛЬТАНТ                           */}
          {/* ================================================= */}
          {mode === 'ai' && (
            <>
              {/* Quick Prompts */}
              {aiMessages.length === 1 && (
                <div className="space-y-2 pt-1 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendAIMessage(q)}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/40 transition-all text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Кнопка быстрого перехода к живому оператору */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setMode('operator');
                        clearUnread();
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/70 transition-all"
                    >
                      <Headphones size={14} className="text-emerald-600" />
                      <span>Нужна помощь специалиста? Написать оператору</span>
                    </button>
                  </div>
                </div>
              )}

              {aiMessages.map((msg) => {
                const hasProducts = msg.role === 'model' && msg.text.includes('/product/');

                return (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'max-w-[85%] bg-zinc-900 text-white rounded-br-sm'
                          : hasProducts
                          ? 'w-full max-w-[96%] sm:max-w-[92%] bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-100 rounded-bl-sm'
                          : 'max-w-[85%] bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-100 rounded-bl-sm'
                      }`}
                    >
                      {msg.role === 'model' ? (
                        <div className="space-y-3">
                          {parseMessageContent(msg.text).map((block, idx) => {
                            if (block.type === 'products') {
                              return (
                                <div key={`products-${idx}`} className="my-2.5">
                                  {block.items.length > 1 && (
                                    <div className="flex items-center justify-between pb-1.5 pt-0.5 text-xs text-zinc-500 font-medium border-b border-zinc-100 mb-2">
                                      <span className="flex items-center gap-1.5 text-zinc-700 font-semibold">
                                        <Package size={14} className="text-emerald-600" />
                                        Найденные товары ({block.items.length})
                                      </span>
                                      <span className="text-[11px] text-zinc-400 hidden sm:inline">
                                        Нажмите для перехода
                                      </span>
                                    </div>
                                  )}
                                  <div
                                    className={`grid gap-2.5 ${
                                      isFullScreen
                                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                        : 'grid-cols-1'
                                    }`}
                                  >
                                    {block.items.map((prod) => (
                                      <ProductChatItem key={prod.id + prod.name} item={prod} />
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <ReactMarkdown
                                key={`text-${idx}`}
                                components={{
                                  a: ({ href, children }) => (
                                    <Link
                                      href={href || '#'}
                                      className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700 font-medium"
                                    >
                                      {children}
                                    </Link>
                                  ),
                                  p: ({ children }) => (
                                    <p className="mb-2 last:mb-0 leading-relaxed whitespace-pre-line">{children}</p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
                                  ),
                                  li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                                  strong: ({ children }) => (
                                    <strong className="font-semibold text-zinc-900">{children}</strong>
                                  ),
                                  code: ({ children }) => (
                                    <code className="bg-zinc-100 text-zinc-700 px-1 py-0.5 rounded text-xs font-mono">
                                      {children}
                                    </code>
                                  ),
                                }}
                              >
                                {block.content}
                              </ReactMarkdown>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="whitespace-pre-line">{msg.text}</div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-sm ring-1 ring-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================================================= */}
          {/* РЕЖИМ 2: ОПЕРАТОР ПОДДЕРЖКИ (1С)                  */}
          {/* ================================================= */}
          {mode === 'operator' && (
            <>
              {/* Приветствие при отсутствии сообщений */}
              {operatorMessages.length === 0 && (
                <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Headphones size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-zinc-900">Чат с представителем компании</h4>
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                      Задайте любой вопрос по товарам, заказам, наличию или доставке. Наш оператор в 1С ответит
                      вам в режиме реального времени!
                    </p>
                  </div>
                  {user ? (
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-50 border border-zinc-200/60 px-3 py-1.5 text-xs text-zinc-600">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>
                        Вы авторизованы как <strong>{user.name}</strong>
                      </span>
                    </div>
                  ) : null}
                </div>
              )}

              {operatorMessages.map((msg) => {
                const isOp = msg.is_operator || msg.author === 'Оператор';

                return (
                  <div key={msg.id} className={`flex ${isOp ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[85%] ${
                        isOp
                          ? 'bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-200/70 rounded-bl-sm border-l-3 border-emerald-500'
                          : 'bg-zinc-900 text-white rounded-br-sm'
                      }`}
                    >
                      {isOp && (
                        <div className="flex items-center justify-between gap-2 pb-1 border-b border-zinc-100 mb-1.5">
                          <span className="text-[11px] font-bold text-emerald-800">
                            {msg.author_name || 'Оператор SmartMarket'}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      <div className="whitespace-pre-line text-sm">{msg.text}</div>
                      {!isOp && (
                        <div className="mt-1 text-right text-[10px] text-zinc-400">
                          {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isOperatorLoading && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-sm ring-1 ring-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3 text-xs text-zinc-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Отправка оператору...</span>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-zinc-100 bg-white p-4">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'operator' ? 'Напишите оператору компании...' : 'Спросите что-нибудь у консультанта...'
              }
              disabled={isAiLoading || isOperatorLoading}
              className="flex-1 rounded-full border-0 bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={(mode === 'ai' ? isAiLoading : isOperatorLoading) || !input.trim()}
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
