'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'order',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Пожалуйста, заполните все обязательные поля');
      return;
    }
    setSubmitted(true);
    toast.success('Ваше сообщение отправлено в службу заботы SmartMarket!');
  };

  return (
    <div className="bg-[#fbfbfd] min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 mb-4">
            <MessageSquare size={13} className="text-emerald-600" />
            <span>Служба заботы</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 font-display">
            Контакты и поддержка
          </h1>
          <p className="text-base sm:text-lg text-zinc-500 font-normal max-w-2xl mt-3">
            Мы на связи 24/7. Ответим на любые вопросы по заказам, гарантии или поможем подобрать нужный товар.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12">
          {/* Info cards */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
            <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-zinc-200/80">
              <h2 className="text-2xl font-extrabold text-zinc-950 mb-8 tracking-tight font-display">
                Контактная информация
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: <Phone size={22} />,
                    title: 'Телефон горячей линии',
                    content: (
                      <>
                        <a href="tel:88000000000" className="text-zinc-600 hover:text-emerald-600 font-semibold transition-colors block">
                          8 (800) 000-00-00 <span className="text-xs text-emerald-600 font-normal ml-1">Бесплатно по РФ</span>
                        </a>
                        <a href="tel:+74950000000" className="text-zinc-600 hover:text-emerald-600 font-semibold transition-colors block">
                          +7 (495) 000-00-00 <span className="text-xs text-zinc-400 font-normal ml-1">Москва</span>
                        </a>
                      </>
                    ),
                  },
                  {
                    icon: <Mail size={22} />,
                    title: 'Электронная почта',
                    content: (
                      <>
                        <a href="mailto:support@smartmarket.ru" className="text-zinc-600 hover:text-emerald-600 font-semibold transition-colors block">
                          support@smartmarket.ru
                        </a>
                        <a href="mailto:partners@smartmarket.ru" className="text-zinc-600 hover:text-emerald-600 font-semibold transition-colors block">
                          partners@smartmarket.ru (поставщикам)
                        </a>
                      </>
                    ),
                  },
                  {
                    icon: <MapPin size={22} />,
                    title: 'Центральный офис и пункт выдачи',
                    content: (
                      <p className="text-zinc-600 font-medium">
                        г. Москва, ул. Примерная, д. 1, БЦ «Инновация», флагманский шоурум
                      </p>
                    ),
                  },
                  {
                    icon: <Clock size={22} />,
                    title: 'Режим работы',
                    content: (
                      <>
                        <p className="text-zinc-600 font-medium">Служба заботы & ИИ: Круглосуточно (24/7)</p>
                        <p className="text-zinc-500 font-normal text-xs mt-0.5">Шоурум и склад: ежедневно с 09:00 до 21:00</p>
                      </>
                    ),
                  },
                ].map(({ icon, title, content }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 ring-1 ring-emerald-500/20">
                      {icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-950 text-base mb-1">{title}</h3>
                      {content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant Banner */}
            <div className="bg-zinc-950 rounded-3xl p-8 sm:p-10 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare size={28} className="text-emerald-400" />
                <h2 className="text-2xl font-extrabold tracking-tight font-display">Мгновенный ИИ-Консультант</h2>
              </div>
              <p className="text-zinc-300 font-normal mb-6 leading-relaxed text-sm">
                Самый быстрый способ получить помощь или консультацию по характеристикам товара — запустить онлайн-диалог с ИИ SmartMarket.
              </p>
              <button
                onClick={() => {
                  const btn = document.querySelector<HTMLButtonElement>('button[aria-label="Открыть чат с ИИ"]');
                  btn?.click();
                }}
                className="shimmer-btn bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3.5 px-7 rounded-2xl transition-all shadow-glow-emerald w-full sm:w-auto"
              >
                Открыть чат с ИИ
              </button>
            </div>
          </motion.div>

          {/* Feedback Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-zinc-200/80">
            <h2 className="text-2xl font-extrabold text-zinc-950 mb-6 tracking-tight font-display">
              Напишите нам
            </h2>

            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-extrabold text-zinc-950 font-display">Сообщение принято!</h3>
                <p className="text-zinc-500 font-medium max-w-sm mt-2 text-sm leading-relaxed">
                  Мы получили ваше обращение и ответим вам на указанный email в течение 15 минут.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'order', message: '' });
                  }}
                  className="mt-6 px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold text-xs transition-colors"
                >
                  Отправить еще одно
                </button>
              </motion.div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-bold text-zinc-700">
                      Ваше имя <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Александр"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-zinc-700">
                      Email для ответа <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@example.com"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-xs font-bold text-zinc-700">
                    Тема обращения
                  </label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  >
                    <option value="order">Вопрос по оформленному заказу</option>
                    <option value="product">Консультация по характеристикам товара</option>
                    <option value="return">Гарантия, возврат или обмен</option>
                    <option value="cooperation">Предложение о сотрудничестве</option>
                    <option value="other">Другой вопрос</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-bold text-zinc-700">
                    Текст обращения <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Опишите ваш вопрос или номер заказа..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="shimmer-btn w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send size={16} />
                  <span>Отправить обращение</span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
