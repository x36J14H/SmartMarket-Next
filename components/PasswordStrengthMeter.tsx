'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { checkPasswordStrength, PASSWORD_RULES } from '../lib/passwordStrength';

// 3 степени: слабый (красный), средний (жёлтый), надёжный (зелёный)
// score 0–5 (кол-во пройденных правил из 5)
// слабый:   1–2 правила  → 1 сегмент красный
// средний:  3–4 правила  → 2 сегмента жёлтых
// надёжный: 5 правил     → 3 сегмента зелёных

function getLevel(score: number): 0 | 1 | 2 | 3 {
  if (score === 0) return 0;
  if (score <= 2) return 1; // слабый
  if (score <= 4) return 2; // средний
  return 3;                 // надёжный
}

const LEVEL_COLOR = ['', 'bg-rose-500', 'bg-amber-400', 'bg-emerald-500'] as const;
const LEVEL_LABEL = ['', 'Слабый', 'Средний', 'Надёжный'] as const;
const LEVEL_TEXT  = ['', 'text-rose-500', 'text-amber-500', 'text-emerald-600'] as const;

interface Props {
  password: string;
}

export function PasswordStrengthMeter({ password }: Props) {
  if (!password) return null;

  const { score, passed } = checkPasswordStrength(password);
  const level = getLevel(score);

  return (
    <div className="space-y-2.5">
      {/* Полоска — 3 сегмента */}
      <div className="flex gap-1">
        {[1, 2, 3].map((seg) => (
          <div
            key={seg}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              seg <= level ? LEVEL_COLOR[level] : 'bg-zinc-200'
            }`}
          />
        ))}
      </div>

      {/* Подпись */}
      {level > 0 && (
        <p className={`text-xs font-bold ${LEVEL_TEXT[level]}`}>
          {LEVEL_LABEL[level]}
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
