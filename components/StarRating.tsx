'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;           // текущее значение 1-5
  onChange?: (v: number) => void; // если передан — интерактивный
  size?: number;
  className?: string;
}

export function StarRating({ value, onChange, size = 18, className = '' }: StarRatingProps) {
  const interactive = !!onChange;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={`transition-transform ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          aria-label={`${star} звезд`}
        >
          <Star
            size={size}
            className={
              star <= value
                ? 'fill-amber-400 text-amber-400'
                : 'text-zinc-300'
            }
          />
        </button>
      ))}
    </div>
  );
}
