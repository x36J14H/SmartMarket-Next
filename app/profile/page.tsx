'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Settings,
  Package,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  XCircle,
  ClipboardList,
  Cog,
  Send,
  Heart,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/1c/auth';
import { personalService } from '../../lib/1c/personal';
import { ordersService, type Order } from '../../lib/1c/orders';
import { PasswordStrengthMeter } from '../../components/PasswordStrengthMeter';
import { checkPasswordStrength } from '../../lib/passwordStrength';
import { FormActions } from '../../components/FormActions';
import { AddressForm } from '../../components/AddressForm';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const cartItemsCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const favoritesCount = useFavoritesStore((state) => state.favorites.length);

  useEffect(() => {
    // Редирект если не авторизован (после загрузки стора)
    if (user === null) {
      const timer = setTimeout(() => {
        if (!useAuthStore.getState().isLoading && !useAuthStore.getState().user) {
          router.push('/');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && activeTab === null) setActiveTab('personal');
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [activeTab]);

  // Загружаем заказы на верхнем уровне для счетчика в меню и шапке
  useEffect(() => {
    ordersService
      .getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Выполнен':
        return {
          label: 'Выполнен',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200/80',
          icon: <CheckCircle2 size={13} className="text-emerald-600" />,
        };
      case 'Отправлен':
        return {
          label: 'В пути',
          color: 'text-blue-700 bg-blue-50 border-blue-200/80',
          icon: <Truck size={13} className="text-blue-600" />,
        };
      case 'Подтверждён':
      case 'В обработке':
        return {
          label: status,
          color: 'text-amber-700 bg-amber-50 border-amber-200/80',
          icon: <Clock size={13} className="text-amber-600" />,
        };
      case 'Отменён':
        return {
          label: 'Отменён',
          color: 'text-rose-700 bg-rose-50 border-rose-200/80',
          icon: <XCircle size={13} className="text-rose-600" />,
        };
      default:
        return {
          label: status || 'Новый',
          color: 'text-zinc-700 bg-zinc-100 border-zinc-200',
          icon: <Clock size={13} className="text-zinc-500" />,
        };
    }
  };

  const menuItems = [
    {
      id: 'personal',
      label: 'Личные данные',
      icon: User,
      badge: null,
      description: 'Имя, телефон, адрес доставки',
    },
    {
      id: 'orders',
      label: 'Мои заказы',
      icon: Package,
      badge: orders.length > 0 ? String(orders.length) : null,
      description: 'История покупок и отслеживание',
    },
    {
      id: 'settings',
      label: 'Безопасность',
      icon: Shield,
      badge: null,
      description: 'Пароль и уведомления',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalTab />;
      case 'orders':
        return (
          <OrdersTab
            orders={orders}
            loading={ordersLoading}
            getStatusInfo={getStatusInfo}
            expandedOrder={expandedOrder}
            setExpandedOrder={setExpandedOrder}
          />
        );
      case 'settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="bg-[#fbfbfd] min-h-screen pb-16 sm:pb-24">
      {/* Top Banner & User Profile Hero */}
      <div className="border-b border-zinc-200/70 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* User Identity Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-2xl sm:text-3xl font-black text-white shadow-lg shadow-emerald-500/20 ring-4 ring-white">
                {userInitial}
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                  <CheckCircle2 size={12} />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 font-display">
                    {user?.name || 'Покупатель SmartMarket'}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    Клиент магазина
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm text-zinc-500 font-medium">
                  <Mail size={14} className="text-zinc-400" />
                  <span>{user?.email || 'Не указан'}</span>
                </div>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-md w-full self-stretch md:self-auto">
              {/* Orders Stat */}
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all text-center ${
                  activeTab === 'orders'
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                    : 'border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1 text-zinc-500 mb-1">
                  <Package size={14} />
                  <span className="text-[11px] font-semibold">Заказы</span>
                </div>
                <span className="text-lg sm:text-2xl font-black text-zinc-950 font-display tabular-nums">
                  {orders.length}
                </span>
              </button>

              {/* Favorites Stat */}
              <Link
                href="/favorites"
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300 transition-all text-center group"
              >
                <div className="flex items-center gap-1 text-zinc-500 mb-1 group-hover:text-rose-500 transition-colors">
                  <Heart size={14} />
                  <span className="text-[11px] font-semibold">Избранное</span>
                </div>
                <span className="text-lg sm:text-2xl font-black text-zinc-950 font-display tabular-nums group-hover:text-rose-600 transition-colors">
                  {favoritesCount}
                </span>
              </Link>

              {/* Cart Stat */}
              <Link
                href="/cart"
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300 transition-all text-center group"
              >
                <div className="flex items-center gap-1 text-zinc-500 mb-1 group-hover:text-emerald-600 transition-colors">
                  <ShoppingBag size={14} />
                  <span className="text-[11px] font-semibold">Корзина</span>
                </div>
                <span className="text-lg sm:text-2xl font-black text-zinc-950 font-display tabular-nums group-hover:text-emerald-600 transition-colors">
                  {cartItemsCount}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Mobile Header with back button */}
        {isMobile && activeTab && (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveTab(null)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm border border-zinc-200/80 text-zinc-700 active:scale-95 transition-all"
              aria-label="Назад к разделам"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                Личный кабинет
              </span>
              <h2 className="text-lg font-bold text-zinc-950">
                {menuItems.find((i) => i.id === activeTab)?.label}
              </h2>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 lg:gap-8 md:flex-row items-start">
          {/* Sidebar Menu */}
          <AnimatePresence mode="wait">
            {(!isMobile || !activeTab) && (
              <motion.aside
                initial={isMobile ? { opacity: 0, x: -20 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full shrink-0 md:w-80"
              >
                <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-3 shadow-sm">
                  <div className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    Навигация
                  </div>
                  <nav className="flex flex-col gap-1 mt-1">
                    {menuItems.map((item) => {
                      const isActive = activeTab === item.id;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`group flex items-center justify-between rounded-2xl p-3.5 text-left transition-all ${
                            isActive
                              ? 'bg-zinc-950 text-white shadow-md'
                              : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                isActive
                                  ? 'bg-white/15 text-emerald-400'
                                  : 'bg-zinc-100 text-zinc-600 group-hover:bg-emerald-50 group-hover:text-emerald-600'
                              }`}
                            >
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-sm font-bold truncate">
                                {item.label}
                              </span>
                              <span
                                className={`block text-[11px] truncate mt-0.5 ${
                                  isActive ? 'text-zinc-400' : 'text-zinc-400'
                                }`}
                              >
                                {item.description}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pl-2 shrink-0">
                            {item.badge && (
                              <span
                                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold tabular-nums ${
                                  isActive
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-zinc-100 text-zinc-600 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight
                              size={16}
                              className={`transition-transform ${
                                isActive
                                  ? 'text-zinc-400 translate-x-0.5'
                                  : 'text-zinc-300 group-hover:text-zinc-500'
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </nav>

                  {/* Divider */}
                  <div className="h-px bg-zinc-100 my-2 mx-3" />

                  {/* Logout Button */}
                  <button
                    onClick={async () => {
                      await logout();
                      router.push('/');
                    }}
                    className="flex w-full items-center justify-between rounded-2xl p-3.5 text-sm font-bold text-rose-600 transition-all hover:bg-rose-50/80 active:scale-98"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <LogOut size={18} />
                      </div>
                      <span className="text-sm font-bold">Выйти из аккаунта</span>
                    </div>
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <AnimatePresence mode="wait">
            {activeTab && (
              <motion.div
                key={activeTab}
                initial={isMobile ? { opacity: 0, x: 20 } : { opacity: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={isMobile ? { opacity: 0, x: 20 } : { opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 w-full rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-10 shadow-sm"
              >
                {renderContent()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PersonalTab() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.delivery_address ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setPhone(user.phone ?? '');
      setAddress(user.delivery_address ?? '');
    }
  }, [user]);

  const isDirty =
    name !== (user?.name ?? '') ||
    phone !== (user?.phone ?? '') ||
    address !== (user?.delivery_address ?? '');

  const handleReset = () => {
    setName(user?.name ?? '');
    setPhone(user?.phone ?? '');
    setAddress(user?.delivery_address ?? '');
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const patch: Record<string, string> = {};
    if (name !== (user?.name ?? '')) patch.name = name;
    if (phone !== (user?.phone ?? '')) patch.phone = phone;
    if (address !== (user?.delivery_address ?? '')) patch.delivery_address = address;

    try {
      await personalService.updateProfile(patch);
      setUser({
        ...user!,
        ...patch,
        delivery_address: patch.delivery_address ?? user?.delivery_address,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Header */}
      <div className="border-b border-zinc-100 pb-5">
        <h2 className="text-2xl font-extrabold text-zinc-950 font-display tracking-tight">
          Личные данные
        </h2>
        <p className="mt-1 text-sm text-zinc-500 font-normal">
          Управляйте контактной информацией и сохраненными адресами доставки
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* Section 1: Contacts */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Контактная информация
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-900">
                Имя и фамилия
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSuccess(false);
                  }}
                  placeholder="Ваше имя"
                  className="w-full rounded-2xl border border-zinc-200/90 bg-zinc-50/70 py-3 pl-10 pr-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-zinc-900">
                Номер телефона
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setSuccess(false);
                  }}
                  placeholder="+7 (900) 000-00-00"
                  className="w-full rounded-2xl border border-zinc-200/90 bg-zinc-50/70 py-3 pl-10 pr-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-900">
                Электронная почта
              </label>
              <span className="text-[11px] font-semibold text-zinc-400">
                Используется для авторизации
              </span>
            </div>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-100/80 py-3 pl-10 pr-4 text-sm font-medium text-zinc-500 cursor-not-allowed select-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Delivery Address */}
        <div className="space-y-4 pt-2 border-t border-zinc-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Адрес доставки по умолчанию
          </h3>
          <div>
            <AddressForm
              value={address}
              onChange={(newAddr) => {
                setAddress(newAddr);
                setSuccess(false);
              }}
            />
            <p className="mt-2 text-xs text-zinc-400 font-medium">
              Этот адрес будет автоматически подставляться в корзине при оформлении заказов
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700">
            <XCircle size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-800">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>Личные данные успешно обновлены</span>
          </div>
        )}

        {/* Form Save Actions */}
        {isDirty && <FormActions loading={loading} onCancel={handleReset} />}
      </form>
    </div>
  );
}

// Этапы заказа в порядке прохождения
const ORDER_STEPS = [
  { key: 'Новый', label: 'Принят', icon: ClipboardList },
  { key: 'Подтверждён', label: 'Подтверждён', icon: CheckCircle2 },
  { key: 'В обработке', label: 'Собирается', icon: Cog },
  { key: 'Отправлен', label: 'В пути', icon: Send },
  { key: 'Выполнен', label: 'Доставлен', icon: Truck },
] as const;

function OrderStatusTracker({ status }: { status: string }) {
  const isCancelled = status === 'Отменён';

  const currentIdx = isCancelled
    ? -1
    : Math.max(ORDER_STEPS.findIndex((s) => s.key === status), 0);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl bg-rose-50 border border-rose-200/80 px-4 py-3">
        <XCircle size={16} className="text-rose-500 shrink-0" />
        <span className="text-sm font-bold text-rose-700">Заказ отменён</span>
      </div>
    );
  }

  return (
    <div className="py-3 px-2">
      <div className="relative flex items-center justify-between">
        {/* Фоновая линия */}
        <div className="absolute left-4 right-4 top-1/2 h-1 -translate-y-1/2 bg-zinc-100 rounded-full" />

        {/* Заполненная линия */}
        <motion.div
          className="absolute left-4 top-1/2 h-1 -translate-y-1/2 bg-emerald-500 rounded-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: currentIdx / (ORDER_STEPS.length - 1) }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ width: 'calc(100% - 32px)' }}
        />

        {/* Точки */}
        {ORDER_STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 transition-all shadow-2xs ${
                  done
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : active
                    ? 'border-emerald-500 bg-white text-emerald-600 shadow-md shadow-emerald-500/20'
                    : 'border-zinc-200 bg-white text-zinc-300'
                }`}
              >
                {done ? <CheckCircle2 size={15} /> : <Icon size={14} />}
              </div>

              <span
                className={`text-[10px] sm:text-xs font-bold text-center leading-tight max-w-[56px] sm:max-w-[70px] ${
                  done || active ? 'text-zinc-900' : 'text-zinc-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrdersTab({
  orders,
  loading,
  getStatusInfo,
  expandedOrder,
  setExpandedOrder,
}: {
  orders: Order[];
  loading: boolean;
  getStatusInfo: (status: string) => {
    label: string;
    color: string;
    icon: React.ReactNode;
  };
  expandedOrder: string | null;
  setExpandedOrder: (id: string | null) => void;
}) {
  const [orderDetails, setOrderDetails] = useState<Record<string, Order>>({});
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    if (expandedOrder === id) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(id);
    if (orderDetails[id]) return;

    setLoadingDetail(id);
    try {
      const detail = await ordersService.getOrder(id);
      setOrderDetails((prev) => ({ ...prev, [id]: detail }));
    } catch {
      // Показываем доступные данные
    } finally {
      setLoadingDetail(null);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return '';
    try {
      let d: Date;
      const match = typeof iso === 'string' && /\/Date\((\d+)(?:[+-]\d+)?\)\//.exec(iso);
      if (match) {
        d = new Date(parseInt(match[1], 10));
      } else {
        d = new Date(iso);
      }
      if (isNaN(d.getTime())) {
        return iso;
      }
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-950 font-display tracking-tight">
            История заказов
          </h2>
          <p className="mt-1 text-sm text-zinc-500 font-normal">
            Отслеживайте статусы доставок и просматривайте детали предыдущих покупок
          </p>
        </div>
        {orders.length > 0 && (
          <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
            Всего: {orders.length}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 gap-3">
          <Loader2 size={32} className="animate-spin text-emerald-500" />
          <span className="text-sm font-medium">Загружаем ваши заказы...</span>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-zinc-200/80 rounded-3xl p-8 bg-zinc-50/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/60 mb-4 text-zinc-400">
            <Package size={28} />
          </div>
          <h3 className="text-lg font-extrabold text-zinc-900 font-display">
            Заказов пока нет
          </h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm font-normal">
            Вы еще не оформляли покупки в нашем магазине. Самое время выбрать качественные товары со склада!
          </p>
          <Link
            href="/catalog"
            className="shimmer-btn mt-6 inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-zinc-800 transition-all"
          >
            <span>Перейти в каталог</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const status = getStatusInfo(order.status);
          const isExpanded = expandedOrder === order.id;
          const detail = orderDetails[order.id];
          const isLoadingDetail = loadingDetail === order.id;

          return (
            <div
              key={order.id}
              className={`overflow-hidden rounded-3xl border transition-all ${
                isExpanded
                  ? 'border-emerald-500/40 shadow-md ring-1 ring-emerald-500/20'
                  : 'border-zinc-200/80 bg-white hover:border-zinc-300'
              }`}
            >
              {/* Collapsed Card Summary */}
              <button
                onClick={() => handleToggle(order.id)}
                className="flex w-full items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-zinc-50/50"
              >
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
                    <Package size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-extrabold text-base text-zinc-950 font-display tracking-tight">
                        Заказ №{order.number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${status.color}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-zinc-400 mt-1 block">
                      от {formatDate(order.date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Сумма
                    </span>
                    <span className="text-base sm:text-lg font-black text-zinc-950 font-display tabular-nums">
                      {formatPrice(order.total ?? order.total_amount ?? 0)}
                    </span>
                  </div>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 transition-transform duration-300 ${
                      isExpanded ? 'rotate-90 bg-emerald-50 text-emerald-600' : ''
                    }`}
                  >
                    <ChevronRight size={18} />
                  </div>
                </div>
              </button>

              {/* Expanded Card Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-zinc-100 bg-zinc-50/40"
                  >
                    <div className="p-5 sm:p-7 space-y-6">
                      {/* Visual Status Progression Tracker */}
                      <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-2xs">
                        <OrderStatusTracker status={order.status} />
                      </div>

                      {isLoadingDetail ? (
                        <div className="flex justify-center py-6">
                          <Loader2 size={24} className="animate-spin text-emerald-500" />
                        </div>
                      ) : detail?.items ? (
                        <div className="space-y-6">
                          {/* Items List */}
                          <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-2xs">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-4">
                              Состав заказа ({detail.items.length}{' '}
                              {detail.items.length === 1 ? 'позиция' : 'позиции'})
                            </h4>
                            <div className="divide-y divide-zinc-100">
                              {detail.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0"
                                >
                                  <div className="pr-4">
                                    <span className="font-bold text-zinc-900 block text-sm leading-snug">
                                      {item.name}
                                    </span>
                                    <span className="text-xs text-zinc-500 mt-0.5 block font-medium">
                                      {item.qty} шт. × {formatPrice(item.price)}
                                    </span>
                                  </div>
                                  <span className="font-extrabold text-zinc-950 tabular-nums shrink-0">
                                    {formatPrice(item.sum)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Total Line */}
                            <div className="flex justify-between items-center pt-4 mt-4 border-t border-zinc-100">
                              <span className="text-sm font-bold text-zinc-900">
                                Итого к оплате
                              </span>
                              <span className="text-xl font-black text-zinc-950 font-display tabular-nums">
                                {formatPrice(detail.total ?? detail.total_amount ?? 0)}
                              </span>
                            </div>
                          </div>

                          {/* Delivery & Payment Badges */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {detail.delivery_address && (
                              <div className="flex items-start gap-3 rounded-2xl bg-white p-4 border border-zinc-200/80 shadow-2xs">
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                                  <MapPin size={18} />
                                </div>
                                <div className="text-xs">
                                  <span className="font-bold text-zinc-900 block mb-0.5">
                                    Адрес доставки
                                  </span>
                                  <span className="text-zinc-500 leading-relaxed font-medium">
                                    {detail.delivery_address}
                                  </span>
                                </div>
                              </div>
                            )}

                            {detail.payment_method && (
                              <div className="flex items-start gap-3 rounded-2xl bg-white p-4 border border-zinc-200/80 shadow-2xs">
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                                  <CreditCard size={18} />
                                </div>
                                <div className="text-xs">
                                  <span className="font-bold text-zinc-900 block mb-0.5">
                                    Способ оплаты
                                  </span>
                                  <span className="text-zinc-500 leading-relaxed font-medium">
                                    {detail.payment_method}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-zinc-200/80">
                          <span className="text-sm font-bold text-zinc-900">Сумма заказа</span>
                          <span className="text-lg font-black text-zinc-950 tabular-nums">
                            {formatPrice(order.total ?? order.total_amount ?? 0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPasswordStrength(newPassword).isValid) {
      setError('Новый пароль не соответствует требованиям надежности');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка смены пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="border-b border-zinc-100 pb-5">
        <h2 className="text-2xl font-extrabold text-zinc-950 font-display tracking-tight">
          Безопасность и настройки
        </h2>
        <p className="mt-1 text-sm text-zinc-500 font-normal">
          Управляйте параметрами входа, безопасностью пароля и системными уведомлениями
        </p>
      </div>

      {/* Notifications Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Каналы уведомлений
        </h3>
        <div className="space-y-3">
          {[
            {
              id: 'email_notif',
              label: 'Email-уведомления о заказах',
              desc: 'Чеки, изменение статусов сборки и доставки',
            },
            {
              id: 'promo_notif',
              label: 'Скидки и персональные предложения',
              desc: 'Информация о закрытых распродажах со склада',
            },
          ].map(({ id, label, desc }) => (
            <div
              key={id}
              className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white transition-colors"
            >
              <div className="pr-4">
                <p className="font-bold text-zinc-900 text-sm">{label}</p>
                <p className="text-xs font-medium text-zinc-500 mt-0.5">{desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center shrink-0">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-5 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 shadow-inner" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Password Security Section */}
      <div className="space-y-4 pt-4 border-t border-zinc-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Смена пароля
        </h3>

        {success && !showForm && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-semibold text-emerald-800">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Пароль успешно обновлен. Используйте новый пароль при следующем входе.</span>
          </div>
        )}

        {!showForm ? (
          <div className="flex items-center justify-between p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50">
            <div>
              <p className="font-bold text-zinc-900 text-sm">Пароль учетной записи</p>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">
                Рекомендуем периодически обновлять пароль для защиты ваших покупок
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setSuccess(false);
              }}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 active:scale-95 transition-all shrink-0 ml-4 shadow-sm"
            >
              Сменить пароль
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-zinc-200 p-6 bg-white shadow-sm">
            <PasswordField
              label="Текущий пароль"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
            />
            <PasswordField
              label="Новый пароль"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
              minLength={8}
              hint="Минимум 8 символов, включая буквы и цифры"
            />
            <PasswordStrengthMeter password={newPassword} />

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-semibold text-rose-700">
                <XCircle size={15} className="shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <FormActions
                loading={loading}
                onCancel={() => {
                  setShowForm(false);
                  setError('');
                  setCurrentPassword('');
                  setNewPassword('');
                }}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  minLength,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  minLength?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-zinc-900">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\s/g, ''))}
          required
          minLength={minLength}
          className="w-full rounded-2xl border border-zinc-200/90 bg-zinc-50/70 py-3 pl-4 pr-10 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-1"
          aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-zinc-400 font-medium">{hint}</p>}
    </div>
  );
}
