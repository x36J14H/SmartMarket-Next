'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CheckCircle2, ShoppingBag, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { ordersService, type Order, type OutOfStockItem } from '../../lib/1c/orders';
import { formatPrice } from '../../lib/utils';
import { AddressForm } from '../../components/AddressForm';

const DELIVERY_METHODS: Record<string, string> = {
  courier: 'КурьерскаяДоставка',
  pickup: 'Самовывоз',
  post: 'Почта',
};

const PAYMENT_METHODS: Record<string, string> = {
  online: 'ОнлайнОплата',
  cash: 'НаличныеПриПолучении',
  card: 'КартойПриПолучении',
  bank: 'БезналичныйРасчёт',
};

export default function CheckoutPage() {
  const { items, syncWithServer } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [outOfStock, setOutOfStock] = useState<OutOfStockItem[]>([]);
  const [showFloatingBar, setShowFloatingBar] = useState(true);
  const payBtnRef = React.useRef<HTMLButtonElement>(null);

  // Читаем выбранные id из sessionStorage (установлены на странице корзины)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('checkout_selected_ids');
      if (raw) {
        setSelectedIds(JSON.parse(raw) as string[]);
      }
    } catch {
      // ignore
    }
  }, []);

  // Товары для оформления: только выбранные (или все если ничего не выбрано)
  const checkoutItems = selectedIds.length > 0
    ? items.filter((i) => selectedIds.includes(i.id))
    : items;

  const getTotalPrice = () =>
    checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const [formData, setFormData] = useState({
    address: '',
    comment: '',
    delivery: 'courier',
    payment: 'online',
  });

  // Подставляем адрес из профиля
  useEffect(() => {
    if (user?.delivery_address) {
      setFormData((prev) => ({ ...prev, address: user.delivery_address ?? '' }));
    }
  }, [user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowFloatingBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (payBtnRef.current) observer.observe(payBtnRef.current);
    return () => observer.disconnect();
  }, [checkoutItems.length]);

  useEffect(() => {
    document.documentElement.classList.toggle('has-floating-bar', showFloatingBar);
    return () => document.documentElement.classList.remove('has-floating-bar');
  }, [showFloatingBar]);

  const deliveryCost = formData.delivery === 'courier' ? 500 : 0;
  const totalToPay = getTotalPrice() + deliveryCost;

  if (checkoutItems.length === 0 && !showSuccessModal) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center bg-zinc-50"
      >
        <div className="rounded-full bg-white p-8 shadow-sm ring-1 ring-zinc-200/50 mb-8">
          <ShoppingBag className="h-16 w-16 text-zinc-300" />
        </div>
        <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Ваша корзина пуста</h2>
        <Link
          href="/catalog"
          className="mt-10 inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-zinc-800 hover:-translate-y-0.5"
        >
          Перейти к покупкам
        </Link>
      </motion.div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOutOfStock([]);

    try {
      const order = await ordersService.createOrder({
        items: checkoutItems.map((i) => ({ id: i.id, qty: i.quantity })),
        delivery_address: formData.address || undefined,
        delivery_method: DELIVERY_METHODS[formData.delivery],
        payment_method: PAYMENT_METHODS[formData.payment],
        comment: formData.comment || undefined,
      });

      // 1С сам удаляет заказанные позиции из корзины — синхронизируем стор
      sessionStorage.removeItem('checkout_selected_ids');
      await syncWithServer();

      setCreatedOrder(order);
      setShowSuccessModal(true);
    } catch (err) {
      const e = err as Error & { out_of_stock?: OutOfStockItem[] };
      if (e.out_of_stock?.length) {
        setOutOfStock(e.out_of_stock);
        toast.error('Некоторых товаров нет в нужном количестве');
      } else if (e.message === 'unauthorized') {
        toast.error('Необходимо войти в аккаунт');
        router.push('/');
      } else {
        toast.error(e.message || 'Ошибка оформления заказа');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccessModal && createdOrder) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center bg-zinc-50"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
          className="rounded-full bg-emerald-100 p-8 shadow-sm ring-1 ring-emerald-200/50"
        >
          <CheckCircle2 className="h-16 w-16 text-emerald-600" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-4xl font-extrabold text-zinc-900 tracking-tight"
        >
          Заказ №{createdOrder.number} оформлен!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 max-w-lg text-lg font-medium text-zinc-500"
        >
          Сумма заказа: {formatPrice(createdOrder.total ?? createdOrder.total_amount ?? 0)}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex gap-4"
        >
          <button
            onClick={() => router.push('/profile')}
            className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-zinc-800 hover:-translate-y-0.5"
          >
            Мои заказы
          </button>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-8 py-4 text-base font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:-translate-y-0.5"
          >
            На главную
          </button>
        </motion.div>
      </motion.div>
    );
  }

  const inputClass =
    'block w-full rounded-2xl border-zinc-200 px-4 py-3 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm border bg-zinc-50 font-medium transition-all outline-none';
  const radioClass = (active: boolean) =>
    `flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all ${
      active ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-200 hover:border-zinc-300'
    }`;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4 sm:py-8 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen">
      <div className="flex items-end justify-between border-b border-zinc-200/60 pb-4 mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
          Оформление заказа
        </h1>
        {selectedIds.length > 0 && (
          <span className="text-zinc-500 font-medium mb-1 text-sm">
            {checkoutItems.length} из {items.length} товаров
          </span>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8 xl:gap-x-12">
        <section className="lg:col-span-7">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Контактные данные из профиля */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-zinc-200/60 bg-white p-6 sm:p-8 shadow-sm ring-1 ring-zinc-200/50"
            >
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-6 sm:mb-8">
                Контактные данные
              </h2>
              <div className="grid grid-cols-1 gap-y-4 sm:gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-zinc-900 mb-2">Имя</label>
                  <input
                    type="text"
                    readOnly
                    value={user?.name ?? ''}
                    className={`${inputClass} bg-zinc-100 text-zinc-500 cursor-not-allowed`}
                    placeholder="Не указано"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">Телефон</label>
                  <input
                    type="tel"
                    readOnly
                    value={user?.phone ?? ''}
                    className={`${inputClass} bg-zinc-100 text-zinc-500 cursor-not-allowed`}
                    placeholder="Не указан"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">Email</label>
                  <input
                    type="email"
                    readOnly
                    value={user?.email ?? ''}
                    className={`${inputClass} bg-zinc-100 text-zinc-500 cursor-not-allowed`}
                  />
                </div>
                {(!user?.name || !user?.phone) && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-2.5 font-medium">
                      Заполните имя и телефон в{' '}
                      <Link href="/profile" className="underline font-bold">
                        личном кабинете
                      </Link>{' '}
                      для более быстрого оформления.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Адрес доставки */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-3xl border border-zinc-200/60 bg-white p-6 sm:p-8 shadow-sm ring-1 ring-zinc-200/50"
            >
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-6 sm:mb-8">
                Адрес доставки
              </h2>
              <div className="space-y-4">
                <div>
                  <AddressForm
                    value={formData.address}
                    onChange={(newAddr) => setFormData((prev) => ({ ...prev, address: newAddr }))}
                  />
                  {user?.delivery_address && formData.address === user.delivery_address && (
                    <p className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                      Используется сохраненный адрес из профиля
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-bold text-zinc-900 mb-2">
                    Комментарий к заказу
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className={inputClass}
                    placeholder="Уточнения по доставке или заказу..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Способ доставки */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-zinc-200/60 bg-white p-6 sm:p-8 shadow-sm ring-1 ring-zinc-200/50"
            >
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-6 sm:mb-8">
                Способ доставки
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <label className={radioClass(formData.delivery === 'courier')}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="delivery"
                      value="courier"
                      checked={formData.delivery === 'courier'}
                      onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
                      className="h-5 w-5 border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="ml-4">
                      <span className="block text-sm font-bold text-zinc-900">Курьером до двери</span>
                      <span className="block text-sm font-medium text-zinc-500 mt-0.5">1–2 дня</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-zinc-900">500 ₽</span>
                </label>
                <label className={radioClass(formData.delivery === 'pickup')}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={formData.delivery === 'pickup'}
                      onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
                      className="h-5 w-5 border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="ml-4">
                      <span className="block text-sm font-bold text-zinc-900">Самовывоз из магазина</span>
                      <span className="block text-sm font-medium text-zinc-500 mt-0.5">Сегодня</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">Бесплатно</span>
                </label>
                <label className={radioClass(formData.delivery === 'post')}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="delivery"
                      value="post"
                      checked={formData.delivery === 'post'}
                      onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
                      className="h-5 w-5 border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="ml-4">
                      <span className="block text-sm font-bold text-zinc-900">Почта России</span>
                      <span className="block text-sm font-medium text-zinc-500 mt-0.5">5–14 дней</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-zinc-900">По тарифу</span>
                </label>
              </div>
            </motion.div>

            {/* Способ оплаты */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-zinc-200/60 bg-white p-6 sm:p-8 shadow-sm ring-1 ring-zinc-200/50"
            >
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-6 sm:mb-8">
                Способ оплаты
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { value: 'online', label: 'Картой онлайн', desc: 'Visa, Mastercard, МИР, SberPay' },
                  { value: 'cash', label: 'Наличными при получении', desc: 'Курьеру или в пункте выдачи' },
                  { value: 'card', label: 'Картой при получении', desc: 'Курьеру или в пункте выдачи' },
                  { value: 'bank', label: 'Безналичный расчёт', desc: 'Для юридических лиц' },
                ].map(({ value, label, desc }) => (
                  <label key={value} className={radioClass(formData.payment === value)}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value={value}
                        checked={formData.payment === value}
                        onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                        className="h-5 w-5 border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="ml-4">
                        <span className="block text-sm font-bold text-zinc-900">{label}</span>
                        <span className="block text-sm font-medium text-zinc-500 mt-0.5">{desc}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Ошибка нехватки товара */}
            <AnimatePresence>
              {outOfStock.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="rounded-3xl border border-rose-200 bg-rose-50 p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                    <h3 className="text-base font-bold text-rose-700">Недостаточно товара на складе</h3>
                  </div>
                  <ul className="space-y-2">
                    {outOfStock.map((item) => (
                      <li key={item.id} className="text-sm text-rose-600 font-medium">
                        <span className="font-bold">{item.name}</span>: запрошено {item.requested} шт.,
                        доступно {item.available} шт.
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-rose-500 font-medium">
                    Уменьшите количество этих товаров в корзине и попробуйте снова.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </section>

        {/* Сайдбар — итог */}
        <section className="mt-8 sm:mt-16 rounded-3xl bg-white p-6 sm:p-8 lg:col-span-5 lg:mt-0 shadow-sm ring-1 ring-zinc-200/50 sticky top-24">
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mb-6 sm:mb-8">
            Ваш заказ
          </h2>
          <ul role="list" className="space-y-4 sm:space-y-6">
            {checkoutItems.map((item) => (
              <li key={item.id} className="flex">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-14 w-[42px] sm:h-16 sm:w-12 rounded-xl sm:rounded-2xl object-cover shadow-sm ring-1 ring-zinc-200/50"
                  referrerPolicy="no-referrer"
                />
                <div className="ml-3 sm:ml-4 flex flex-1 flex-col justify-center">
                  <div className="flex justify-between text-sm sm:text-base font-bold text-zinc-900">
                    <h3 className="line-clamp-2">{item.name}</h3>
                    <p className="ml-4 whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-zinc-500">
                    {item.quantity} шт.
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <dl className="mt-6 sm:mt-8 space-y-4 sm:space-y-5 text-sm font-medium text-zinc-600 border-t border-zinc-100 pt-6 sm:pt-8">
            <div className="flex items-center justify-between">
              <dt>Товары ({checkoutItems.reduce((acc, i) => acc + i.quantity, 0)})</dt>
              <dd className="font-bold text-zinc-900">{formatPrice(getTotalPrice())}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Доставка</dt>
              <dd className="font-bold text-zinc-900">
                {deliveryCost > 0 ? formatPrice(deliveryCost) : 'Бесплатно'}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 sm:pt-6 mt-4 sm:mt-6">
              <dt className="text-base sm:text-lg font-extrabold text-zinc-900">Итого к оплате</dt>
              <dd className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                {formatPrice(totalToPay)}
              </dd>
            </div>
          </dl>
          <div className="mt-8 sm:mt-10">
            <button
              ref={payBtnRef}
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-4 text-base font-bold text-white shadow-md transition-all hover:bg-emerald-600 hover:-translate-y-0.5 disabled:bg-emerald-400 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Оформление...
                </span>
              ) : (
                'Оформить заказ'
              )}
            </button>
            <p className="mt-4 sm:mt-6 text-center text-[10px] sm:text-xs font-medium text-zinc-500">
              Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
            </p>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-zinc-200 p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] backdrop-blur-lg"
          >
            <div className="flex items-center justify-between max-w-md mx-auto gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Итого</span>
                <span className="text-xl font-extrabold text-zinc-900 tracking-tight">
                  {formatPrice(totalToPay)}
                </span>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                {isSubmitting ? '...' : 'Оформить'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
