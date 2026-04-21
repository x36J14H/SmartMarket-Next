'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { checkPasswordStrength, PASSWORD_RULES } from '../lib/passwordStrength';

// Tailwind требует полные имена классов — не генерировать динамически
const SEGMENT_COLORS: Record<number, string> = {
  1: 'bg-rose-500',
  2: 'bg-amber-400',
  3: 'bg-amber-400',
  4: 'bg-yellow-400',
  5: 'bg-emerald-500',
};

const STRENGTH_LABELS: Record<number, string> = {
  1: 'Очень слабый',
  2: 'Слабый',
  3: 'Средний',
  4: 'Хороший',
  5: 'Надёжный',
};

const STRENGTH_TEXT: Record<number, string> = {
  1: 'text-rose-500',
  2: 'text-amber-500',
  3: 'text-amber-500',
  4: 'text-yellow-500',
  5: 'text-emerald-600',
};

interface Props {
  password: string;
}

export function PasswordStrengthMeter({ password }: Props) {
  if (!password) return null;

  const { score, passed } = checkPasswordStrength(password);
  const segmentColor = SEGMENT_COLORS[score] ?? 'bg-zinc-200';

  return (
    <div className="space-y-2.5">
      {/* Полоска — 5 сегментов */}
      <div className="flex gap-1">
        {PASSWORD_RULES.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? segmentColor : 'bg-zinc-200'
            }`}
          />
        ))}
      </div>

      {/* Подпись */}
      {score > 0 && (
        <p className={`text-xs font-bold ${STRENGTH_TEXT[score]}`}>
          {STRENGTH_LABELS[score]}
        </p>
      )}

      {/* Чеклист */}
      <ul className="space-y-1">
        {PASSWORD_RULES.map((rule, i) => (
          <li key={rule.id} className="flex items-center gap-2">
            {passed[i] ? (
              <CheckCircle2 size={13} className="shrink-0 text-emerald-500" />
            ) : (
              <Circle size={13} className="shrink-0 text-zinc-300" />
            )}
            <span className={`text-xs font-medium ${passed[i] ? 'text-emerald-600' : 'text-zinc-400'}`}>
              {rule.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
