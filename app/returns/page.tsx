'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowLeft, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { settingsService, DEFAULT_STORE_SETTINGS, type StoreSettings } from '../../lib/1c/settings';

export default function ReturnsPage() {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    settingsService.getSettings().then(setStoreSettings);
  }, []);

  const steps = [
    {
      step: '1',
      title: 'Свяжитесь с нами',
      desc: 'Напишите в онлайн-чат консультанту на сайте или отправьте обращение через раздел «Контакты», указав номер вашего заказа.',
    },
    {
      step: '2',
      title: 'Заполните заявление',
      desc: 'Наш менеджер вышлет вам простую форму заявления на возврат и согласует удобный способ отправки товара.',
    },
    {
      step: '3',
      title: 'Передайте товар',
      desc: 'Отправьте товар в оригинальной упаковке через курьера, пункт выдачи СДЭК или привезите в наш флагманский пункт выдачи.',
    },
    {
      step: '4',
      title: 'Получите деньги',
      desc: 'После проверки сохранности товара средства возвращаются на ваш счет или банковскую карту в срок до 10 дней.',
    },
  ];

  return (
    <div className="bg-[#fbfbfd] min-h-screen pb-24">
      {/* Header */}
      <div className="relative overflow-hidden bg-zinc-950 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-white">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-4xl relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            <span>На главную</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 ring-1 ring-inset ring-emerald-500/20 mb-4">
            <RotateCcw size={13} />
            <span>Закон «О защите прав потребителей»</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Условия возврата и гарантии
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl font-normal">
            Мы заботимся о вашем спокойствии: официальная гарантия на всю продукцию и прозрачные правила возврата и обмена товаров.
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="rounded-3xl border border-zinc-200/80 bg-white/95 backdrop-blur-xl p-8 sm:p-12 shadow-xl shadow-zinc-200/40 space-y-12 text-zinc-700 leading-relaxed">

          {/* Guarantee Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                  Официальная гарантия 100% оригинальности
                </h2>
                <p className="text-xs text-zinc-500">Прямые поставки от официальных дистрибьюторов</p>
              </div>
            </div>
            <p className="text-sm sm:text-base">
              Все устройства и аксессуары в магазине SmartMarket являются новыми, сертифицированными и оригинальными. На всю электронику предоставляется гарантия производителя или авторизованных сервисных центров сроком от <strong>12 месяцев</strong> с момента покупки.
            </p>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3 text-sm text-emerald-900">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>
                К каждому заказу прилагается кассовый чек и гарантийный талон (или электронный чек в соответствии с 54-ФЗ), дающий право на бесплатное обслуживание в авторизованных центрах.
              </span>
            </div>
          </section>

          {/* Return of Good Quality */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                1
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Возврат товара надлежащего качества
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              В соответствии со статьей 26.1 Закона РФ «О защите прав потребителей» (дистанционный способ продажи товара) покупатель вправе отказаться от товара надлежащего качества:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              <li><strong>В любой момент до его передачи</strong>;</li>
              <li><strong>В течение 7 календарных дней</strong> после получения товара.</li>
            </ul>
            <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-5 space-y-2">
              <h3 className="font-bold text-zinc-900 text-sm">Обязательные условия для возврата:</h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-600">
                <li>• Товар не был в употреблении и не активирован;</li>
                <li>• Сохранены товарный вид, потребительские свойства, заводские пломбы и защитные пленки;</li>
                <li>• Полная комплектация (зарядное устройство, кабели, инструкции, коробка);</li>
                <li>• Наличие документа, подтверждающего факт покупки (электронный чек или номер заказа).</li>
              </ul>
            </div>
          </section>

          {/* Return of Faulty Product */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                2
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Возврат и замена при обнаружении брака
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              Если в процессе эксплуатации товара в течение гарантийного срока был обнаружен производственный недостаток:
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm">
                <span className="font-bold text-zinc-900 block mb-1">До 15 дней</span>
                При обнаружении любого производственного дефекта — бесплатная замена на новый товар или полный возврат средств.
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm">
                <span className="font-bold text-zinc-900 block mb-1">Весь срок гарантии</span>
                Бесплатный гарантийный ремонт в официальном сервисном центре (до 45 дней).
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm">
                <span className="font-bold text-zinc-900 block mb-1">Существенный брак</span>
                Замена или возврат средств при невозможности устранения дефекта или нарушении сроков ремонта.
              </div>
            </div>
          </section>

          {/* Step-by-step procedure */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                3
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Как оформить возврат: 4 простых шага
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {steps.map((s) => (
                <div key={s.step} className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 relative">
                  <span className="font-display text-2xl font-black text-emerald-600 block mb-2">
                    0{s.step}
                  </span>
                  <h3 className="font-bold text-zinc-950 text-base mb-1.5">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Money Refund Timeline */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock size={18} />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Сроки и способ возврата денежных средств
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              В соответствии со статьей 22 Закона РФ «О защите прав потребителей» возврат денежной суммы, уплаченной за товар, производится в течение <strong>не более 10 дней</strong> со дня предъявления соответствующего требования и получения товара на склад.
            </p>
            <p className="text-sm sm:text-base text-zinc-600">
              Денежные средства возвращаются тем же способом, которым была совершена оплата: на банковскую карту, с которой производился платеж, либо на банковские реквизиты, указанные покупателем в заявлении на возврат.
            </p>
          </section>

          {/* Support CTA */}
          <div className="rounded-3xl bg-zinc-950 text-white p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
            <h3 className="text-2xl font-extrabold mb-2 font-display">
              Остались вопросы по гарантии или возврату?
            </h3>
            <p className="text-zinc-300 text-sm max-w-lg mb-6 leading-relaxed">
              Служба заботы SmartMarket на связи 24/7. Мы оперативно подскажем адрес ближайшего сервисного центра или поможем оформить заявку.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link
                href="/contacts"
                className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 py-3 text-sm transition-all shadow-glow-emerald"
              >
                Написать в поддержку
              </Link>
              <a
                href={`tel:${storeSettings.phone.replace(/[^0-9+]/g, '')}`}
                className="text-sm font-bold text-white hover:text-emerald-400 transition-colors"
              >
                {storeSettings.phone}
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
