import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { PRODUCTS } from '../lib/constants';
import { Check, ArrowRight } from 'lucide-react';

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200 hover:border-blue-400' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200 hover:border-purple-400' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200 hover:border-green-400' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200 hover:border-red-400' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200 hover:border-orange-400' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200 hover:border-yellow-400' },
};

export default function ProductsPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span className="text-lg">🚀</span>
              <span className="text-sm">Модульная платформа</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Наши продукты
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Выбирайте модули, которые нужны вашему бизнесу.
              Платите только за то, что используете.
            </p>
          </div>
        </section>

        {/* Products grid */}
        <section className="py-20">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PRODUCTS.map((product) => {
                const colors = colorClasses[product.color] || colorClasses.blue;
                return (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className={`group bg-white rounded-2xl p-8 border-2 ${colors.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                  >
                    {/* Icon & Price */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                        {product.icon}
                      </div>
                      <div className={`${colors.text} text-sm font-semibold`}>
                        от ${product.startingPrice}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {product.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                          <Check size={16} className={colors.text} />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className={`flex items-center gap-2 ${colors.text} font-semibold`}>
                      Подробнее
                      <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Не знаете, какой модуль выбрать?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Наши специалисты помогут подобрать оптимальное решение для вашего бизнеса
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all"
                >
                  Попробовать бесплатно
                </Link>
                <a
                  href="tel:+77713877225"
                  className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
                >
                  Получить консультацию
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
