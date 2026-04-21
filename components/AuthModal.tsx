'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authService } from '../lib/1c/auth';
import { useAuthStore } from '../store/authStore';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { checkPasswordStrength } from '../lib/passwordStrength';

type Step = 'login' | 'register' | 'confirm' | 'forgot' | 'reset';

interface Props {
  onClose: () => void;
}

export function AuthModal({ onClose }: Props) {
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const clearError = () => setError('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      await authService.login(email, password);
      const profile = await authService.getProfile();
      setUser(profile);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPasswordStrength(password).isValid) {
      setError('Пароль не соответствует требованиям безопасности');
      return;
    }
    setLoading(true);
    clearError();
    try {
      await authService.register(email, password, name || undefined);
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      await authService.confirmEmail(email, code);
      const profile = await authService.getProfile();
      setUser(profile);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неверный код');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      await authService.forgotPassword(email);
      setStep('reset');
    } catch {
      setStep('reset');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPasswordStrength(newPassword).isValid) {
      setError('Пароль не соответствует требованиям безопасности');
      return;
    }
    setLoading(true);
    clearError();
    try {
      await authService.resetPassword(email, code, newPassword);
      const profile = await authService.getProfile();
      setUser(profile);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сброса пароля');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-zinc-200/50"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
        >
          <X size={18} />
        </button>

        <AnimatePresence mode="wait">
          {step === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="mb-1 text-2xl font-extrabold text-zinc-900">Вход</h2>
              <p className="mb-6 text-sm text-zinc-500">Войдите в свой аккаунт</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <InputField icon={<Mail size={16} />} type="email" placeholder="Email" value={email} onChange={setEmail} required />
                <div className="space-y-1">
                  <InputField
                    icon={<Lock size={16} />}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Пароль"
                    value={password}
                    onChange={setPassword}
                    required
                    toggleShow={() => setShowPassword((v) => !v)}
                    isShown={showPassword}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setStep('forgot'); clearError(); }}
                      className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      Забыли пароль?
                    </button>
                  </div>
                </div>
                {error && <ErrorMsg text={error} />}
                <SubmitButton loading={loading} label="Войти" />
              </form>
              <p className="mt-4 text-center text-sm text-zinc-500">
                Нет аккаунта?{' '}
                <button onClick={() => { setStep('register'); clearError(); }} className="font-bold text-emerald-600 hover:text-emerald-500">
                  Зарегистрироваться
                </button>
              </p>
            </motion.div>
          )}

          {step === 'register' && (
            <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="mb-1 text-2xl font-extrabold text-zinc-900">Регистрация</h2>
              <p className="mb-6 text-sm text-zinc-500">Создайте аккаунт — это бесплатно</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <InputField icon={<User size={16} />} type="text" placeholder="Имя (необязательно)" value={name} onChange={setName} />
                <InputField icon={<Mail size={16} />} type="email" placeholder="Email" value={email} onChange={setEmail} required />
                <InputField
                  icon={<Lock size={16} />}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Пароль (мин. 8 символов)"
                  value={password}
                  onChange={setPassword}
                  required
                  minLength={8}
                  toggleShow={() => setShowPassword((v) => !v)}
                  isShown={showPassword}
                />
                <PasswordStrengthMeter password={password} />
                {error && <ErrorMsg text={error} />}
                <SubmitButton loading={loading} label="Зарегистрироваться" />
              </form>
              <p className="mt-4 text-center text-sm text-zinc-500">
                Уже есть аккаунт?{' '}
                <button onClick={() => { setStep('login'); clearError(); }} className="font-bold text-emerald-600 hover:text-emerald-500">
                  Войти
                </button>
              </p>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="mb-1 text-2xl font-extrabold text-zinc-900">Подтверждение</h2>
              <p className="mb-6 text-sm text-zinc-500">
                Мы отправили 6-значный код на <span className="font-bold text-zinc-700">{email}</span>
              </p>
              <form onSubmit={handleConfirm} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
                {error && <ErrorMsg text={error} />}
                <SubmitButton loading={loading} label="Подтвердить" />
              </form>
              <p className="mt-4 text-center text-sm text-zinc-500">
                <button onClick={() => { setStep('register'); clearError(); setCode(''); }} className="font-bold text-emerald-600 hover:text-emerald-500">
                  Начать заново
                </button>
              </p>
            </motion.div>
          )}

          {step === 'forgot' && (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="mb-1 text-2xl font-extrabold text-zinc-900">Сброс пароля</h2>
              <p className="mb-6 text-sm text-zinc-500">Введите email — мы отправим код для сброса пароля</p>
              <form onSubmit={handleForgot} className="space-y-4">
                <InputField icon={<Mail size={16} />} type="email" placeholder="Email" value={email} onChange={setEmail} required />
                {error && <ErrorMsg text={error} />}
                <SubmitButton loading={loading} label="Отправить код" />
              </form>
              <p className="mt-4 text-center text-sm text-zinc-500">
                <button onClick={() => { setStep('login'); clearError(); }} className="font-bold text-emerald-600 hover:text-emerald-500">
                  Вернуться ко входу
                </button>
              </p>
            </motion.div>
          )}

          {step === 'reset' && (
            <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="mb-1 text-2xl font-extrabold text-zinc-900">Новый пароль</h2>
              <p className="mb-6 text-sm text-zinc-500">
                Введите код из письма и придумайте новый пароль
              </p>
              <form onSubmit={handleReset} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  required
                />
                <InputField
                  icon={<Lock size={16} />}
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Новый пароль (мин. 8 символов)"
                  value={newPassword}
                  onChange={setNewPassword}
                  required
                  minLength={8}
                  toggleShow={() => setShowNewPassword((v) => !v)}
                  isShown={showNewPassword}
                />
                <PasswordStrengthMeter password={newPassword} />
                {error && <ErrorMsg text={error} />}
                <SubmitButton loading={loading} label="Сохранить пароль" />
              </form>
              <p className="mt-4 text-center text-sm text-zinc-500">
                <button onClick={() => { setStep('forgot'); clearError(); setCode(''); setNewPassword(''); }} className="font-bold text-emerald-600 hover:text-emerald-500">
                  Запросить новый код
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>,
    document.body
  );
}

function InputField({
  icon, type, placeholder, value, onChange, required, minLength, toggleShow, isShown,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  toggleShow?: () => void;
  isShown?: boolean;
}) {
  const isPassword = toggleShow !== undefined;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Запрещаем пробелы в полях пароля
    const val = isPassword ? e.target.value.replace(/\s/g, '') : e.target.value;
    onChange(val);
  };
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
        minLength={minLength}
        className={`w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 text-sm font-medium text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all ${isPassword ? 'pr-10' : 'pr-4'}`}
      />
      {isPassword && (
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
          tabIndex={-1}
        >
          {isShown ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}

function ErrorMsg({ text }: { text: string }) {
  return (
    <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">{text}</p>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-zinc-700 disabled:opacity-60"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>{label}</span><ArrowRight size={16} /></>}
    </button>
  );
}
