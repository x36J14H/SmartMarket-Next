'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import { settingsService, DEFAULT_STORE_SETTINGS, type StoreSettings } from '../../lib/1c/settings';

export default function TermsPage() {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    settingsService.getSettings().then(setStoreSettings);
  }, []);

  const lastUpdated = '12 сентября 2026 г.';

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
            <FileText size={13} />
            <span>Публичная оферта</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Пользовательское соглашение
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl font-normal">
            Условия использования интернет-магазина SmartMarket, правила оформления заказов, порядок расчетов и права сторон.
          </p>
          <p className="mt-4 text-xs text-zinc-400">
            Дата вступления в силу: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="rounded-3xl border border-zinc-200/80 bg-white/95 backdrop-blur-xl p-8 sm:p-12 shadow-xl shadow-zinc-200/40 space-y-10 text-zinc-700 leading-relaxed">

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                1
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Предмет соглашения и статус документа
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              1.1. Настоящее Пользовательское соглашение (далее — «Соглашение») в соответствии со ст. 437 Гражданского кодекса РФ является публичной офертой интернет-магазина <strong>SmartMarket</strong> (далее — «Продавец») и адресовано любому физическому или юридическому лицу (далее — «Покупатель» или «Пользователь»).
            </p>
            <p className="text-sm sm:text-base">
              1.2. Продавец предоставляет Пользователю доступ к информации о товарах, возможности выбора, оформления и оплаты заказов на сайте, а Пользователь обязуется использовать сайт в соответствии с условиями настоящего Соглашения.
            </p>
            <p className="text-sm sm:text-base">
              1.3. Оформление заказа, создание учетной записи или продолжение использования сайта означает полное и безоговорочное согласие (акцепт оферты) с положениями настоящего Соглашения и{' '}
              <Link href="/privacy" className="text-emerald-600 underline font-semibold">
                Политики конфиденциальности
              </Link>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                2
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Регистрация и безопасность учетной записи
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              2.1. Регистрация на сайте осуществляется путем ввода email, подтверждения проверочного кода и создания надежного пароля. Регистрация не является обязательной для ознакомления с ассортиментом, однако необходима для отслеживания заказов и участия в программе лояльности.
            </p>
            <p className="text-sm sm:text-base">
              2.2. Пользователь обязуется обеспечивать конфиденциальность данных для входа в личный кабинет. Все действия, совершенные на сайте с использованием учетной записи Пользователя, признаются совершенными им лично.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                3
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Каталог товаров, цены и оформление заказа
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              3.1. Все товары, представленные на сайте, являются 100% оригинальными и сопровождаются официальной гарантией. Описания, характеристики и изображения товаров носят информационный характер.
            </p>
            <p className="text-sm sm:text-base">
              3.2. Цены на сайте указаны в рублях РФ. Продавец оставляет за собой право изменять цены в одностороннем порядке до момента оформления и подтверждения заказа Покупателем.
            </p>
            <p className="text-sm sm:text-base">
              3.3. Заказ считается оформленным после нажатия кнопки «Оформить заказ» и получения подтверждения от системы с присвоением уникального номера заказа.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                4
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Оплата товаров
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              Оплата может быть произведена следующими способами:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm">
                <span className="font-bold text-zinc-900 block mb-1">Онлайн-оплата на сайте</span>
                Банковскими картами МИР, Visa, Mastercard, а также через Систему быстрых платежей (СБП) без комиссии.
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm">
                <span className="font-bold text-zinc-900 block mb-1">Оплата при получении</span>
                Наличными или банковской картой курьеру либо в пункте самовывоза после осмотра товара.
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                5
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Доставка и получение заказа
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              5.1. Способы, ориентировочные сроки и стоимость доставки рассчитываются автоматически в процессе оформления заказа в зависимости от региона и габаритов отправления.
            </p>
            <p className="text-sm sm:text-base">
              5.2. При получении заказа Покупатель обязан проверить целостность внешней упаковки, комплектность и отсутствие механических повреждений товаров в присутствии курьера или сотрудника ПВЗ.
            </p>
            <p className="text-sm sm:text-base">
              5.3. Право собственности и риск случайной гибели или повреждения товара переходят к Покупателю с момента фактической передачи товара и подписания товаросопроводительных документов.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                6
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Возврат товара и гарантия
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              Порядок возврата товара надлежащего и ненадлежащего качества, сроки гарантийного обслуживания и возврата денежных средств подробно описаны на специальной странице:{' '}
              <Link href="/returns" className="text-emerald-600 underline font-semibold">
                Условия возврата и гарантии
              </Link>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                7
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Интеллектуальная собственность
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              Все материалы, размещенные на сайте (тексты, фотоснимки, видеоматериалы, графические элементы, товарные знаки и дизайн интерфейса), являются собственностью Продавца или его правообладателей и защищены законодательством РФ об интеллектуальной собственности. Любое коммерческое использование материалов без письменного согласия запрещено.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                8
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Разрешение споров и контакты
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              8.1. В случае возникновения претензий Покупатель обращается в службу заботы Продавца через форму обратной связи на сайте, онлайн-чат или по электронной почте{' '}
              <a href={`mailto:${storeSettings.email}`} className="text-emerald-600 underline font-semibold">
                {storeSettings.email}
              </a>.
            </p>
            <p className="text-sm sm:text-base">
              8.2. Срок рассмотрения претензии составляет не более 10 рабочих дней с момента ее получения. Споры, не урегулированные в претензионном порядке, подлежат рассмотрению в судебном порядке в соответствии с законодательством РФ.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
