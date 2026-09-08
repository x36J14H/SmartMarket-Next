'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { reviewsService, type Question, type QuestionsResponse } from '../lib/1c/reviews';
import { pluralizeQuestions } from '../lib/utils';

interface ProductQuestionsProps {
  productId: string;
  isLoggedIn: boolean;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ProductQuestions({ productId, isLoggedIn }: ProductQuestionsProps) {
  const [data, setData] = useState<QuestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (p: number, append = false) => {
    try {
      const res = await reviewsService.getQuestions(productId, { page: p, limit: 10 });
      setData((prev) =>
        append && prev
          ? { ...res, items: [...prev.items, ...res.items] }
          : res,
      );
    } catch {
      // секция просто остаётся пустой
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [productId]);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    load(1);
    return () => ctrl.abort();
  }, [productId, load]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    load(nextPage, true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { toast.error('Напишите текст вопроса'); return; }
    if (text.trim().length > 1000) { toast.error('Текст вопроса не может превышать 1000 символов'); return; }
    setSubmitting(true);
    try {
      await reviewsService.submitQuestion(productId, { text: text.trim().slice(0, 1000) });
      toast.success('Вопрос отправлен!');
      setShowForm(false);
      setText('');
      setPage(1);
      setLoading(true);
      load(1);
    } catch (err: any) {
      toast.error(err?.message ?? 'Не удалось отправить вопрос');
    } finally {
      setSubmitting(false);
    }
  };

  const hasMore = data ? data.items.length < data.total : false;

  return (
    <section id="questions" className="bg-white p-5 sm:p-10 rounded-3xl shadow-sm ring-1 ring-zinc-200/50">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">Вопросы и ответы</h2>
          {data && data.total > 0 && (
            <p className="mt-1 text-sm text-zinc-400">{pluralizeQuestions(data.total)}</p>
          )}
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="shrink-0 flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm px-5 py-2.5 rounded-2xl transition-colors"
          >
            <MessageCircle size={15} />
            {showForm ? 'Отмена' : 'Задать вопрос'}
          </button>
        )}
        {!isLoggedIn && (
          <p className="text-sm text-zinc-400">
            <a href="/profile" className="text-emerald-600 font-semibold hover:underline">Войдите</a>, чтобы задать вопрос
          </p>
        )}
      </div>

      {/* Форма */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="mb-8 bg-zinc-50 rounded-2xl p-5 ring-1 ring-zinc-200/60"
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Ваш вопрос о товаре..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-zinc-400">{text.length}/1000</span>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-sm px-6 py-2.5 rounded-2xl transition-colors"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Отправить вопрос
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Список */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : !data || data.total === 0 ? (
        <p className="text-sm text-zinc-400 py-4">Вопросов пока нет. Задайте первый!</p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-100">
          {data.items.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-semibold text-zinc-600 hover:text-emerald-600 transition-colors"
        >
          {loadingMore ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
          Показать ещё
        </button>
      )}
    </section>
  );
}

function QuestionCard({ question }: { question: Question }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-5"
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5">
          <MessageCircle size={13} className="text-zinc-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-bold text-zinc-900 text-sm">{question.author}</span>
            <span className="text-xs text-zinc-400">{formatDate(question.date)}</span>
          </div>
          <p className="text-sm text-zinc-700 leading-relaxed">{question.text}</p>
          {question.reply && (
            <div className="mt-3 bg-emerald-50 rounded-xl px-4 py-3 ring-1 ring-emerald-100">
              <p className="text-xs font-bold text-emerald-700 mb-1">
                Ответ магазина{question.replyDate ? ` · ${formatDate(question.replyDate)}` : ''}
              </p>
              <p className="text-sm text-zinc-700 leading-relaxed">{question.reply}</p>
            </div>
          )}
          {!question.reply && (
            <p className="mt-2 text-xs text-zinc-400 italic">Ожидает ответа</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
