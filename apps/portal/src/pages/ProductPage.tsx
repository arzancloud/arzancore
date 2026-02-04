import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useProduct, useProducts } from '../hooks/useProducts';
import {
  Check, ArrowLeft, ArrowRight, Phone, Play, Star,
  Zap, Users, ChevronRight, ExternalLink,
  Sparkles
} from 'lucide-react';
import { CONTACTS } from '../lib/constants';

const colorClasses: Record<string, {
  bg: string;
  bgLight: string;
  text: string;
  gradient: string;
  gradientDark: string;
  shadow: string;
  border: string;
}> = {
  blue: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    text: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    gradientDark: 'from-blue-600 to-blue-800',
    shadow: 'shadow-blue-500/30',
    border: 'border-blue-200',
  },
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    text: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600',
    gradientDark: 'from-purple-600 to-purple-800',
    shadow: 'shadow-purple-500/30',
    border: 'border-purple-200',
  },
  green: {
    bg: 'bg-green-500',
    bgLight: 'bg-green-50',
    text: 'text-green-600',
    gradient: 'from-green-500 to-green-600',
    gradientDark: 'from-green-600 to-green-800',
    shadow: 'shadow-green-500/30',
    border: 'border-green-200',
  },
  red: {
    bg: 'bg-red-500',
    bgLight: 'bg-red-50',
    text: 'text-red-600',
    gradient: 'from-red-500 to-red-600',
    gradientDark: 'from-red-600 to-red-800',
    shadow: 'shadow-red-500/30',
    border: 'border-red-200',
  },
  orange: {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-50',
    text: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600',
    gradientDark: 'from-orange-600 to-orange-800',
    shadow: 'shadow-orange-500/30',
    border: 'border-orange-200',
  },
  yellow: {
    bg: 'bg-yellow-500',
    bgLight: 'bg-yellow-50',
    text: 'text-yellow-600',
    gradient: 'from-yellow-500 to-yellow-600',
    gradientDark: 'from-yellow-600 to-yellow-800',
    shadow: 'shadow-yellow-500/30',
    border: 'border-yellow-200',
  },
};

export default function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading } = useProduct(slug);
  const { data: allProducts } = useProducts();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-8xl mb-6">🔍</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Продукт не найден</h1>
            <p className="text-gray-600 mb-8">К сожалению, запрашиваемый продукт не существует</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              <ArrowLeft size={20} />
              Все продукты
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const colors = colorClasses[product.color] || colorClasses.blue;
  const otherProducts = allProducts?.filter(p => p.id !== product.id).slice(0, 3) || [];

  return (
    <>
      <Header />
      <main className="overflow-hidden">
        {/* Hero section */}
        <section className={`relative py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden`}>
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r ${colors.gradient} rounded-full filter blur-3xl opacity-20 animate-pulse`} />
            <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r ${colors.gradient} rounded-full filter blur-3xl opacity-10 animate-pulse`} style={{ animationDelay: '1s' }} />
          </div>

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }} />
          </div>

          <div className="container relative">
            {/* Breadcrumb */}
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Все продукты</span>
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left content */}
              <div className="text-white">
                {/* Badge */}
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${colors.gradient} rounded-full px-4 py-2 mb-6 shadow-lg ${colors.shadow}`}>
                  <span className="text-2xl">{product.icon}</span>
                  <span className="font-semibold">{product.name}</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  {product.shortDescription}
                  <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient}`}>
                    нового уровня
                  </span>
                </h1>

                {/* Description */}
                <p className="text-xl text-white/70 mb-8 leading-relaxed">
                  {product.longDescription}
                </p>

                {/* Stats */}
                {product.stats && (
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    {product.stats.map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className={`text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient}`}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-white/50">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className={`bg-gradient-to-r ${colors.gradient} text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg ${colors.shadow} hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group`}
                  >
                    Попробовать бесплатно
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href={CONTACTS.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Play size={20} />
                    Запросить демо
                  </a>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-6 mt-8 text-white/50 text-sm">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-400" />
                    14 дней бесплатно
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-400" />
                    Без карты
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-400" />
                    Отмена в любой момент
                  </div>
                </div>
              </div>

              {/* Right - Product mockup */}
              <div className="relative">
                {/* Main card */}
                <div className={`relative bg-gradient-to-br ${colors.gradient} rounded-3xl p-1 shadow-2xl ${colors.shadow} transform hover:scale-105 hover:rotate-1 transition-all duration-500`}>
                  <div className="bg-white rounded-[22px] p-6">
                    {/* Browser header */}
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-1.5 text-sm text-gray-500">
                          <ExternalLink size={12} />
                          {product.url}
                        </div>
                      </div>
                    </div>

                    {/* Product preview content */}
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <div className="text-8xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
                          {product.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                        <p className="text-gray-500">{product.shortDescription}</p>
                      </div>

                      {/* Mini features */}
                      <div className="grid grid-cols-2 gap-2">
                        {product.features.map((feature, i) => (
                          <div
                            key={i}
                            className={`${colors.bgLight} ${colors.text} rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2`}
                          >
                            <Check size={14} />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-xl p-4 transform -rotate-6 animate-float hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center`}>
                      <Zap className="text-white" size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Быстрый старт</div>
                      <div className="text-xs text-gray-500">за 5 минут</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-1/4 bg-white rounded-xl shadow-xl p-4 transform rotate-6 animate-float-delayed hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="text-green-600" size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Всё работает</div>
                      <div className="text-xs text-gray-500">99.9% uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
            </svg>
          </div>
        </section>

        {/* Detailed Features */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="container">
            {/* Section header */}
            <div className="text-center mb-16">
              <div className={`inline-flex items-center gap-2 ${colors.bgLight} ${colors.text} rounded-full px-4 py-2 mb-4`}>
                <Sparkles size={16} />
                <span className="text-sm font-medium">Возможности</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Всё что нужно для{' '}
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient}`}>
                  {product.shortDescription.toLowerCase()}
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {product.name} включает все необходимые инструменты для эффективной работы
              </p>
            </div>

            {/* Features grid */}
            {product.detailedFeatures && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {product.detailedFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className={`group relative bg-white rounded-2xl p-6 lg:p-8 border-2 border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 overflow-hidden`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Hover gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

                    {/* Icon */}
                    <div className={`w-14 h-14 bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg ${colors.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      {feature.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Arrow */}
                    <div className={`absolute bottom-6 right-6 w-10 h-10 rounded-full ${colors.bgLight} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0`}>
                      <ChevronRight className={colors.text} size={20} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Use Cases */}
        {product.useCases && (
          <section className="py-20 lg:py-32 bg-gray-50">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left content */}
                <div>
                  <div className={`inline-flex items-center gap-2 ${colors.bgLight} ${colors.text} rounded-full px-4 py-2 mb-6`}>
                    <Users size={16} />
                    <span className="text-sm font-medium">Для кого</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Идеально подходит для
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    {product.name} создан специально для компаний, которым важны эффективность и результат
                  </p>

                  {/* Use cases list */}
                  <div className="space-y-4">
                    {product.useCases.map((useCase, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg ${colors.shadow}`}>
                          <Check className="text-white" size={24} />
                        </div>
                        <span className="text-lg font-medium text-gray-900">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right - Benefits */}
                <div className={`bg-gradient-to-br ${colors.gradientDark} rounded-3xl p-8 lg:p-12 text-white`}>
                  <h3 className="text-2xl font-bold mb-8">Результаты с {product.name}</h3>

                  {product.benefits && (
                    <div className="space-y-6">
                      {product.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Star className="text-white" size={16} />
                          </div>
                          <div>
                            <p className="text-lg font-medium">{benefit}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8 pt-8 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/70 text-sm">Стоимость от</p>
                        <p className="text-3xl font-bold">${product.startingPrice}<span className="text-lg text-white/70">/мес</span></p>
                        <p className="text-white/50 text-sm">{product.priceNote}</p>
                      </div>
                      <Link
                        to="/register"
                        className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all"
                      >
                        Начать
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Pricing section */}
        <section className="py-20 lg:py-32 bg-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gray-100 rounded-full filter blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-100 rounded-full filter blur-3xl opacity-50" />

          <div className="container relative">
            <div className="text-center mb-16">
              <div className={`inline-flex items-center gap-2 ${colors.bgLight} ${colors.text} rounded-full px-4 py-2 mb-4`}>
                <span className="text-lg">💰</span>
                <span className="text-sm font-medium">Тарифы {product.name}</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Простые и прозрачные цены
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Начните бесплатно, масштабируйтесь по мере роста. 14 дней бесплатного тестирования.
              </p>
            </div>

            {/* Pricing cards */}
            {product.pricing && (
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                {product.pricing.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative rounded-3xl p-6 lg:p-8 transition-all duration-300 ${
                      plan.popular
                        ? `bg-gradient-to-br ${colors.gradient} text-white shadow-2xl ${colors.shadow} scale-105 z-10`
                        : 'bg-white border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl'
                    }`}
                  >
                    {/* Popular badge */}
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                          <Star size={14} fill="currentColor" />
                          Популярный
                        </div>
                      </div>
                    )}

                    {/* Plan name */}
                    <div className="mb-6">
                      <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                        {plan.name}
                      </h3>
                      <p className={plan.popular ? 'text-white/80' : 'text-gray-500'}>
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                          ${plan.price}
                        </span>
                        <span className={plan.popular ? 'text-white/70' : 'text-gray-500'}>
                          {plan.period}
                        </span>
                      </div>
                      <p className={`text-sm mt-2 ${plan.popular ? 'text-white/60' : 'text-gray-400'}`}>
                        {product.priceNote}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            plan.popular ? 'bg-white/20' : colors.bgLight
                          }`}>
                            <Check size={12} className={plan.popular ? 'text-white' : colors.text} />
                          </div>
                          <span className={plan.popular ? 'text-white/90' : 'text-gray-600'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link
                      to="/register"
                      className={`block w-full py-4 rounded-xl font-semibold text-center transition-all ${
                        plan.popular
                          ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'
                          : `bg-gradient-to-r ${colors.gradient} text-white hover:shadow-lg ${colors.shadow}`
                      }`}
                    >
                      {plan.popular ? 'Начать бесплатно' : 'Выбрать план'}
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom note */}
            <div className="mt-12 text-center">
              <p className="text-gray-500">
                Все тарифы включают: 14 дней бесплатно • Техподдержка 24/7 • Без кредитной карты
              </p>
              <p className="mt-4 text-gray-600">
                Нужны особые условия?{' '}
                <a href={CONTACTS.whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${colors.text} font-medium hover:underline`}>
                  Свяжитесь с нами
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Other products */}
        {otherProducts.length > 0 && (
          <section className="py-20 bg-gray-50">
            <div className="container">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Другие продукты</h2>
                <p className="text-gray-600">Комбинируйте модули для максимальной эффективности</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {otherProducts.map((p) => {
                  const pColors = colorClasses[p.color] || colorClasses.blue;
                  return (
                    <Link
                      key={p.id}
                      to={`/products/${p.id}`}
                      className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                      <div className={`w-14 h-14 bg-gradient-to-br ${pColors.gradient} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-lg ${pColors.shadow} group-hover:scale-110 transition-transform`}>
                        {p.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{p.name}</h3>
                      <p className="text-gray-600 mb-4">{p.shortDescription}</p>
                      <div className={`flex items-center gap-2 ${pColors.text} font-medium`}>
                        Подробнее
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className={`py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden`}>
          {/* Background */}
          <div className="absolute inset-0">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r ${colors.gradient} rounded-full filter blur-3xl opacity-10`} />
          </div>

          <div className="container relative text-center">
            <div className="text-8xl mb-6 animate-bounce" style={{ animationDuration: '3s' }}>
              {product.icon}
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Готовы начать с {product.name}?
            </h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Присоединяйтесь к сотням компаний, которые уже используют {product.name} для развития бизнеса
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all inline-flex items-center justify-center gap-2 group"
              >
                Начать бесплатно
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href={`tel:${CONTACTS.phones[0].replace(/\s/g, '')}`}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2"
              >
                <Phone size={20} />
                {CONTACTS.phones[0]}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Custom styles for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-10px) rotate(-6deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(6deg); }
          50% { transform: translateY(-10px) rotate(6deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </>
  );
}
