import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | undefined | null) {
  const num = typeof price === 'number' ? price : Number(price);
  if (isNaN(num) || price === null || price === undefined) {
    return '0 ₽';
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Склонение слов после числительных в русском языке.
 * @example pluralize(1, ['отзыв', 'отзыва', 'отзывов']) => "1 отзыв"
 * @example pluralize(2, ['вопрос', 'вопроса', 'вопросов']) => "2 вопроса"
 * @example pluralize(5, ['вопрос', 'вопроса', 'вопросов']) => "5 вопросов"
 */
export function pluralize(count: number, words: [string, string, string], includeNumber = true): string {
  const abs = Math.abs(count) % 100;
  const num = abs % 10;
  let word = words[2];

  if (abs > 10 && abs < 20) {
    word = words[2];
  } else if (num > 1 && num < 5) {
    word = words[1];
  } else if (num === 1) {
    word = words[0];
  }

  return includeNumber ? `${count} ${word}` : word;
}

export function pluralizeReviews(count: number, includeNumber = true): string {
  return pluralize(count, ['отзыв', 'отзыва', 'отзывов'], includeNumber);
}

export function pluralizeQuestions(count: number, includeNumber = true): string {
  return pluralize(count, ['вопрос', 'вопроса', 'вопросов'], includeNumber);
}
