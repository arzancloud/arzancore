import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Calculator, Users, HardDrive, Headphones } from 'lucide-react';
import { PRODUCTS, CONTACTS } from '../../lib/constants';

const colorClasses: Record<string, { bg: string; bgLight: string; text: string; gradient: string; shadow: string; border: string }> = {
  blue: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    text: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/20',
    border: 'border-blue-200 hover:border-blue-400',
  },
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    text: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600',
    shadow: 'shadow-purple-500/20',
    border: 'border-purple-200 hover:border-purple-400',
  },
  green: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
    text: 'text-green-600',
    gradient: 'from-green-500 to-green-600',
    shadow: 'shadow-green-500/20',
    border: 'border-green-200 hover:border-green-400',
  },
  red: {
    bg: 'bg-red-500',
    bgLight: 'bg-red-50',
    text: 'text-red-600',
    gradient: 'from-red-500 to-red-600',
    shadow: 'shadow-red-500/20',
    border: 'border-red-200 hover:border-red-400',
  },
  orange: {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-50',
    text: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600',
    shadow: 'shadow-orange-500/20',
    border: 'border-orange-200 hover:border-orange-400',
  },
  yellow: {
    bg: 'bg-yellow-500',
    bgLight: 'bg-yellow-50',
    text: 'text-yellow-600',
    gradient: 'from-yellow-500 to-yellow-600',
    shadow: 'shadow-yellow-500/20',
    border: 'border-yellow-200 hover:border-yellow-400',
  },
};

const includedFeatures = [
  { icon: Users, text: 'Неограниченные пользователи в базовом тарифе' },
  { icon: HardDrive, text: 'Облачное хранилище от 5 GB' },
  { icon: Headphones, text: 'Техподдержка 24/7' },
];

export default function Pricing() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const totalPrice = selectedProducts.reduce((sum, productId) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    return sum + (product?.startingPrice || 0);
  }, 0);

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full filter blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50 rounded-full filter blur-3xl opacity-50" />

      <div className="container relative">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full px-5 py-2.5 mb-6 shadow-lg shadow-blue-500/30">
            <Sparkles size={18} />
            <span className="text-sm font-semibold">Гибкое ценообразование</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Платите только за то,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              что используете
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Выбирайте нужные модули и комбинируйте их. Каждый модуль оплачивается отдельно.
            14 дней бесплатного тестирования для всех продуктов.
          </p>
        </div>

        {/* Product pricing grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {PRODUCTS.map((product) => {
            const colors = colorClasses[product.color] || colorClasses.blue;
            const isSelected = selectedProducts.includes(product.id);

            return (
              <div
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                className={`group relative bg-white rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? `${colors.border.split(' ')[0]} shadow-xl ${colors.shadow} scale-[1.02]`
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-lg'
                }`}
              >
                {/* Selection indicator */}
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${colors.gradient} border-transparent`
                    : 'border-gray-300'
                }`}>
                  {isSelected && <Check size={14} className="text-white" />}
                </div>

                {/* Product info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${
                    isSelected
                      ? `bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.shadow}`
                      : colors.bgLight
                  }`}>
                    {product.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.shortDescription}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-gray-500">от</span>
                    <span className={`text-3xl font-bold ${isSelected ? colors.text : 'text-gray-900'}`}>
                      ${product.startingPrice}
                    </span>
                    <span className="text-gray-500">/мес</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{product.priceNote}</p>
                </div>

                {/* Features preview */}
                <div className="space-y-2">
                  {product.features.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={14} className={colors.text} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Hover effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
              </div>
            );
          })}
        </div>

        {/* Calculator section */}
        {selectedProducts.length > 0 && (
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 mb-12 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Calculator className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Ваш набор модулей</h3>
                  <p className="text-blue-200">
                    {selectedProducts.length} {selectedProducts.length === 1 ? 'модуль' : selectedProducts.length < 5 ? 'модуля' : 'модулей'} выбрано
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedProducts.map((productId) => {
                  const product = PRODUCTS.find((p) => p.id === productId);
                  if (!product) return null;
                  return (
                    <div
                      key={productId}
                      className={`flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2`}
                    >
                      <span>{product.icon}</span>
                      <span className="text-white text-sm font-medium">{product.name}</span>
                      <span className="text-blue-200 text-sm">${product.startingPrice}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-blue-200 text-sm">Итого от</p>
                  <p className="text-4xl font-bold text-white">${totalPrice}<span className="text-lg text-blue-200">/мес</span></p>
                </div>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:shadow-white/20 transition-all flex items-center gap-2 group whitespace-nowrap"
                >
                  Начать бесплатно
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* What's included */}
        <div className="bg-gray-50 rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Что входит во все тарифы</h3>
            <p className="text-gray-600">Базовые возможности доступны в каждом модуле</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {includedFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <feature.icon className="text-white" size={24} />
                </div>
                <span className="text-gray-700 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              '14 дней бесплатно',
              'Без кредитной карты',
              'Отмена в любой момент',
              'Скидка 20% за год',
              'SSL шифрование',
              'Ежедневные бэкапы',
              'API доступ',
              'Мобильное приложение',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-gray-600">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-green-600" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Нужно индивидуальное решение?</h3>
              <p className="text-gray-600 text-sm">Для крупных компаний — специальные условия и SLA</p>
            </div>
            <a
              href={CONTACTS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all whitespace-nowrap"
            >
              Связаться с нами
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
