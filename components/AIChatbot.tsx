'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Maximize2, Minimize2, Package, ArrowUpRight, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

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
  const PRODUCT_REGEX =
    /(?:^|\n)?\s*(?:[-*•]|\d+\.)?\s*\[([^\]]+)\]\((\/product\/[^)]+)\)(?:\s*(?:[—–\-:]|за|по цене|от)\s*([0-9\s]+(?:\s*(?:руб\.?|₽|USD|\$|EUR|€))?))?/gi;

  const matches: {
    start: number;
    end: number;
    item: ChatProductItem;
  }[] = [];

  let m: RegExpExecArray | null;
  while ((m = PRODUCT_REGEX.exec(text)) !== null) {
    const rawUrl = m[2].trim();
    const productId = rawUrl.replace(/^\/product\//, '');
    matches.push({
      start: m.index,
      end: PRODUCT_REGEX.lastIndex,
      item: {
        id: productId,
        name: m[1].trim(),
        url: rawUrl,
        price: m[3]?.trim() || '',
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

function ProductChatItem({ item }: { item: ChatProductItem }) {
  return (
    <Link
      href={item.url}
      className="group relative flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/90 bg-white p-3 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-50/10 hover:shadow-md active:translate-y-0"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors duration-200 group-hover:bg-emerald-500 group-hover:text-white">
          <Package size={20} className="transition-transform duration-200 group-hover:scale-110" />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2 transition-colors group-hover:text-emerald-700">
            {item.name}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
            В каталоге
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {item.price ? (
          <span className="inline-flex items-center rounded-xl bg-emerald-50 px-2.5 py-1 text-xs sm:text-sm font-bold text-emerald-800 ring-1 ring-inset ring-emerald-600/20 whitespace-nowrap shadow-2xs">
            {item.price}
          </span>
        ) : null}
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-all duration-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        >
          <ArrowUpRight size={16} />
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
    { id: 'welcome', role: 'model', text: 'Привет! Я ИИ-помощник MarketMVP. Чем могу помочь?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useRef('session-chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
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
      const text = data.text || 'Извините, не смог сгенерировать ответ.';
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'model', text: 'Произошла ошибка. Попробуйте позже.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const bottomClass = hasFloatingBar ? 'bottom-[88px] sm:bottom-6' : 'bottom-6';

  return (
    <>
      <button
        suppressHydrationWarning
        onClick={() => setIsOpen(true)}
        className={`fixed right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-900/20 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} ${bottomClass}`}
        aria-label="Открыть чат с ИИ"
      >
        <MessageCircle size={24} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white">
          1
        </span>
      </button>

      <div
        suppressHydrationWarning
        className={`fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-zinc-200/50 transition-all duration-500 ease-in-out ${
          isFullScreen
            ? 'bottom-0 right-0 w-full h-full max-h-none max-w-none rounded-none'
            : `right-4 sm:right-6 w-[360px] sm:w-[420px] md:w-[440px] max-w-[calc(100vw-2rem)] h-[560px] sm:h-[620px] max-h-[85vh] rounded-3xl origin-bottom-right ${bottomClass}`
        } ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'pointer-events-none scale-95 opacity-0 translate-y-4'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Bot size={22} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">ИИ-Консультант</h3>
              <p className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                В сети
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={() => { setIsOpen(false); setIsFullScreen(false); }}
              className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-zinc-50/50 space-y-4">
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
                                    <Sparkles size={14} className="text-emerald-500" />
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
