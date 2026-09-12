'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { settingsService, DEFAULT_STORE_SETTINGS, type StoreSettings } from '../../lib/1c/settings';

export default function PrivacyPage() {
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
            <ShieldCheck size={13} />
            <span>152-ФЗ «О персональных данных»</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Политика конфиденциальности
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl font-normal">
            Настоящая Политика определяет порядок и условия сбора, хранения, обработки и защиты персональных данных пользователей интернет-магазина SmartMarket.
          </p>
          <p className="mt-4 text-xs text-zinc-400">
            Дата последнего обновления: {lastUpdated}
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
                Общие положения
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              1.1. Настоящая Политика обработки персональных данных (далее — «Политика») составлена в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных» и действует в отношении всей информации, которую интернет-магазин <strong>SmartMarket</strong> (далее — «Оператор») может получить о пользователе во время использования сайта, оформления заказов, подписки на рассылки или обращений в службу клиентской заботы.
            </p>
            <p className="text-sm sm:text-base">
              1.2. Использование сервисов сайта, регистрация учетной записи, оформление заказа или подписка означают безоговорочное согласие пользователя с настоящей Политикой и указанными в ней условиями обработки его персональных данных. В случае несогласия с этими условиями пользователь должен воздержаться от предоставления персональных данных.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                2
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Категории обрабатываемых данных
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              Оператор обрабатывает следующие категории персональных данных пользователей:
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 pt-2">
              <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>ФИО / Имя пользователя</strong> — для идентификации и обращения.</span>
              </li>
              <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Номер телефона</strong> — для подтверждения заказа и связи курьера.</span>
              </li>
              <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Адрес электронной почты</strong> — для чеков, статусов и подписок.</span>
              </li>
              <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Адрес доставки</strong> — для логистики и передачи отправления.</span>
              </li>
              <li className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm sm:col-span-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Технические данные</strong> — IP-адрес, данные файлов cookie, сведения об используемом браузере, времени доступа и просмотренных страницах.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                3
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Цели обработки персональных данных
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              Персональные данные собираются и обрабатываются исключительно для достижения следующих законных целей:
            </p>
            <div className="space-y-2 text-sm sm:text-base pl-4 border-l-2 border-emerald-500">
              <p>• <strong>Заключение и исполнение договоров купли-продажи</strong>, включая оформление, комплектацию, доставку заказов и взаиморасчеты.</p>
              <p>• <strong>Регистрация и аутентификация пользователя</strong> в личном кабинете, синхронизация корзины и избранного.</p>
              <p>• <strong>Информирование о статусе заказа</strong> посредством SMS, мессенджеров или email-уведомлений.</p>
              <p>• <strong>Клиентская поддержка и обратная связь</strong>, консультации через онлайн-чат или форму обращений.</p>
              <p>• <strong>Маркетинговые рассылки</strong> (при наличии согласия): персональные скидки, промокоды и специальные предложения клуба привилегий.</p>
              <p>• <strong>Улучшение качества работы сервиса</strong> и защита от несанкционированного доступа.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                4
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Порядок хранения, защиты и передачи данных
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              4.1. Безопасность персональных данных обеспечивается реализацией правовых, организационных и технических мер, необходимых для выполнения требований законодательства РФ в области защиты информации.
            </p>
            <p className="text-sm sm:text-base">
              4.2. Персональные данные пользователей не передаются третьим лицам, за исключением случаев, когда это прямо необходимо для исполнения договора с пользователем:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base">
              <li>Службам доставки и курьерским компаниям (СДЭК, Почта России, собственная курьерская служба) для доставки заказа по указанному адресу;</li>
              <li>Банкам и платежным шлюзам (эквайринг, СБП, сервисы рассрочки) для безопасного проведения оплаты;</li>
              <li>Интегрированной корпоративной учетной системе 1С:Предприятие для ведения складского и финансового учета.</li>
            </ul>
            <p className="text-sm sm:text-base">
              4.3. Базы данных с персональными данными граждан РФ размещены на серверах, физически расположенных на территории Российской Федерации.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                5
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Права субъекта персональных данных
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              В соответствии с 152-ФЗ пользователь имеет право:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base">
              <li>Получать информацию, касающуюся обработки его персональных данных;</li>
              <li>Требовать уточнения, обновления или изменения своих персональных данных в профиле;</li>
              <li>Требовать блокирования или уничтожения своих персональных данных при прекращении использования сервиса;</li>
              <li>Отозвать свое согласие на обработку персональных данных в любой момент, направив официальное уведомление на контактный email:{' '}
                <a href={`mailto:${storeSettings.email}`} className="text-emerald-600 font-semibold underline">
                  {storeSettings.email}
                </a>.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                6
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                Файлы cookie и веб-аналитика
              </h2>
            </div>
            <p className="text-sm sm:text-base">
              Сайт использует файлы cookie для корректной работы корзины покупок, авторизации пользователя, сохранения предпочтений и анализа трафика. Пользователь может в любой момент отключить сохранение файлов cookie в настройках своего интернет-браузера, однако это может ограничить работоспособность некоторых функций интернет-магазина.
            </p>
          </section>

          {/* Section 7: Contacts Card */}
          <div className="mt-10 rounded-2xl bg-zinc-50 border border-zinc-200/80 p-6 sm:p-8">
            <h3 className="text-base sm:text-lg font-bold text-zinc-950 mb-2">
              Контакты оператора данных
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 mb-4">
              По всем вопросам относительно обработки ваших персональных данных и реализации прав субъекта данных:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm font-medium text-zinc-800">
              <div>
                <span className="text-zinc-400 block text-[11px] uppercase">Email для обращений:</span>
                <a href={`mailto:${storeSettings.email}`} className="text-emerald-600 hover:underline font-bold">
                  {storeSettings.email}
                </a>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px] uppercase">Служба заботы:</span>
                <a href={`tel:${storeSettings.phone.replace(/[^0-9+]/g, '')}`} className="font-bold hover:text-emerald-600 transition-colors">
                  {storeSettings.phone}
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
