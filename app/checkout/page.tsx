'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../lib/utils';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(true);
  const payBtnRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setShowFloatingBar(!entry.isIntersecting), { threshold: 0 });
    if (payBtnRef.current) observer.observe(payBtnRef.current);
    return () => observer.disconnect();
  }, [items.length]);

  React.useEffect(() => {
    document.documentElement.classList.toggle('has-floating-bar', showFloatingBar);
    return () => document.documentElement.classList.remove('has-floating-bar');
  }, [showFloatingBar]);

  const [formData, setFormData] = useState({ name: '', phone: '', email: '', comment: '', delivery: 'courier', payment: 'online' });
  const deliveryCost = formData.delivery === 'courier' ? 500 : 0;
  const totalToPay = getTotalPrice() + deliveryCost;

  if (items.length === 0 && !showSuccessModal) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center bg-zinc-50">
        <div className="rounded-full bg-white p-8 shadow-sm ring-1 ring-zinc-200/50 mb-8">
          <ShoppingBag className="h-16 w-16 text-zinc-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Ваша корзина пуста</h2>
        <Link href="/catalog" className="mt-10 inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-zinc-800 hover:-translate-y-0.5">
          Перейти к покупкам
        </Link>
      </motion.div>
    );
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('7') || val.startsWith('8')) val = val.substring(1);
    let formatted = '+7 ';
    if (val.length > 0) formatted += `(${val.substring(0, 3)}`;
    if (val.length >= 3) formatted += `) ${val.substring(3, 6)}`;
    if (val.length >= 6) formatted += `-${val.substring(6, 8)}`;
    if (val.length >= 8) formatted += `-${val.substring(8, 10)}`;
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowSuccessModal(true);
    clearCart();
  };

  if (showSuccessModal) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center bg-zinc-50">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }} className="rounded-full bg-emerald-100 p-8 shadow-sm ring-1 ring-emerald-200/50">
          <CheckCircle2 className="h-16 w-16 text-emerald-600" />
        </motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 text-4xl font-extrabold text-zinc-900 tracking-tight">
          Заказ №{Math.floor(Math.random() * 10000) + 1000} успешно оформлен!
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 max-w-lg text-lg font-medium text-zinc-500">
          Спасибо за покупку. Мы отправили информацию о заказе на ваш email.
        </motion.p>
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} onClick={() => router.push('/')} className="mt-10 inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-zinc-800 hover:-translate-y-0.5">
          Вернуться на главную
        </motion.button>
      </motion.div>
    );
  }

  const inputClass = 'block w-full rounded-2xl border-zinc-200 px-4 py-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border bg-zinc-50 font-medium transition-all outline-none';
  const radioClass = (active: boolean) => `flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all ${active ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-200 hover:border-zinc-300'}`;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4 sm:py-8 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen">
      <div className="flex items-end justify-between border-b border-zinc-200/60 pb-4 mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">Оформление заказа</h1>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8 xl:gap-x-12">
        <section className="lg:col-span-7">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-zinc-200/60 bg-white p-6 sm:p-8 shadow-sm ring-1 ring-zinc-200/50">
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-6 sm:mb-8">Контактные данные</h2>
              <div className="grid grid-cols-1 gap-y-4 sm:gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-bold text-zinc-900 mb-2">Имя и фамилия</label>
                  <input type="text" id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Иван Иванов" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-zinc-900 mb-2">Телефон</label>
                  <input type="tel" id="phone" required value={formData.phone} onChange={handlePhoneChange} className={inputClass} placeholder="+7 (___) ___-__-__" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-zinc-900 mb-2">Email</label>
                  <input type="email" id="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="ivan@example.com" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="comment" className="block text-sm font-bold text-zinc-900 mb-2">Комментарий к заказу</label>
                  <textarea id="comment" rows={3} value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} className={inputClass} placeholder="Уточнения по доставке или заказу..." />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-zinc-200/60 bg-white p-6 sm:p-8 shadow-sm ring-1 ring-zinc-200/50">
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-6 sm:mb-8">Способ доставки</h2>
              <div className="space-y-3 sm:space-y-4">
                <label className={radioClass(formData.delivery === 'courier')}>
                  <div className="flex items-center">
                    <input type="radio" name="delivery" value="courier" checked={formData.delivery === 'courier'} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} className="h-5 w-5 border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                    <div className="ml-4"><span className="block text-sm font-bold text-zinc-900">Курьером до двери</span><span className="block text-sm font-medium text-zinc-500 mt-0.5">1-2 дня</span></div>
                  </div>
                  <span className="text-sm font-bold text-zinc-900">500 ₽</span>
                </label>
                <label className={radioClass(formData.delivery === 'pickup')}>
                  <div className="flex items-center">
                    <input type="radio" name="delivery" value="pickup" checked={formData.delivery === 'pickup'} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} className="h-5 w-5 border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                    <div className="ml-4"><span className="block text-sm font-bold text-zinc-900">Самовывоз из магазина</span><span className="block text-sm font-medium text-zinc-500 mt-0.5">Сегодня</span></div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">Бесплатно</span>
                </label>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl border border-zinc-200/60 bg-white p-6 sm:p-8 shadow-sm ring-1 ring-zinc-200/50">
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-6 sm:mb-8">Способ оплаты</h2>
              <div className="space-y-3 sm:space-y-4">
                <label className={radioClass(formData.payment === 'online')}>
                  <div className="flex items-center">
                    <input type="radio" name="payment" value="online" checked={formData.payment === 'online'} onChange={(e) => setFormData({ ...formData, payment: e.target.value })} className="h-5 w-5 border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                    <div className="ml-4"><span className="block text-sm font-bold text-zinc-900">Оплата картой онлайн</span><span className="block text-sm font-medium text-zinc-500 mt-0.5">Visa, Mastercard, МИР, SberPay</span></div>
                  </div>
                </label>
                <label className={radioClass(formData.payment === 'cash')}>
                  <div className="flex items-center">
                    <input type="radio" name="payment" value="cash" checked={formData.payment === 'cash'} onChange={(e) => setFormData({ ...formData, payment: e.target.value })} className="h-5 w-5 border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                    <div className="ml-4"><span className="block text-sm font-bold text-zinc-900">При получении</span><span className="block text-sm font-medium text-zinc-500 mt-0.5">Наличными или картой курьеру</span></div>
                  </div>
                </label>
              </div>
            </motion.div>
          </form>
        </section>

        <section className="mt-8 sm:mt-16 rounded-3xl bg-white p-6 sm:p-8 lg:col-span-5 lg:mt-0 shadow-sm ring-1 ring-zinc-200/50 sticky top-24">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-6 sm:mb-8">Ваш заказ</h2>
          <ul role="list" className="space-y-4 sm:space-y-6">
            {items.map((item) => (
              <li key={item.id} className="flex">
                <img src={item.imageUrl} alt={item.name} className="h-14 w-[42px] sm:h-16 sm:w-12 rounded-xl sm:rounded-2xl object-cover shadow-sm ring-1 ring-zinc-200/50" referrerPolicy="no-referrer" />
                <div className="ml-3 sm:ml-4 flex flex-1 flex-col justify-center">
                  <div className="flex justify-between text-sm sm:text-base font-bold text-zinc-900">
                    <h3 className="line-clamp-2">{item.name}</h3>
                    <p className="ml-4 whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-zinc-500">{item.quantity} шт.</p>
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-6 sm:mt-8 space-y-4 sm:space-y-5 text-sm font-medium text-zinc-600 border-t border-zinc-100 pt-6 sm:pt-8">
            <div className="flex items-center justify-between">
              <dt>Товары ({items.reduce((acc, item) => acc + item.quantity, 0)})</dt>
              <dd className="font-bold text-zinc-900">{formatPrice(getTotalPrice())}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Доставка</dt>
              <dd className="font-bold text-zinc-900">{deliveryCost > 0 ? formatPrice(deliveryCost) : 'Бесплатно'}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 sm:pt-6 mt-4 sm:mt-6">
              <dt className="text-base sm:text-lg font-extrabold text-zinc-900">Итого к оплате</dt>
              <dd className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">{formatPrice(totalToPay)}</dd>
            </div>
          </dl>
          <div className="mt-8 sm:mt-10">
            <button ref={payBtnRef} type="submit" form="checkout-form" disabled={isSubmitting} className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-emerald-600 hover:-translate-y-0.5 disabled:bg-emerald-400 disabled:hover:translate-y-0">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Оформление...
                </span>
              ) : 'Оплатить'}
            </button>
            <p className="mt-4 sm:mt-6 text-center text-[10px] sm:text-xs font-medium text-zinc-500">Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных</p>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showFloatingBar && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-zinc-200 p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] backdrop-blur-lg">
            <div className="flex items-center justify-between max-w-md mx-auto gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Итого</span>
                <span className="text-xl font-extrabold text-zinc-900 tracking-tight">{formatPrice(totalToPay)}</span>
              </div>
              <button type="submit" form="checkout-form" disabled={isSubmitting} className="flex-1 flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                {isSubmitting ? '...' : 'Оплатить'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
