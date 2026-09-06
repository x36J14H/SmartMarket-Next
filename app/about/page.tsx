import { ShieldCheck, Truck, HeadphonesIcon, Award, Users, Globe, Building2, Database, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const stats = [
    { label: 'Довольных клиентов', value: '50 000+' },
    { label: 'Товаров в каталоге', value: '10 000+' },
    { label: 'Городов доставки', value: '120+' },
    { label: 'Прямых брендов', value: '250+' },
  ];

  const features = [
    {
      icon: <ShieldCheck size={28} className="text-emerald-500" />,
      title: '100% Оригинальная продукция',
      description: 'Работаем исключительно по прямым дистрибьюторским контрактам с сертификацией каждого изделия.',
    },
    {
      icon: <Truck size={28} className="text-emerald-500" />,
      title: 'Собственная логистика',
      description: 'Собственные склады и партнерство с ведущими курьерскими службами для доставки точно в срок.',
    },
    {
      icon: <HeadphonesIcon size={28} className="text-emerald-500" />,
      title: 'Поддержка и консультации 24/7',
      description: 'Умный онлайн-подбор и внимательные специалисты клиентского сервиса.',
    },
    {
      icon: <Award size={28} className="text-emerald-500" />,
      title: 'Цены без посредников',
      description: 'Экономия до 35% благодаря отказу от непомерных комиссионных сборов маркетплейсов.',
    },
  ];

  return (
    <div className="bg-[#fbfbfd] min-h-screen pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-zinc-950 py-24 px-4 sm:px-6 lg:px-8 text-white">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-[1440px] relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 ring-1 ring-inset ring-emerald-500/20 mb-6">
              <Building2 size={13} />
              <span>О платформе</span>
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Шопинг нового поколения <br />
              <span className="text-gradient-emerald">напрямую от складов</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              SmartMarket предлагает премиальный клиентский сервис, гарантированное качество оригинальной техники и честные цены без наценок посредников.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Stat Bar */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="rounded-3xl border border-zinc-200/80 bg-white/95 backdrop-blur-xl p-8 sm:p-10 shadow-xl shadow-zinc-200/40">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-zinc-100">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1 pt-4 md:pt-0"
              >
                <span className="font-display text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-wider mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600">
              Миссия
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 font-display mt-2 mb-6 tracking-tight">
              Свобода от комиссий и прозрачность для каждого
            </h2>
            <div className="space-y-4 text-zinc-600 font-normal leading-relaxed text-base">
              <p>
                Современные маркетплейсы удерживают от 20% до 40% с каждой продажи, что неизбежно приводит к завышению цен для конечного покупателя.
              </p>
              <p>
                В SmartMarket мы выстроили прозрачные прямые цепочки поставок: товары отгружаются напрямую со склада производителя, за счёт чего покупатели получают лучшую цену на рынке, а заказы комплектуются и отправляются без лишних промежуточных звеньев.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/catalog"
                className="shimmer-btn inline-flex items-center rounded-2xl bg-zinc-950 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-zinc-800 transition-all"
              >
                Исследовать каталог
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-emerald-50/70 border border-emerald-100 p-7 flex flex-col justify-between aspect-square">
              <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-2xs text-emerald-600">
                <Users size={24} />
              </div>
              <div>
                <span className="block font-display text-2xl font-black text-emerald-950">50K+</span>
                <span className="text-xs font-bold text-emerald-700/80">Постоянных клиентов</span>
              </div>
            </div>

            <div className="rounded-3xl bg-zinc-950 p-7 flex flex-col justify-between text-white aspect-square shadow-xl translate-y-6">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shadow-2xs text-emerald-400">
                <Globe size={24} />
              </div>
              <div>
                <span className="block font-display text-2xl font-black text-white">120+</span>
                <span className="text-xs font-bold text-zinc-400">Городов доставки</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 mt-32">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-600">
            Стандарты качества
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 font-display mt-2 tracking-tight">
            Почему покупатели выбирают SmartMarket
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-zinc-200/80 bg-white p-7 shadow-sm hover:border-emerald-500/30 hover:shadow-xl transition-all"
            >
              <div className="w-13 h-13 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 ring-1 ring-emerald-500/20">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-zinc-950 mb-2">{feature.title}</h3>
              <p className="text-zinc-500 font-normal leading-relaxed text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
