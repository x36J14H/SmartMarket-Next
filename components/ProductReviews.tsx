'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { StarRating } from './StarRating';
import { reviewsService, type Review, type ReviewsResponse } from '../lib/1c/reviews';
import { pluralizeReviews } from '../lib/utils';

interface ProductReviewsProps {
  productId: string;
  /** Передаётся если пользователь авторизован */
  isLoggedIn: boolean;
  /** Был ли товар куплен и получен пользователем */
  isPurchased?: boolean;
  canReview?: boolean;
  hasReview?: boolean;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ProductReviews({ productId, isLoggedIn, isPurchased = false, canReview = false, hasReview = false }: ProductReviewsProps) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  // Форма
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [locallySubmitted, setLocallySubmitted] = useState(false);

  const load = useCallback(async (p: number, append = false) => {
    try {
      const res = await reviewsService.getReviews(productId, { page: p, limit: 10 });
      setData((prev) =>
        append && prev
          ? { ...res, items: [...prev.items, ...res.items] }
          : res,
      );
    } catch {
      // не показываем ошибку — секция просто пустая
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
    if (rating === 0) { toast.error('Выберите оценку'); return; }
    if (!text.trim()) { toast.error('Напишите текст отзыва'); return; }
    if (text.trim().length > 1000) { toast.error('Текст отзыва не может превышать 1000 символов'); return; }
    setSubmitting(true);
    try {
      await reviewsService.submitReview(productId, { rating, text: text.trim().slice(0, 1000) });
      toast.success('Отзыв опубликован!');
      setShowForm(false);
      setLocallySubmitted(true);
      setRating(0);
      setText('');
      // Перезагружаем список
      setPage(1);
      setLoading(true);
      load(1);
    } catch (err: any) {
      toast.error(err?.message ?? 'Не удалось отправить отзыв');
    } finally {
      setSubmitting(false);
    }
  };

  const hasMore = data ? data.items.length < data.total : false;

  return (
    <section id="reviews" className="bg-white p-5 sm:p-10 rounded-3xl shadow-sm ring-1 ring-zinc-200/50">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">Отзывы</h2>
          {data && data.total > 0 && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star size={20} className="fill-current" />
                <span className="text-xl font-bold text-zinc-900">{data.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-zinc-400">{pluralizeReviews(data.total)}</span>
            </div>
          )}
        </div>
        {!isLoggedIn && (
          <p className="text-sm text-zinc-400">
            <a href="/profile" className="text-emerald-600 font-semibold hover:underline">Войдите</a>, чтобы оставить отзыв
          </p>
        )}
        {isLoggedIn && (hasReview || locallySubmitted) && (
          <p className="text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl ring-1 ring-emerald-100">
            Вы уже оставили отзыв на этот товар
          </p>
        )}
        {isLoggedIn && !hasReview && !locallySubmitted && isPurchased && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm px-5 py-2.5 rounded-2xl transition-colors"
          >
            {showForm ? 'Отмена' : 'Написать отзыв'}
          </button>
        )}
        {isLoggedIn && !hasReview && !locallySubmitted && !isPurchased && (
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xs sm:text-right">
            Оставить отзыв могут только покупатели, получившие этот товар
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
            <p className="font-bold text-zinc-900 mb-3">Ваша оценка *</p>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`${s} звёзд`}
                >
                  <Star
                    size={28}
                    className={s <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Расскажите о товаре — что понравилось, что нет..."
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
                Отправить отзыв
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
        <p className="text-sm text-zinc-400 py-4">Отзывов пока нет. Будьте первым!</p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-100">
          {data.items.map((review) => (
            <ReviewCard key={review.id} review={review} />
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

function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-5"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <p className="font-bold text-zinc-900 text-sm">{review.author}</p>
          <p className="text-xs text-zinc-400 mt-0.5">{formatDate(review.date)}</p>
        </div>
        <StarRating value={review.rating} size={15} />
      </div>
      <p className="text-sm text-zinc-700 leading-relaxed">{review.text}</p>
      {review.reply && (
        <div className="mt-3 bg-emerald-50 rounded-xl px-4 py-3 ring-1 ring-emerald-100">
          <p className="text-xs font-bold text-emerald-700 mb-1">Ответ магазина{review.replyDate ? ` · ${formatDate(review.replyDate)}` : ''}</p>
          <p className="text-sm text-zinc-700 leading-relaxed">{review.reply}</p>
        </div>
      )}
    </motion.div>
  );
}
