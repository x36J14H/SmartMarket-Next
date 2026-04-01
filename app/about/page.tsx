'use client';

import { motion } from 'motion/react';
import { ShieldCheck, Truck, HeadphonesIcon, Award, Users, Globe } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Довольных клиентов', value: '50 000+' },
    { label: 'Товаров в каталоге', value: '10 000+' },
    { label: 'Городов доставки', value: '120+' },
    { label: 'Лет на рынке', value: '5' },
  ];

  const features = [
    { icon: <ShieldCheck size={32} className="text-emerald-500" />, title: 'Гарантия качества', description: 'Мы тщательно проверяем каждый товар перед отправкой и работаем только с проверенными поставщиками.' },
    { icon: <Truck size={32} className="text-emerald-500" />, title: 'Быстрая доставка', description: 'Собственная логистическая сеть позволяет доставлять заказы в кратчайшие сроки по всей стране.' },
    { icon: <HeadphonesIcon size={32} className="text-emerald-500" />, title: 'Поддержка 24/7', description: 'Наши специалисты всегда готовы помочь вам с выбором товара и ответить на любые вопросы.' },
    { icon: <Award size={32} className="text-emerald-500" />, title: 'Лучшие цены', description: 'Отсутствие комиссий маркетплейсов позволяет нам предлагать самые выгодные цены на рынке.' },
  ];

  return (
    <div className="bg-zinc-50 min-h-screen pb-20">
      <div className="bg-zinc-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent"></div>
        <div className="max-w-[1400px] mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
              Делаем онлайн-шопинг <span className="text-emerald-400">лучше</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed font-medium">
              MarketMVP — это современный интернет-магазин, созданный с заботой о покупателях.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-lg shadow-zinc-200/50 ring-1 ring-zinc-200/50 p-8 sm:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="flex flex-col gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-zinc-900">{stat.value}</span>
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-extrabold text-zinc-900 mb-6 tracking-tight">Наша миссия</h2>
            <div className="space-y-6 text-zinc-600 font-medium leading-relaxed">
              <p>Мы создали MarketMVP, чтобы предложить альтернативу крупным маркетплейсам. Избавившись от их огромных комиссий, мы смогли снизить цены для наших покупателей, сохранив при этом высочайший уровень сервиса.</p>
              <p>Каждый день наша команда работает над тем, чтобы расширять ассортимент, ускорять доставку и делать интерфейс магазина еще более удобным.</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 aspect-square">
              <Users size={40} className="text-emerald-600" />
              <span className="font-bold text-emerald-900">Команда профессионалов</span>
            </div>
            <div className="bg-zinc-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 aspect-square translate-y-8">
              <Globe size={40} className="text-white" />
              <span className="font-bold text-white">Работаем по всей России</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <h2 className="text-3xl font-extrabold text-zinc-900 mb-12 text-center tracking-tight">Почему выбирают нас</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white p-8 rounded-3xl shadow-sm ring-1 ring-zinc-200/50 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">{feature.icon}</div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">{feature.title}</h3>
              <p className="text-zinc-500 font-medium leading-relaxed text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
