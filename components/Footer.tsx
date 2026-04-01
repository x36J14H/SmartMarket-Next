import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/60 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Market<span className="text-emerald-600">MVP</span></h3>
            <p className="mt-6 text-sm font-medium text-zinc-500 leading-relaxed">
              Собственный магазин без комиссий маркетплейсов. Быстро, удобно, надежно.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Покупателям</h4>
            <ul className="mt-6 space-y-4 text-sm font-medium text-zinc-500">
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Как сделать заказ</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Способы оплаты</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Доставка</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Возврат товара</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Компания</h4>
            <ul className="mt-6 space-y-4 text-sm font-medium text-zinc-500">
              <li><Link href="/about" className="hover:text-emerald-600 transition-colors">О нас</Link></li>
              <li><Link href="/contacts" className="hover:text-emerald-600 transition-colors">Контакты</Link></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Реквизиты</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Контакты</h4>
            <ul className="mt-6 space-y-4 text-sm font-medium text-zinc-500">
              <li className="flex items-center gap-2">
                <span className="text-zinc-400">📞</span>
                <a href="tel:88000000000" className="hover:text-emerald-600 transition-colors">8 (800) 000-00-00</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-zinc-400">✉️</span>
                <a href="mailto:info@marketmvp.ru" className="hover:text-emerald-600 transition-colors">info@marketmvp.ru</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-400 mt-0.5">📍</span>
                <span>г. Москва, ул. Примерная, д. 1</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-zinc-400">
            &copy; {new Date().getFullYear()} MarketMVP. Все права защищены.
          </p>
          <div className="flex gap-6 text-sm font-medium text-zinc-400">
            <a href="#" className="hover:text-zinc-900 transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
