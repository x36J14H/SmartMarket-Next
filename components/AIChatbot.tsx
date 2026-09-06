'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Maximize2, Minimize2, Package, ArrowUpRight, ShoppingBag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { fetchProductBySlug } from '../lib/1c/catalog';
import { getProductImage, formatChatPrice } from '../lib/productMedia';
import type { Product } from '../types';

type Message = { id: string; role: 'user' | 'model'; text: string };

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
  // Поддерживает:
  // - [Название](/product/slug) 52,500 руб.
  // - [Название](/product/uuid) — 52 500 ₽
  // - [Название](/product/slug) : 52500 руб.
  // - [Название](/product/slug) (52,500 руб.)
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

    // Если между товарами есть осмысленный текст — сбрасываем группу товаров
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

// Кэш карточек товаров для мгновенного повторного рендера без лишних запросов
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

  // Выбираем фото: проверяем 1С фото, при ошибке или отсутствии — качественный fallback
  const raw1cImg = hasImgError ? undefined : product?.imageUrl;
  const imageSrc = getProductImage(item.id, item.name, raw1cImg);

  // Выбираем цену: либо из ответа чата, либо из полученной карточки 1С
  const displayPrice = item.price || (product?.price ? formatChatPrice(product.price) : '');

  return (
    <Link
      href={item.url}
      className="group relative flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/90 bg-white p-2.5 sm:p-3 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-50/10 hover:shadow-md active:translate-y-0"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Фотография товара */}
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
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasFloatingBar, setHasFloatingBar] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Привет! Я персональный ИИ-Консультант SmartMarket. Готов помочь подобрать идеальный товар, сравнить характеристики или найти максимальную выгоду. Чем могу помочь?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useRef('session-chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    '🎁 Подобрать подарок',
    '⚡ Лучшие скидки недели',
    '📱 Смартфоны до 40 000 ₽',
  ];

  useEffect(() => {
    sessionId.current = `session-${Date.now()}`;
  }, []);

  useEffect(() => {
    const checkFloatingBar = () =>
      setHasFloatingBar(document.documentElement.classList.contains('has-floating-bar'));
    const observer = new MutationObserver(checkFloatingBar);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    checkFloatingBar();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: textToSend.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text, session_id: sessionId.current }),
      });
      const data = await res.json();
      const text = data.text || 'Извините, не смог сформировать ответ. Попробуйте переформулировать вопрос.';
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'model', text: 'Произошла ошибка связи с сервером. Попробуйте позже.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const bottomClass = hasFloatingBar ? 'bottom-[88px] sm:bottom-6' : 'bottom-6';

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        suppressHydrationWarning
        onClick={() => setIsOpen(true)}
        className={`group fixed right-5 sm:right-6 z-40 flex h-14 items-center gap-2.5 rounded-full bg-zinc-950 pl-4 pr-5 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-zinc-900 focus:outline-none ring-1 ring-white/15 ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        } ${bottomClass}`}
        aria-label="Открыть чат с консультантом"
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
          <Bot size={18} />
        </div>
        <span className="font-bold text-xs sm:text-sm tracking-tight">Консультант</span>
      </button>

      {/* Chat Window */}
      <div
        suppressHydrationWarning
        className={`fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-zinc-200/80 transition-all duration-400 ease-out ${
          isFullScreen
            ? 'bottom-0 right-0 w-full h-full max-h-none max-w-none rounded-none'
            : `right-3 sm:right-6 w-[360px] sm:w-[440px] max-w-[calc(100vw-1.5rem)] h-[580px] sm:h-[640px] max-h-[85vh] rounded-3xl origin-bottom-right ${bottomClass}`
        } ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'pointer-events-none scale-95 opacity-0 translate-y-4'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-950 px-5 sm:px-6 py-4 text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm ring-2 ring-white/10">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight font-display">
                  Консультант SmartMarket
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Онлайн • Служба заботы
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={isFullScreen ? 'Свернуть экран' : 'Во весь экран'}
            >
              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={() => { setIsOpen(false); setIsFullScreen(false); }}
              className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Закрыть"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#fbfbfd] space-y-4">
          {/* Quick Prompts on initial welcome */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-1 pb-2">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-2xs hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/40 transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          {messages.map((msg) => {
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
                                  <span className="text-[11px] text-zinc-400 hidden sm:inline">Нажмите для перехода</span>
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
                              ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold text-zinc-900">{children}</strong>,
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

          {isLoading && (
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

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-zinc-100 bg-white p-4">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напишите сообщение..."
              disabled={isLoading}
              className="flex-1 rounded-full border-0 bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
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
