# Arzan Platform Core

Ядро платформы Arzan - мультипродуктовая SaaS платформа.

## Структура

```
arzancore/
├── apps/
│   └── portal/          # Главное приложение arzan.cloud
│
├── packages/
│   ├── ui/              # @arzan/ui - UI компоненты
│   ├── auth/            # @arzan/auth - Авторизация
│   ├── billing/         # @arzan/billing - Биллинг и подписки
│   ├── database/        # @arzan/database - Схема БД
│   ├── modules/         # @arzan/modules - Система модулей
│   ├── events/          # @arzan/events - Event Bus
│   ├── i18n/            # @arzan/i18n - Интернационализация
│   └── utils/           # @arzan/utils - Утилиты
│
└── server/              # Backend для Portal
```

## Продукты платформы

| Продукт | Описание | Репозиторий |
|---------|----------|-------------|
| CRM | Продажи, сделки, клиенты | arzan-crm |
| AI+MSG | Чатботы, мессенджеры | arzan-ai-messenger |
| Shop | E-commerce, магазин | arzan-shop |
| Booking | Онлайн-запись | arzan-booking |
| Med | Медицина, клиники | arzan-med |
| Rent | Аренда, прокат | arzan-rent |
| Build | Строительство, ремонт | arzan-build |

## Установка

```bash
npm install
```

## Разработка

```bash
# Запуск всех приложений
npm run dev

# Запуск только Portal
npm run dev:portal

# Сборка всех пакетов
npm run build:packages
```

## Технологии

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3+
- **Monorepo**: Turborepo
- **Frontend**: React 18, Vite, TailwindCSS, Radix UI
- **Backend**: Hono.js
- **Database**: PostgreSQL, Drizzle ORM
- **Cache**: Redis
- **Payments**: Stripe
