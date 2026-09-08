'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Star,
  MessageSquare,
  HelpCircle,
  Sparkles,
  X,
  ExternalLink,
  RefreshCw,
  ThumbsUp,
  MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, pluralizeReviews, pluralizeQuestions } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/1c/auth';
import {
  personalService,
  normalizePersonalImageUrl,
  type PurchasedProduct,
  type UserReviewItem,
  type UserQuestionItem,
} from '../../lib/1c/personal';
import { reviewsService } from '../../lib/1c/reviews';
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

  const [purchases, setPurchases] = useState<PurchasedProduct[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(true);

  const [reviews, setReviews] = useState<UserReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [questions, setQuestions] = useState<UserQuestionItem[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  const [reviewModalProduct, setReviewModalProduct] = useState<PurchasedProduct | null>(null);
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

  const loadData = useCallback(() => {
    ordersService
      .getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setOrdersLoading(false));

    personalService
      .getPurchasedProducts()
      .then((items) => {
        setPurchases(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        setPurchases([]);
      })
      .finally(() => setPurchasesLoading(false));

    personalService
      .getMyReviews()
      .then((items) => {
        setReviews(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        setReviews([]);
      })
      .finally(() => setReviewsLoading(false));

    personalService
      .getMyQuestions()
      .then((items) => {
        setQuestions(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        setQuestions([]);
      })
      .finally(() => setQuestionsLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Синхронизация и дополнение купленных товаров данными из отзывов и заказов
  useEffect(() => {
    if (purchasesLoading || reviewsLoading) return;

    setPurchases((prevPurchases) => {
      const updated = [...prevPurchases];
      let changed = false;

      // 1. Помечаем hasReview для товаров, по которым уже есть отзывы
      const reviewsByProduct = new Map<string, typeof reviews[0]>();
      reviews.forEach((r) => {
        if (r.productId) reviewsByProduct.set(r.productId.toLowerCase(), r);
        if (r.productSlug) reviewsByProduct.set(r.productSlug.toLowerCase(), r);
        if (r.productName) reviewsByProduct.set(r.productName.trim().toLowerCase(), r);
      });

      const findReview = (id?: string, slug?: string, name?: string) => {
        if (id && reviewsByProduct.has(id.toLowerCase())) return reviewsByProduct.get(id.toLowerCase());
        if (slug && reviewsByProduct.has(slug.toLowerCase())) return reviewsByProduct.get(slug.toLowerCase());
        if (name && reviewsByProduct.has(name.trim().toLowerCase())) return reviewsByProduct.get(name.trim().toLowerCase());
        return undefined;
      };

      updated.forEach((p, idx) => {
        const rev = findReview(p.id, p.slug, p.name);
        if (rev && !p.hasReview) {
          updated[idx] = {
            ...p,
            hasReview: true,
            reviewId: rev.id,
            reviewRating: rev.rating,
            reviewText: rev.text,
          };
          changed = true;
        }
      });

      // 2. Если есть отзывы на товары, которых вообще нет в списке purchases, добавляем их
      const existingKeys = new Set<string>();
      updated.forEach((p) => {
        if (p.id) existingKeys.add(p.id.toLowerCase());
        if (p.slug) existingKeys.add(p.slug.toLowerCase());
        if (p.name) existingKeys.add(p.name.trim().toLowerCase());
      });

      reviews.forEach((rev) => {
        const keyId = rev.productId ? rev.productId.toLowerCase() : '';
        const keyName = rev.productName ? rev.productName.trim().toLowerCase() : '';
        const keySlug = rev.productSlug ? rev.productSlug.toLowerCase() : '';
        const alreadyExists = (keyId && existingKeys.has(keyId)) ||
                              (keyName && existingKeys.has(keyName)) ||
                              (keySlug && existingKeys.has(keySlug));

        if (!alreadyExists && (rev.productId || rev.productName)) {
          if (keyId) existingKeys.add(keyId);
          if (keyName) existingKeys.add(keyName);
          if (keySlug) existingKeys.add(keySlug);
          updated.push({
            id: rev.productId || `rev-prod-${rev.id}`,
            name: rev.productName || 'Товар',
            article: '',
            slug: rev.productSlug || rev.productId || '',
            price: 0,
            totalQty: 1,
            orderDate: rev.date || new Date().toISOString(),
            orderNumber: '',
            imageUrl: rev.productImageUrl || '',
            hasReview: true,
            reviewId: rev.id,
            reviewRating: rev.rating,
            reviewText: rev.text,
          });
          changed = true;
        }
      });

      // 3. Fallback: извлечение из заказов, если в них присутствуют позиции items
      orders.forEach((ord) => {
        if (ord.status === 'Отменён') return;
        ord.items?.forEach((item) => {
          const itemId = item.id ? item.id.toLowerCase() : '';
          const itemName = item.name ? item.name.trim().toLowerCase() : '';
          const alreadyExists = (itemId && existingKeys.has(itemId)) || (itemName && existingKeys.has(itemName));

          if (!alreadyExists && (item.id || item.name)) {
            if (itemId) existingKeys.add(itemId);
            if (itemName) existingKeys.add(itemName);
            const rev = findReview(item.id, undefined, item.name);
            updated.push({
              id: item.id || `order-item-${ord.id}`,
              name: item.name,
              article: '',
              slug: item.id,
              price: item.price,
              totalQty: item.qty,
              orderDate: ord.date,
              orderNumber: ord.number,
              imageUrl: '',
              hasReview: !!rev,
              reviewId: rev?.id,
              reviewRating: rev?.rating,
              reviewText: rev?.text,
            });
            changed = true;
          }
        });
      });

      return changed ? updated : prevPurchases;
    });
  }, [purchasesLoading, reviewsLoading, reviews, orders]);

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
      id: 'purchases',
      label: 'Купленные товары',
      icon: ShoppingBag,
      badge: purchases.length > 0 ? String(purchases.length) : null,
      description: 'Все купленные вами товары',
    },
    {
      id: 'reviews',
      label: 'Мои отзывы',
      icon: Star,
      badge: reviews.length > 0 ? String(reviews.length) : null,
      description: 'Оценки, отзывы и ответы магазина',
    },
    {
      id: 'questions',
      label: 'Вопросы к товарам',
      icon: MessageSquare,
      badge: questions.length > 0 ? String(questions.length) : null,
      description: 'Ваши вопросы и ответы поддержки',
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
      case 'purchases':
        return (
          <PurchasesTab
            purchases={purchases}
            loading={purchasesLoading}
            onOpenReview={(prod) => setReviewModalProduct(prod)}
            onGoToReviews={() => setActiveTab('reviews')}
          />
        );
      case 'reviews':
        return (
          <ReviewsTab
            reviews={reviews}
            loading={reviewsLoading}
            unreviewedPurchases={purchases.filter((p) => !p.hasReview)}
            onOpenReview={(prod) => setReviewModalProduct(prod)}
            onGoToPurchases={() => setActiveTab('purchases')}
          />
        );
      case 'questions':
        return (
          <QuestionsTab
            questions={questions}
            loading={questionsLoading}
            userInitial={userInitial}
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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

            {/* Quick Summary Cards (6 responsive metrics) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 max-w-2xl w-full self-stretch lg:self-auto">
              {/* Orders */}
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all text-center ${
                  activeTab === 'orders'
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                    : 'border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1 text-zinc-500 mb-1">
                  <Package size={13} />
                  <span className="text-[10px] sm:text-[11px] font-bold">Заказы</span>
                </div>
                <span className="text-base sm:text-xl font-black text-zinc-950 font-display tabular-nums">
                  {orders.length}
                </span>
              </button>

              {/* Purchases */}
              <button
                onClick={() => setActiveTab('purchases')}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all text-center ${
                  activeTab === 'purchases'
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                    : 'border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1 text-zinc-500 mb-1">
                  <ShoppingBag size={13} />
                  <span className="text-[10px] sm:text-[11px] font-bold">Покупки</span>
                </div>
                <span className="text-base sm:text-xl font-black text-zinc-950 font-display tabular-nums">
                  {purchases.length}
                </span>
              </button>

              {/* Reviews */}
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all text-center ${
                  activeTab === 'reviews'
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                    : 'border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1 text-zinc-500 mb-1">
                  <Star size={13} />
                  <span className="text-[10px] sm:text-[11px] font-bold">Отзывы</span>
                </div>
                <span className="text-base sm:text-xl font-black text-zinc-950 font-display tabular-nums">
                  {reviews.length}
                </span>
              </button>

              {/* Questions */}
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-all text-center ${
                  activeTab === 'questions'
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                    : 'border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-1 text-zinc-500 mb-1">
                  <MessageSquare size={13} />
                  <span className="text-[10px] sm:text-[11px] font-bold">Вопросы</span>
                </div>
                <span className="text-base sm:text-xl font-black text-zinc-950 font-display tabular-nums">
                  {questions.length}
                </span>
              </button>

              {/* Favorites Stat */}
              <Link
                href="/favorites"
                className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300 transition-all text-center group"
              >
                <div className="flex items-center gap-1 text-zinc-500 mb-1 group-hover:text-rose-500 transition-colors">
                  <Heart size={13} />
                  <span className="text-[10px] sm:text-[11px] font-bold">Избранное</span>
                </div>
                <span className="text-base sm:text-xl font-black text-zinc-950 font-display tabular-nums group-hover:text-rose-600 transition-colors">
                  {favoritesCount}
                </span>
              </Link>

              {/* Cart Stat */}
              <Link
                href="/cart"
                className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 hover:bg-white hover:border-zinc-300 transition-all text-center group"
              >
                <div className="flex items-center gap-1 text-zinc-500 mb-1 group-hover:text-emerald-600 transition-colors">
                  <ShoppingBag size={13} />
                  <span className="text-[10px] sm:text-[11px] font-bold">Корзина</span>
                </div>
                <span className="text-base sm:text-xl font-black text-zinc-950 font-display tabular-nums group-hover:text-emerald-600 transition-colors">
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

      {/* Review Modal Dialog */}
      <AnimatePresence>
        {reviewModalProduct && (
          <ReviewModal
            product={reviewModalProduct}
            onClose={() => setReviewModalProduct(null)}
            onSuccess={() => {
              setReviewModalProduct(null);
              loadData();
            }}
          />
        )}
      </AnimatePresence>
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

function ProductThumbnail({
  src,
  productId,
  alt,
  iconSize = 20,
  hoverEffect = false,
}: {
  src?: string | null;
  productId: string;
  alt: string;
  iconSize?: number;
  hoverEffect?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const resolved = normalizePersonalImageUrl(productId, src);

  if (!resolved || hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center text-zinc-300">
        <ShoppingBag size={iconSize} />
      </div>
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes="(max-width: 768px) 80px, 120px"
      className={`object-cover ${hoverEffect ? 'object-center group-hover:scale-105 transition-transform duration-300' : ''}`}
      onError={() => setHasError(true)}
    />
  );
}

/* ========================================================================= */
/*                         ВКЛАДКА: КУПЛЕННЫЕ ТОВАРЫ                         */
/* ========================================================================= */

interface PurchasesTabProps {
  purchases: PurchasedProduct[];
  loading: boolean;
  onOpenReview: (product: PurchasedProduct) => void;
  onGoToReviews: () => void;
}

function PurchasesTab({
  purchases,
  loading,
  onOpenReview,
  onGoToReviews,
}: PurchasesTabProps) {
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleBuyAgain = async (product: PurchasedProduct) => {
    setAddingId(product.id);
    try {
      await useCartStore.getState().addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          slug: product.slug || product.id,
          images: product.imageUrl ? [product.imageUrl] : [],
          inStock: 99,
          rating: 5,
          reviewsCount: 0,
        } as any,
        1
      );
      toast.success('Товар добавлен в корзину');
    } catch {
      toast.error('Не удалось добавить товар в корзину');
    } finally {
      setAddingId(null);
    }
  };

  const unreviewedCount = purchases.filter((p) => !p.hasReview).length;

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-extrabold text-zinc-950 font-display">
              Купленные товары
            </h3>
            <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              {purchases.length}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Все товары из ваших завершённых заказов. Повторяйте покупки и делитесь отзывами.
          </p>
        </div>

        {unreviewedCount > 0 && (
          <button
            onClick={onGoToReviews}
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100/80 px-3.5 py-2 rounded-xl border border-amber-200/70 transition-all self-start sm:self-auto active:scale-95"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Оценить покупки ({unreviewedCount})</span>
          </button>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border border-zinc-200/70 p-4 bg-zinc-50/50 space-y-3"
            >
              <div className="flex gap-3">
                <div className="h-20 w-20 rounded-2xl bg-zinc-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-200 rounded w-3/4" />
                  <div className="h-3 bg-zinc-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-zinc-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : purchases.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-100 text-zinc-400 mb-4">
            <ShoppingBag size={36} />
          </div>
          <h4 className="text-lg font-extrabold text-zinc-950 font-display">
            У вас пока нет купленных товаров
          </h4>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mt-1.5 leading-relaxed">
            Здесь появятся все товары, которые вы закажете и получите. Вы сможете быстро повторить покупку или оставить отзыв о качестве.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <span>Перейти в каталог</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        /* Purchases Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {purchases.map((product) => {
            const isAdding = addingId === product.id;
            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-4 sm:p-5 hover:border-zinc-300 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex gap-3.5 items-start">
                    {/* Image / Thumbnail */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200/60">
                      <ProductThumbnail
                        src={product.imageUrl}
                        productId={product.id}
                        alt={product.name}
                        iconSize={24}
                        hoverEffect
                      />
                    </div>

                    {/* Meta info */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${product.slug || product.id}`}
                        className="block text-sm font-bold text-zinc-900 hover:text-emerald-600 transition-colors line-clamp-2 leading-snug"
                        title={product.name}
                      >
                        {product.name}
                      </Link>

                      {product.article && (
                        <p className="text-[11px] font-medium text-zinc-400 mt-1">
                          Арт. {product.article}
                        </p>
                      )}

                      {(product.orderNumber || product.orderDate) && (
                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                          {product.orderNumber ? `Заказ №${product.orderNumber}` : ''}
                          {product.orderDate
                            ? ` • ${new Date(product.orderDate).toLocaleDateString('ru-RU')}`
                            : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity summary */}
                  <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5">
                    {product.totalQty > 0 ? (
                      <span className="text-xs font-semibold text-zinc-500">
                        Куплено: {product.totalQty} шт.
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-zinc-500">Товар получен</span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 flex flex-col gap-2 pt-1">
                  {/* Review Button / Status */}
                  {product.hasReview ? (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 border border-emerald-200/60 px-3 py-2 text-xs font-bold text-emerald-700">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Отзыв оставлен</span>
                      </div>
                      {product.reviewRating && (
                        <div className="flex items-center gap-1 text-amber-500 font-extrabold">
                          <Star size={13} className="fill-amber-400" />
                          <span>{product.reviewRating}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onOpenReview(product)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300/60 px-3 py-2 text-xs font-bold transition-all active:scale-98"
                    >
                      <Star size={14} className="fill-amber-400 text-amber-500" />
                      <span>Оставить отзыв</span>
                    </button>
                  )}

                  {/* Buy Again Button */}
                  <button
                    onClick={() => handleBuyAgain(product)}
                    disabled={isAdding}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white px-3 py-2 text-xs font-bold shadow-xs transition-all active:scale-98 disabled:opacity-50"
                  >
                    {isAdding ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ShoppingBag size={14} />
                    )}
                    <span>Купить снова</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/*                         ВКЛАДКА: МОИ ОТЗЫВЫ                               */
/* ========================================================================= */

interface ReviewsTabProps {
  reviews: UserReviewItem[];
  loading: boolean;
  unreviewedPurchases: PurchasedProduct[];
  onOpenReview: (product: PurchasedProduct) => void;
  onGoToPurchases: () => void;
}

function ReviewsTab({
  reviews,
  loading,
  unreviewedPurchases,
  onOpenReview,
  onGoToPurchases,
}: ReviewsTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-extrabold text-zinc-950 font-display">
              Мои отзывы
            </h3>
            <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              {reviews.length}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Ваши отзывы и оценки о товарах, а также официальные ответы магазина
          </p>
        </div>
      </div>

      {/* PROMPT BANNER: Предложение оставить отзывы на купленные товары */}
      {unreviewedPurchases.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-300/80 bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-orange-50/20 p-5 sm:p-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-md shadow-amber-500/20">
              <Sparkles size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base sm:text-lg font-bold text-zinc-950 font-display">
                Оцените купленные товары
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1 leading-relaxed">
                Вы недавно приобрели {unreviewedPurchases.length} {unreviewedPurchases.length === 1 ? 'товар' : 'товара'}, но ещё не оставили отзыв. Расскажите о впечатлениях — это поможет другим покупателям определиться с выбором!
              </p>

              {/* Unreviewed items horizontal carousel / list */}
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
                {unreviewedPurchases.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex shrink-0 items-center gap-3 rounded-2xl border border-amber-200/80 bg-white/95 backdrop-blur-xs p-2.5 shadow-xs max-w-xs"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100 border border-zinc-100">
                      <ProductThumbnail
                        src={prod.imageUrl}
                        productId={prod.id}
                        alt={prod.name}
                        iconSize={18}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-900 truncate" title={prod.name}>
                        {prod.name}
                      </p>
                      <p className="text-[11px] font-extrabold text-zinc-950 mt-0.5">
                        {formatPrice(prod.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => onOpenReview(prod)}
                      className="shrink-0 flex items-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs active:scale-95"
                    >
                      <Star size={12} className="fill-white" />
                      <span>Отзыв</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border border-zinc-200/70 p-5 bg-zinc-50/50 space-y-3"
            >
              <div className="h-5 bg-zinc-200 rounded w-1/3" />
              <div className="h-4 bg-zinc-200 rounded w-3/4" />
              <div className="h-4 bg-zinc-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-500 mb-4">
            <Star size={36} className="fill-amber-400" />
          </div>
          <h4 className="text-lg font-extrabold text-zinc-950 font-display">
            Вы пока не оставили ни одного отзыва
          </h4>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mt-1.5 leading-relaxed">
            После получения заказа вы можете оценить товар и поделиться мнением. Ваши отзывы помогут другим покупателям!
          </p>
          <button
            onClick={onGoToPurchases}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
          >
            <span>К купленным товарам</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs hover:border-zinc-300 transition-all"
            >
              {/* Review Product Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100 border border-zinc-100">
                    <ProductThumbnail
                      src={rev.productImageUrl}
                      productId={rev.productId}
                      alt={rev.productName}
                      iconSize={18}
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/product/${rev.productSlug || rev.productId}`}
                      className="text-sm font-bold text-zinc-900 hover:text-emerald-600 transition-colors line-clamp-1"
                    >
                      {rev.productName}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-200'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-zinc-700">
                        {rev.rating} из 5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Date */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {rev.published ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 size={12} />
                      Опубликован
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                      <Clock size={12} />
                      На модерации
                    </span>
                  )}
                  <span className="text-xs text-zinc-400">
                    {rev.date ? new Date(rev.date).toLocaleDateString('ru-RU') : ''}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div className="pt-4">
                <p className="text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
                  {rev.text}
                </p>
              </div>

              {/* Store Response (if any) */}
              {rev.reply && (
                <div className="mt-4 rounded-2xl border-l-4 border-emerald-500 bg-emerald-50/60 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1.5">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>Ответ SmartMarket</span>
                    {rev.replyDate && (
                      <span className="font-normal text-emerald-700/80">
                        • {new Date(rev.replyDate).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                    {rev.reply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/*                         ВКЛАДКА: ВОПРОСЫ К ТОВАРАМ                        */
/* ========================================================================= */

interface QuestionsTabProps {
  questions: UserQuestionItem[];
  loading: boolean;
  userInitial?: string;
}

function QuestionsTab({ questions, loading, userInitial }: QuestionsTabProps) {
  const { user } = useAuthStore();
  const initial = userInitial || (user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U'));
  const [filter, setFilter] = useState<'all' | 'answered' | 'pending'>('all');

  const answeredCount = questions.filter((q) => Boolean(q.reply)).length;
  const pendingCount = questions.length - answeredCount;

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'answered') return Boolean(q.reply);
    if (filter === 'pending') return !q.reply;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-extrabold text-zinc-950 font-display">
              Вопросы к товарам
            </h3>
            <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              {questions.length}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Ваши вопросы о характеристиках товаров и ответы консультантов магазина
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-100/80 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Все ({questions.length})
          </button>
          <button
            onClick={() => setFilter('answered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'answered'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            С ответом ({answeredCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'pending'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Ожидают ({pendingCount})
          </button>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-3xl border border-zinc-200/70 p-5 bg-zinc-50/50 space-y-3"
            >
              <div className="h-5 bg-zinc-200 rounded w-1/3" />
              <div className="h-4 bg-zinc-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-zinc-100 text-zinc-400 mb-4">
            <HelpCircle size={36} />
          </div>
          <h4 className="text-lg font-extrabold text-zinc-950 font-display">
            {questions.length === 0
              ? 'Вы пока не задавали вопросов'
              : 'В этой категории вопросов нет'}
          </h4>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mt-1.5 leading-relaxed">
            {questions.length === 0
              ? 'Если у вас есть вопросы о совместимости, характеристиках или наличии любого товара, задайте их прямо на карточке товара.'
              : 'Попробуйте переключить фильтр, чтобы увидеть остальные вопросы.'}
          </p>
          {questions.length === 0 && (
            <Link
              href="/catalog"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
            >
              <span>Перейти в каталог</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 shadow-xs hover:border-zinc-300 transition-all"
            >
              {/* Question Product Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-zinc-100 border border-zinc-100">
                    <ProductThumbnail
                      src={q.productImageUrl}
                      productId={q.productId}
                      alt={q.productName}
                      iconSize={18}
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/product/${q.productSlug || q.productId}`}
                      className="text-sm font-bold text-zinc-900 hover:text-emerald-600 transition-colors line-clamp-1"
                    >
                      {q.productName}
                    </Link>
                    <span className="text-[11px] text-zinc-400">
                      {q.date ? new Date(q.date).toLocaleDateString('ru-RU') : ''}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="self-start sm:self-auto">
                  {q.reply ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 size={12} />
                      Ответ получен
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600">
                      <Clock size={12} />
                      Ожидает ответа
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="pt-4">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-xs font-black text-white shadow-xs">
                    {initial}
                  </div>
                  <p className="text-sm text-zinc-900 font-medium leading-relaxed whitespace-pre-line pt-0.5">
                    {q.text}
                  </p>
                </div>
              </div>

              {/* Answer Box (if answered) */}
              {q.reply ? (
                <div className="mt-4 rounded-2xl border-l-4 border-emerald-500 bg-emerald-50/60 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1.5">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span>Ответ специалиста SmartMarket</span>
                    {q.replyDate && (
                      <span className="font-normal text-emerald-700/80">
                        • {new Date(q.replyDate).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                    {q.reply}
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-zinc-50 border border-zinc-100 p-3.5 text-xs text-zinc-500 flex items-center gap-2">
                  <Clock size={14} className="text-zinc-400 shrink-0" />
                  <span>
                    Наши специалисты обычно отвечают в течение рабочего дня. Вы получите уведомление, когда ответ появится.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/*                         МОДАЛЬНОЕ ОКНО: ОТЗЫВ                             */
/* ========================================================================= */

interface ReviewModalProps {
  product: PurchasedProduct;
  onClose: () => void;
  onSuccess: () => void;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Ужасно — всё очень плохо',
  2: 'Плохо — есть серьёзные недостатки',
  3: 'Нормально — среднее качество',
  4: 'Хорошо — покупкой доволен',
  5: 'Отлично! — рекомендую к покупке',
};

function ReviewModal({ product, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [text, setText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const activeRating = hoverRating || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.trim().length < 5) {
      setError('Пожалуйста, напишите пару слов о впечатлениях (минимум 5 символов)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await reviewsService.submitReview(product.id, {
        rating,
        text: text.trim(),
      });
      toast.success('Спасибо за отзыв! Он появится после проверки модератором.');
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Не удалось отправить отзыв. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-2xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          aria-label="Закрыть"
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Star size={18} className="fill-amber-400" />
          </div>
          <h3 className="text-xl font-extrabold text-zinc-950 font-display">
            Оставить отзыв
          </h3>
        </div>

        {/* Product mini-card */}
        <div className="my-4 flex items-center gap-3 rounded-2xl bg-zinc-50 p-3 border border-zinc-100">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white border border-zinc-200/60">
            <ProductThumbnail
              src={product.imageUrl}
              productId={product.id}
              alt={product.name}
              iconSize={18}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-zinc-900 line-clamp-1">
              {product.name}
            </p>
            {product.price > 0 ? (
              <p className="text-[11px] font-extrabold text-zinc-600 mt-0.5">
                {formatPrice(product.price)}
              </p>
            ) : product.orderDate ? (
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Куплен {new Date(product.orderDate).toLocaleDateString('ru-RU')}
              </p>
            ) : null}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-2">
              Ваша оценка
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-xl transition-transform hover:scale-110 active:scale-95"
                    aria-label={`Оценка ${star} из 5`}
                  >
                    <Star
                      size={28}
                      className={`transition-colors ${
                        star <= activeRating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'text-zinc-200 hover:text-zinc-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-zinc-700 ml-2">
                {RATING_DESCRIPTIONS[activeRating] || ''}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-700">
                Ваш отзыв
              </label>
              <span className="text-[10px] text-zinc-400 font-medium">
                {text.length} символов
              </span>
            </div>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError('');
              }}
              placeholder="Расскажите о достоинствах и недостатках, поделитесь опытом использования..."
              className="w-full rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-3.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
            />
          </div>

          {/* Error feedback */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
              <XCircle size={15} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-100 active:scale-95 transition-all"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Отправка...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Отправить отзыв</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
