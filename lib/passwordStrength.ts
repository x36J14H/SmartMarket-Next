// Валидация сложности пароля — используется на фронте
// Те же правила что и на бэкенде 1С

export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length',   label: 'Минимум 8 символов',  test: (p) => p.length >= 8 },
  { id: 'upper',    label: 'Заглавная буква',      test: (p) => /[A-ZА-ЯЁ]/.test(p) },
  { id: 'digit',    label: 'Цифра',                test: (p) => /\d/.test(p) },
  { id: 'special',  label: 'Спецсимвол (!@#$…)',   test: (p) => /[^A-Za-zА-ЯЁа-яё0-9]/.test(p) },
  { id: 'nospaces', label: 'Без пробелов',         test: (p) => !/\s/.test(p) },
];

export interface PasswordStrength {
  score: number;      // 0–5
  passed: boolean[];
  isValid: boolean;   // все правила пройдены
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const passed = PASSWORD_RULES.map((r) => r.test(password));
  const score = passed.filter(Boolean).length;
  return { score, passed, isValid: score === PASSWORD_RULES.length };
}
