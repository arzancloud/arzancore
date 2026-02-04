import { Puzzle, Zap, Shield, Globe, Headphones, Link } from 'lucide-react';
import { FEATURES } from '../../lib/constants';

const iconMap: Record<string, React.FC<{ size?: string | number; className?: string }>> = {
  Puzzle,
  Zap,
  Shield,
  Globe,
  Headphones,
  Link,
};

export default function Features() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-white">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 rounded-full px-4 py-2 mb-4">
            <Zap size={16} />
            <span className="text-sm font-medium">Почему ArzanCloud</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Всё для роста{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              вашего бизнеса
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Мы создали платформу, которая растёт вместе с вашим бизнесом.
            От стартапа до корпорации — ArzanCloud подстроится под ваши задачи.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Puzzle;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                  <Icon className="text-white" size={28} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>

                {/* Hover arrow */}
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Готовы начать?</h3>
              <p className="text-gray-600">Попробуйте бесплатно в течение 14 дней</p>
            </div>
            <a
              href="/register"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all whitespace-nowrap"
            >
              Начать бесплатно
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
