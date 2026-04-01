'use client';

import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="bg-zinc-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">Свяжитесь с нами</h1>
          <p className="text-lg text-zinc-500 font-medium max-w-2xl">Мы всегда рады помочь вам с выбором, ответить на вопросы по заказам или выслушать ваши предложения.</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-zinc-200/50">
              <h2 className="text-2xl font-extrabold text-zinc-900 mb-8 tracking-tight">Контактная информация</h2>
              <div className="space-y-6">
                {[
                  { icon: <Phone size={24} />, title: 'Телефон', content: <><a href="tel:88000000000" className="text-zinc-500 hover:text-emerald-600 font-medium transition-colors block">8 (800) 000-00-00</a><a href="tel:+74950000000" className="text-zinc-500 hover:text-emerald-600 font-medium transition-colors block">+7 (495) 000-00-00</a></> },
                  { icon: <Mail size={24} />, title: 'Email', content: <><a href="mailto:info@marketmvp.ru" className="text-zinc-500 hover:text-emerald-600 font-medium transition-colors block">info@marketmvp.ru</a><a href="mailto:support@marketmvp.ru" className="text-zinc-500 hover:text-emerald-600 font-medium transition-colors block">support@marketmvp.ru</a></> },
                  { icon: <MapPin size={24} />, title: 'Офис', content: <p className="text-zinc-500 font-medium">г. Москва, ул. Примерная, д. 1, БЦ &quot;Инновация&quot;, офис 404</p> },
                  { icon: <Clock size={24} />, title: 'Режим работы', content: <><p className="text-zinc-500 font-medium">Пн-Пт: 9:00 - 20:00</p><p className="text-zinc-500 font-medium">Сб-Вс: 10:00 - 18:00</p></> },
                ].map(({ icon, title, content }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">{icon}</div>
                    <div><h3 className="font-bold text-zinc-900 text-lg mb-1">{title}</h3>{content}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 rounded-3xl p-8 shadow-lg text-white">
              <div className="flex items-center gap-4 mb-4">
                <MessageSquare size={32} className="text-emerald-400" />
                <h2 className="text-2xl font-extrabold tracking-tight">Чат с поддержкой</h2>
              </div>
              <p className="text-zinc-400 font-medium mb-6 leading-relaxed">Самый быстрый способ получить ответ — написать нашему ИИ-консультанту. Он доступен 24/7.</p>
              <button
                onClick={() => document.querySelector<HTMLButtonElement>('button[aria-label="Открыть чат с ИИ"]')?.click()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-colors w-full sm:w-auto"
              >
                Открыть чат
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-zinc-200/50">
            <h2 className="text-2xl font-extrabold text-zinc-900 mb-8 tracking-tight">Напишите нам</h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-zinc-900">Ваше имя</label>
                  <input type="text" id="name" placeholder="Иван Иванов" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-zinc-900">Email</label>
                  <input type="email" id="email" placeholder="ivan@example.com" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-bold text-zinc-900">Тема обращения</label>
                <select id="subject" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                  <option value="order">Вопрос по заказу</option>
                  <option value="product">Консультация по товару</option>
                  <option value="return">Возврат или обмен</option>
                  <option value="cooperation">Сотрудничество</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-zinc-900">Сообщение</label>
                <textarea id="message" rows={5} placeholder="Опишите ваш вопрос максимально подробно..." className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                <Send size={18} />Отправить сообщение
              </button>
            </form>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12 bg-zinc-200 rounded-3xl h-[400px] w-full overflow-hidden relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1920/1080?blur=2')] opacity-50 bg-cover bg-center"></div>
          <div className="relative z-10 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center max-w-sm mx-4">
            <MapPin size={40} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-extrabold text-zinc-900 mb-2">Наш главный офис</h3>
            <p className="text-zinc-600 font-medium text-sm">г. Москва, ул. Примерная, д. 1<br />Ждем вас в гости!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
