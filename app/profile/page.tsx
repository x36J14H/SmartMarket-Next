'use client';

import React, { useState, useEffect } from 'react';
import { User, Settings, Package, Bell, Shield, LogOut, ChevronRight, Clock, CheckCircle2, Truck, ArrowLeft, Loader2, Eye, EyeOff, Phone, MapPin, Save } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';
import { authService } from '../../lib/1c/auth';
import { personalService } from '../../lib/1c/personal';
import { PasswordStrengthMeter } from '../../components/PasswordStrengthMeter';
import { checkPasswordStrength } from '../../lib/passwordStrength';
import { FormActions } from '../../components/FormActions';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Редирект если не авторизован (после загрузки стора)
    if (user === null) {
      // Небольшая задержка чтобы AuthProvider успел загрузиться
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

  const mockOrders = [
    { id: 'ORD-7721', date: '12 марта 2026', status: 'delivered', total: 12450, items: [{ name: 'Кроссовки Nike Air Max', price: 8900, quantity: 1 }, { name: 'Футболка Jordan Sport', price: 3550, quantity: 1 }] },
    { id: 'ORD-6542', date: '5 марта 2026', status: 'shipped', total: 5200, items: [{ name: 'Кепка New Era 59Fifty', price: 5200, quantity: 1 }] },
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'delivered': return { label: 'Доставлен', color: 'text-emerald-600 bg-emerald-50', icon: <CheckCircle2 size={14} /> };
      case 'shipped': return { label: 'В пути', color: 'text-blue-600 bg-blue-50', icon: <Truck size={14} /> };
      default: return { label: 'В ожидании', color: 'text-zinc-500 bg-zinc-50', icon: <Clock size={14} /> };
    }
  };

  const menuItems = [
    { id: 'personal', label: 'Личные данные', icon: User, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'orders', label: 'Мои заказы', icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'settings', label: 'Настройки', icon: Settings, color: 'text-zinc-500', bg: 'bg-zinc-50' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalTab />;
      case 'orders':
        return (
          <div>
            <h2 className="mb-6 sm:mb-8 text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">История заказов</h2>
            <div className="space-y-4">
              {mockOrders.map((order) => {
                const status = getStatusInfo(order.status);
                const isExpanded = expandedOrder === order.id;
                return (
                  <div key={order.id} className="overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50/50 transition-all hover:border-zinc-200">
                    <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="flex w-full items-center justify-between p-4 sm:p-6 text-left">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-zinc-900">{order.id}</span>
                          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status.color}`}>{status.icon}{status.label}</span>
                        </div>
                        <span className="text-xs font-medium text-zinc-500">{order.date}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Сумма</span>
                          <span className="text-sm font-bold text-zinc-900">{formatPrice(order.total)}</span>
                        </div>
                        <ChevronRight size={20} className={`text-zinc-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-zinc-100 bg-white">
                          <div className="p-4 sm:p-6 space-y-4">
                            <div className="space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <div className="flex flex-col"><span className="font-bold text-zinc-900">{item.name}</span><span className="text-xs text-zinc-500">{item.quantity} шт.</span></div>
                                  <span className="font-bold text-zinc-900">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
                              <span className="text-sm font-bold text-zinc-900">Итого</span>
                              <span className="text-lg font-extrabold text-zinc-900">{formatPrice(order.total)}</span>
                            </div>
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
      case 'settings':
        return <SettingsTab />;
      default: return null;
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:py-12 sm:px-6 lg:px-8 bg-zinc-50 min-h-screen">
      <div className="flex items-center gap-4 mb-6 sm:mb-12">
        {isMobile && activeTab && (
          <button onClick={() => setActiveTab(null)} className="p-2 bg-white rounded-xl shadow-sm ring-1 ring-zinc-200/50 text-zinc-600 active:scale-95 transition-all">
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
          {isMobile && activeTab ? menuItems.find((i) => i.id === activeTab)?.label : 'Личный кабинет'}
        </h1>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8 md:flex-row">
        <AnimatePresence mode="wait">
          {(!isMobile || !activeTab) && (
            <motion.aside initial={isMobile ? { opacity: 0, x: -20 } : false} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full shrink-0 md:w-72">
              <div className="bg-white p-2 rounded-3xl shadow-sm ring-1 ring-zinc-200/50">
                <div className="flex flex-col gap-1">
                  {menuItems.map((item) => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-bold transition-all ${activeTab === item.id ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-white/10' : item.bg}`}>
                          <item.icon size={18} className={activeTab === item.id ? 'text-emerald-400' : item.color} />
                        </div>
                        {item.label}
                      </div>
                      <ChevronRight size={16} className={activeTab === item.id ? 'text-zinc-500' : 'text-zinc-300'} />
                    </button>
                  ))}
                  <div className="h-px bg-zinc-100 my-2 mx-4"></div>
                  <button
                    onClick={async () => { await logout(); router.push('/'); }}
                    className="flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-bold text-rose-600 transition-all hover:bg-rose-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-50 rounded-xl"><LogOut size={18} className="text-rose-500" /></div>
                      Выйти
                    </div>
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab && (
            <motion.div key={activeTab} initial={isMobile ? { opacity: 0, x: 20 } : { opacity: 0 }} animate={{ opacity: 1, x: 0 }} exit={isMobile ? { opacity: 0, x: 20 } : { opacity: 0 }} className="flex-1 rounded-3xl border border-zinc-200/60 bg-white p-5 sm:p-10 shadow-sm ring-1 ring-zinc-200/50">
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>
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

  // Заполняем поля когда user загружается из AuthProvider
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
      setUser({ ...user!, ...patch, delivery_address: patch.delivery_address ?? user?.delivery_address });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">Личные данные</h2>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-zinc-900">Имя</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setSuccess(false); }}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm font-medium text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-zinc-900">Email</label>
          <input
            type="email"
            value={user?.email ?? ''}
            readOnly
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-400 outline-none cursor-not-allowed"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-zinc-900">Телефон</label>
          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setSuccess(false); }}
              placeholder="+7 (900) 000-00-00"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm font-medium text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-300"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-zinc-900">Адрес доставки</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-4 top-3.5 text-zinc-400" />
            <textarea
              value={address}
              onChange={(e) => { setAddress(e.target.value); setSuccess(false); }}
              rows={2}
              placeholder="г. Москва, ул. Ленина, д. 1, кв. 10"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm font-medium text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none placeholder:text-zinc-300"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">{error}</p>
        )}
        {success && (
          <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">Данные сохранены</p>
        )}

        {isDirty && <FormActions loading={loading} onCancel={handleReset} />}
      </form>
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
      setError('Новый пароль не соответствует требованиям безопасности');
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
    <div className="space-y-8 sm:space-y-10">
      <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">Настройки</h2>

      <div className="space-y-6">
        <h3 className="flex items-center gap-3 text-base sm:text-lg font-bold text-zinc-900">
          <div className="p-2 bg-zinc-100 rounded-xl"><Bell size={18} className="text-zinc-600" /></div>
          Уведомления
        </h3>
        {[
          { label: 'Email рассылки', desc: 'Получать новости об акциях и скидках' },
          { label: 'SMS уведомления', desc: 'Статусы заказов по SMS' },
        ].map(({ label, desc }) => (
          <div key={label} className="flex items-center justify-between border-b border-zinc-100 pb-6">
            <div className="pr-4">
              <p className="font-bold text-zinc-900 text-sm sm:text-base">{label}</p>
              <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-1">{desc}</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center shrink-0">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-5 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/30 shadow-inner" />
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-5 pt-2">
        <h3 className="flex items-center gap-3 text-base sm:text-lg font-bold text-zinc-900">
          <div className="p-2 bg-zinc-100 rounded-xl"><Shield size={18} className="text-zinc-600" /></div>
          Безопасность
        </h3>

        {success && !showForm && (
          <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
            Пароль успешно изменён
          </p>
        )}

        {!showForm ? (
          <button
            onClick={() => { setShowForm(true); setSuccess(false); }}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
          >
            Изменить пароль
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
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
              hint="Минимум 8 символов, заглавная буква, цифра, спецсимвол"
            />
            <PasswordStrengthMeter password={newPassword} />
            {error && (
              <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600">{error}</p>
            )}
            <FormActions
              loading={loading}
              onCancel={() => { setShowForm(false); setError(''); setCurrentPassword(''); setNewPassword(''); }}
            />
          </form>
        )}
      </div>
    </div>
  );
}

function PasswordField({
  label, value, onChange, show, onToggle, minLength, hint,
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
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-4 pr-10 text-sm font-medium text-zinc-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}
