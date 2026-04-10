'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

type Message = { id: string; role: 'user' | 'model'; text: string };
type HistoryEntry = { role: string; parts: { text: string }[] };

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasFloatingBar, setHasFloatingBar] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: 'Привет! Я ИИ-помощник MarketMVP. Чем могу помочь?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const historyRef = useRef<HistoryEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const checkFloatingBar = () => setHasFloatingBar(document.documentElement.classList.contains('has-floating-bar'));
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
        body: JSON.stringify({
          message: userMessage.text,
          history: historyRef.current,
        }),
      });
      const data = await res.json();
      const text = data.text || 'Извините, не смог сгенерировать ответ.';

      historyRef.current = [
        ...historyRef.current,
        { role: 'user', parts: [{ text: userMessage.text }] },
        { role: 'model', parts: [{ text }] },
      ];

      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: 'Произошла ошибка. Попробуйте позже.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const bottomClass = hasFloatingBar ? 'bottom-[88px] sm:bottom-6' : 'bottom-6';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-900/20 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} ${bottomClass}`}
        aria-label="Открыть чат с ИИ"
      >
        <MessageCircle size={24} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white">1</span>
      </button>

      <div className={`fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-zinc-200/50 transition-all duration-500 ease-in-out ${
        isFullScreen
          ? 'bottom-0 right-0 w-full h-full max-h-none max-w-none rounded-none'
          : `right-6 w-[340px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[80vh] rounded-3xl origin-bottom-right ${bottomClass}`
      } ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'pointer-events-none scale-95 opacity-0 translate-y-4'}`}>
        <div className="flex items-center justify-between bg-zinc-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Bot size={22} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">ИИ-Консультант</h3>
              <p className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                В сети
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsFullScreen(!isFullScreen)} className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white">
              {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={() => { setIsOpen(false); setIsFullScreen(false); }} className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-50/50">
          <div className="flex flex-col gap-4 sm:gap-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] gap-3 rounded-3xl px-5 py-3.5 shadow-sm ${
                  msg.role === 'user' ? 'bg-zinc-900 text-white rounded-tr-sm' : 'bg-white text-zinc-800 border border-zinc-100 rounded-tl-sm'
                }`}>
                  {msg.role === 'model' && <div className="mt-0.5 flex-shrink-0 text-emerald-500"><Bot size={18} /></div>}
                  <div className={`text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'text-zinc-100' : 'text-zinc-700'}`}>
                    {msg.role === 'model' ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-strong:text-zinc-900">
                        <ReactMarkdown components={{
                          a: ({ href, children }) => (
                            <Link href={href || ''} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md no-underline hover:bg-emerald-100 transition-colors border border-emerald-200/50 my-0.5">
                              {children}<ExternalLink size={12} className="opacity-70" />
                            </Link>
                          ),
                          code: ({ children }) => (
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200/50 whitespace-nowrap">{children}</span>
                          ),
                        }}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    ) : msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="flex max-w-[85%] gap-3 rounded-3xl rounded-tl-sm bg-white px-5 py-4 text-zinc-800 shadow-sm border border-zinc-100">
                  <div className="mt-0.5 flex-shrink-0 text-emerald-500"><Bot size={18} /></div>
                  <div className="flex items-center gap-1.5 h-5">
                    {[0, 150, 300].map((delay) => (
                      <div key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-zinc-100 bg-white p-4">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Задайте вопрос о товарах..."
              className="flex-1 rounded-full border-0 bg-zinc-100 px-5 py-3.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-shadow"
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-all hover:bg-zinc-800 hover:scale-105 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:scale-100">
              <Send size={20} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
