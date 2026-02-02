/**
 * Core translations for Arzan ecosystem
 * Supports: English, Russian, Kazakh, Turkish, Uzbek
 */

export type SupportedLanguage = 'en' | 'ru' | 'kk' | 'tr' | 'uz';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'ru';

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Common errors
    'error.generic': 'An error occurred',
    'error.notFound': 'Not found',
    'error.unauthorized': 'Unauthorized',
    'error.forbidden': 'Access denied',
    'error.validation': 'Validation error',
    'error.serverError': 'Server error',
    'error.networkError': 'Network error',
    'error.timeout': 'Request timeout',

    // Auth
    'auth.loginRequired': 'Please log in to continue',
    'auth.invalidCredentials': 'Invalid email or password',
    'auth.accountLocked': 'Account temporarily locked. Try again later.',
    'auth.sessionExpired': 'Session expired. Please log in again.',
    'auth.emailVerificationRequired': 'Please verify your email',
    'auth.passwordResetSent': 'Password reset instructions sent',
    'auth.passwordChanged': 'Password changed successfully',
    'auth.logout': 'Logged out successfully',

    // Billing
    'billing.sessionError': 'Payment session creation error',
    'billing.subscriptionActive': 'Subscription activated',
    'billing.subscriptionCancelled': 'Subscription cancelled',
    'billing.dataError': 'Error getting data',
    'billing.subscriptionStatusError': 'Error getting subscription status',
    'billing.featuresError': 'Error getting features',
    'billing.plansError': 'Error getting pricing plans',
    'billing.upgradeError': 'Error processing upgrade request',
    'billing.dialogsPackagesError': 'Error getting dialog packages',
    'billing.dialogsBalanceError': 'Error getting dialog balance',
    'billing.dialogsPurchaseError': 'Error purchasing dialog package',
    'billing.purchaseHistoryError': 'Error getting purchase history',
    'billing.aiFeaturesError': 'Error getting AI features',
    'billing.aiSubscribeError': 'Error subscribing to AI feature',
    'billing.aiUnsubscribeError': 'Error unsubscribing',
    'billing.settingsGetError': 'Error getting settings',
    'billing.settingsSaveError': 'Error saving settings',
    'billing.requestError': 'Request error',
    'billing.pendingRequestExists': 'You already have a pending request for this add-on',
    'billing.connectionRequestSubmitted': 'Connection request submitted. Our team will contact you for payment.',
    'billing.addonsError': 'Error loading add-ons',
    'billing.purchasesError': 'Error loading purchases',
    'billing.purchaseError': 'Error processing purchase',
    'billing.dialogsAnalyticsError': 'Error loading dialog analytics',

    // Integration
    'integration.connected': 'Connected successfully!',
    'integration.cancelled': 'Connection cancelled',
    'integration.error': 'Connection error',
    'integration.status.connected': 'Connected',
    'integration.status.disconnected': 'Disconnected',
    'integration.status.pending': 'Pending',
    'integration.status.error': 'Error',

    // Data loading
    'contacts.loadError': 'Error loading contacts',
    'deals.loadError': 'Error loading deals',
    'tasks.loadError': 'Error loading tasks',
    'media.uploadError': 'Media upload error',

    // Success messages
    'success.saved': 'Saved successfully',
    'success.deleted': 'Deleted successfully',
    'success.updated': 'Updated successfully',
    'success.created': 'Created successfully',
  },

  ru: {
    // Common errors
    'error.generic': 'Произошла ошибка',
    'error.notFound': 'Не найдено',
    'error.unauthorized': 'Не авторизован',
    'error.forbidden': 'Доступ запрещен',
    'error.validation': 'Ошибка валидации',
    'error.serverError': 'Ошибка сервера',
    'error.networkError': 'Ошибка сети',
    'error.timeout': 'Превышено время ожидания',

    // Auth
    'auth.loginRequired': 'Пожалуйста, войдите в систему',
    'auth.invalidCredentials': 'Неверный email или пароль',
    'auth.accountLocked': 'Аккаунт временно заблокирован. Попробуйте позже.',
    'auth.sessionExpired': 'Сессия истекла. Войдите снова.',
    'auth.emailVerificationRequired': 'Подтвердите ваш email',
    'auth.passwordResetSent': 'Инструкции по сбросу пароля отправлены',
    'auth.passwordChanged': 'Пароль успешно изменен',
    'auth.logout': 'Вы вышли из системы',

    // Billing
    'billing.sessionError': 'Ошибка создания сессии оплаты',
    'billing.subscriptionActive': 'Подписка активирована',
    'billing.subscriptionCancelled': 'Подписка отменена',
    'billing.dataError': 'Ошибка получения данных',
    'billing.subscriptionStatusError': 'Ошибка при получении статуса подписки',
    'billing.featuresError': 'Ошибка при получении функций',
    'billing.plansError': 'Ошибка при получении тарифных планов',
    'billing.upgradeError': 'Ошибка при обработке запроса на обновление',
    'billing.dialogsPackagesError': 'Ошибка получения пакетов диалогов',
    'billing.dialogsBalanceError': 'Ошибка получения баланса диалогов',
    'billing.dialogsPurchaseError': 'Ошибка покупки пакета диалогов',
    'billing.purchaseHistoryError': 'Ошибка получения истории покупок',
    'billing.aiFeaturesError': 'Ошибка получения AI функций',
    'billing.aiSubscribeError': 'Ошибка подписки на AI функцию',
    'billing.aiUnsubscribeError': 'Ошибка отмены подписки',
    'billing.settingsGetError': 'Ошибка получения настроек',
    'billing.settingsSaveError': 'Ошибка сохранения настроек',
    'billing.requestError': 'Ошибка запроса',
    'billing.pendingRequestExists': 'У вас уже есть ожидающая заявка на это дополнение',
    'billing.connectionRequestSubmitted': 'Заявка на подключение отправлена. Наша команда свяжется с вами для оплаты.',
    'billing.addonsError': 'Ошибка загрузки дополнений',
    'billing.purchasesError': 'Ошибка загрузки покупок',
    'billing.purchaseError': 'Ошибка обработки покупки',
    'billing.dialogsAnalyticsError': 'Ошибка загрузки аналитики диалогов',

    // Integration
    'integration.connected': 'Подключено успешно!',
    'integration.cancelled': 'Подключение отменено',
    'integration.error': 'Ошибка подключения',
    'integration.status.connected': 'Подключено',
    'integration.status.disconnected': 'Отключено',
    'integration.status.pending': 'Ожидание',
    'integration.status.error': 'Ошибка',

    // Data loading
    'contacts.loadError': 'Ошибка при загрузке контактов',
    'deals.loadError': 'Ошибка при загрузке сделок',
    'tasks.loadError': 'Ошибка при загрузке задач',
    'media.uploadError': 'Ошибка загрузки медиа',

    // Success messages
    'success.saved': 'Сохранено успешно',
    'success.deleted': 'Удалено успешно',
    'success.updated': 'Обновлено успешно',
    'success.created': 'Создано успешно',
  },

  kk: {
    // Common errors
    'error.generic': 'Қате орын алды',
    'error.notFound': 'Табылмады',
    'error.unauthorized': 'Авторизация жоқ',
    'error.forbidden': 'Кіруге тыйым салынған',
    'error.validation': 'Валидация қатесі',
    'error.serverError': 'Сервер қатесі',
    'error.networkError': 'Желі қатесі',
    'error.timeout': 'Күту уақыты асты',

    // Auth
    'auth.loginRequired': 'Жүйеге кіріңіз',
    'auth.invalidCredentials': 'Қате email немесе құпия сөз',
    'auth.accountLocked': 'Аккаунт уақытша бұғатталған. Кейінірек қайталаңыз.',
    'auth.sessionExpired': 'Сессия мерзімі аяқталды. Қайта кіріңіз.',
    'auth.emailVerificationRequired': 'Email-ді растаңыз',
    'auth.passwordResetSent': 'Құпия сөзді қалпына келтіру нұсқаулары жіберілді',
    'auth.passwordChanged': 'Құпия сөз сәтті өзгертілді',
    'auth.logout': 'Жүйеден шықтыңыз',

    // Billing
    'billing.sessionError': 'Төлем сессиясын құру қатесі',
    'billing.subscriptionActive': 'Жазылым белсендірілді',
    'billing.subscriptionCancelled': 'Жазылым тоқтатылды',
    'billing.dataError': 'Деректерді алу қатесі',
    'billing.subscriptionStatusError': 'Жазылым күйін алу қатесі',
    'billing.featuresError': 'Функцияларды алу қатесі',
    'billing.plansError': 'Тарифтік жоспарларды алу қатесі',
    'billing.upgradeError': 'Жаңарту сұрауын өңдеу қатесі',
    'billing.dialogsPackagesError': 'Диалог пакеттерін алу қатесі',
    'billing.dialogsBalanceError': 'Диалог балансын алу қатесі',
    'billing.dialogsPurchaseError': 'Диалог пакетін сатып алу қатесі',
    'billing.purchaseHistoryError': 'Сатып алу тарихын алу қатесі',
    'billing.aiFeaturesError': 'AI функцияларын алу қатесі',
    'billing.aiSubscribeError': 'AI функциясына жазылу қатесі',
    'billing.aiUnsubscribeError': 'Жазылымды тоқтату қатесі',
    'billing.settingsGetError': 'Параметрлерді алу қатесі',
    'billing.settingsSaveError': 'Параметрлерді сақтау қатесі',
    'billing.requestError': 'Сұрау қатесі',
    'billing.pendingRequestExists': 'Бұл қосымшаға сіздің күтудегі өтініміңіз бар',
    'billing.connectionRequestSubmitted': 'Қосылу өтініші жіберілді. Біздің команда төлем үшін сізбен байланысады.',
    'billing.addonsError': 'Қосымшаларды жүктеу қатесі',
    'billing.purchasesError': 'Сатып алуларды жүктеу қатесі',
    'billing.purchaseError': 'Сатып алуды өңдеу қатесі',
    'billing.dialogsAnalyticsError': 'Диалог аналитикасын жүктеу қатесі',

    // Integration
    'integration.connected': 'Сәтті қосылды!',
    'integration.cancelled': 'Қосылу тоқтатылды',
    'integration.error': 'Қосылу қатесі',
    'integration.status.connected': 'Қосылған',
    'integration.status.disconnected': 'Ажыратылған',
    'integration.status.pending': 'Күтуде',
    'integration.status.error': 'Қате',

    // Data loading
    'contacts.loadError': 'Контактілерді жүктеу қатесі',
    'deals.loadError': 'Мәмілелерді жүктеу қатесі',
    'tasks.loadError': 'Тапсырмаларды жүктеу қатесі',
    'media.uploadError': 'Медиа жүктеу қатесі',

    // Success messages
    'success.saved': 'Сәтті сақталды',
    'success.deleted': 'Сәтті жойылды',
    'success.updated': 'Сәтті жаңартылды',
    'success.created': 'Сәтті құрылды',
  },

  tr: {
    // Common errors
    'error.generic': 'Bir hata oluştu',
    'error.notFound': 'Bulunamadı',
    'error.unauthorized': 'Yetkisiz',
    'error.forbidden': 'Erişim engellendi',
    'error.validation': 'Doğrulama hatası',
    'error.serverError': 'Sunucu hatası',
    'error.networkError': 'Ağ hatası',
    'error.timeout': 'İstek zaman aşımına uğradı',

    // Auth
    'auth.loginRequired': 'Devam etmek için giriş yapın',
    'auth.invalidCredentials': 'Geçersiz e-posta veya şifre',
    'auth.accountLocked': 'Hesap geçici olarak kilitlendi. Daha sonra tekrar deneyin.',
    'auth.sessionExpired': 'Oturum süresi doldu. Tekrar giriş yapın.',
    'auth.emailVerificationRequired': 'E-postanızı doğrulayın',
    'auth.passwordResetSent': 'Şifre sıfırlama talimatları gönderildi',
    'auth.passwordChanged': 'Şifre başarıyla değiştirildi',
    'auth.logout': 'Başarıyla çıkış yapıldı',

    // Billing
    'billing.sessionError': 'Ödeme oturumu oluşturma hatası',
    'billing.subscriptionActive': 'Abonelik etkinleştirildi',
    'billing.subscriptionCancelled': 'Abonelik iptal edildi',
    'billing.dataError': 'Veri alınırken hata',
    'billing.subscriptionStatusError': 'Abonelik durumu alınırken hata',
    'billing.featuresError': 'Özellikler alınırken hata',
    'billing.plansError': 'Fiyatlandırma planları alınırken hata',
    'billing.upgradeError': 'Yükseltme isteği işlenirken hata',
    'billing.dialogsPackagesError': 'Diyalog paketleri alınırken hata',
    'billing.dialogsBalanceError': 'Diyalog bakiyesi alınırken hata',
    'billing.dialogsPurchaseError': 'Diyalog paketi satın alınırken hata',
    'billing.purchaseHistoryError': 'Satın alma geçmişi alınırken hata',
    'billing.aiFeaturesError': 'AI özellikleri alınırken hata',
    'billing.aiSubscribeError': 'AI özelliğine abone olunurken hata',
    'billing.aiUnsubscribeError': 'Abonelik iptal edilirken hata',
    'billing.settingsGetError': 'Ayarlar alınırken hata',
    'billing.settingsSaveError': 'Ayarlar kaydedilirken hata',
    'billing.requestError': 'İstek hatası',
    'billing.pendingRequestExists': 'Bu eklenti için zaten bekleyen bir talebiniz var',
    'billing.connectionRequestSubmitted': 'Bağlantı talebi gönderildi. Ekibimiz ödeme için sizinle iletişime geçecek.',
    'billing.addonsError': 'Eklentiler yüklenirken hata',
    'billing.purchasesError': 'Satın almalar yüklenirken hata',
    'billing.purchaseError': 'Satın alma işlenirken hata',
    'billing.dialogsAnalyticsError': 'Diyalog analizi yüklenirken hata',

    // Integration
    'integration.connected': 'Başarıyla bağlandı!',
    'integration.cancelled': 'Bağlantı iptal edildi',
    'integration.error': 'Bağlantı hatası',
    'integration.status.connected': 'Bağlı',
    'integration.status.disconnected': 'Bağlı değil',
    'integration.status.pending': 'Beklemede',
    'integration.status.error': 'Hata',

    // Data loading
    'contacts.loadError': 'Kişiler yüklenirken hata',
    'deals.loadError': 'Anlaşmalar yüklenirken hata',
    'tasks.loadError': 'Görevler yüklenirken hata',
    'media.uploadError': 'Medya yükleme hatası',

    // Success messages
    'success.saved': 'Başarıyla kaydedildi',
    'success.deleted': 'Başarıyla silindi',
    'success.updated': 'Başarıyla güncellendi',
    'success.created': 'Başarıyla oluşturuldu',
  },

  uz: {
    // Common errors
    'error.generic': 'Xatolik yuz berdi',
    'error.notFound': 'Topilmadi',
    'error.unauthorized': 'Avtorizatsiya yo\'q',
    'error.forbidden': 'Kirish taqiqlangan',
    'error.validation': 'Validatsiya xatosi',
    'error.serverError': 'Server xatosi',
    'error.networkError': 'Tarmoq xatosi',
    'error.timeout': 'So\'rov vaqti tugadi',

    // Auth
    'auth.loginRequired': 'Davom etish uchun tizimga kiring',
    'auth.invalidCredentials': 'Noto\'g\'ri email yoki parol',
    'auth.accountLocked': 'Hisob vaqtincha bloklangan. Keyinroq qayta urinib ko\'ring.',
    'auth.sessionExpired': 'Sessiya muddati tugadi. Qayta kiring.',
    'auth.emailVerificationRequired': 'Emailingizni tasdiqlang',
    'auth.passwordResetSent': 'Parolni tiklash ko\'rsatmalari yuborildi',
    'auth.passwordChanged': 'Parol muvaffaqiyatli o\'zgartirildi',
    'auth.logout': 'Tizimdan chiqdingiz',

    // Billing
    'billing.sessionError': 'To\'lov sessiyasini yaratish xatosi',
    'billing.subscriptionActive': 'Obuna faollashtirildi',
    'billing.subscriptionCancelled': 'Obuna bekor qilindi',
    'billing.dataError': 'Ma\'lumotlarni olish xatosi',
    'billing.subscriptionStatusError': 'Obuna holatini olish xatosi',
    'billing.featuresError': 'Funksiyalarni olish xatosi',
    'billing.plansError': 'Tarif rejalarini olish xatosi',
    'billing.upgradeError': 'Yangilash so\'rovini qayta ishlash xatosi',
    'billing.dialogsPackagesError': 'Dialog paketlarini olish xatosi',
    'billing.dialogsBalanceError': 'Dialog balansini olish xatosi',
    'billing.dialogsPurchaseError': 'Dialog paketini sotib olish xatosi',
    'billing.purchaseHistoryError': 'Sotib olish tarixini olish xatosi',
    'billing.aiFeaturesError': 'AI funksiyalarini olish xatosi',
    'billing.aiSubscribeError': 'AI funksiyasiga obuna bo\'lish xatosi',
    'billing.aiUnsubscribeError': 'Obunani bekor qilish xatosi',
    'billing.settingsGetError': 'Sozlamalarni olish xatosi',
    'billing.settingsSaveError': 'Sozlamalarni saqlash xatosi',
    'billing.requestError': 'So\'rov xatosi',
    'billing.pendingRequestExists': 'Bu qo\'shimcha uchun sizda allaqachon kutilayotgan so\'rov bor',
    'billing.connectionRequestSubmitted': 'Ulanish so\'rovi yuborildi. Jamoamiz to\'lov uchun siz bilan bog\'lanadi.',
    'billing.addonsError': 'Qo\'shimchalarni yuklash xatosi',
    'billing.purchasesError': 'Sotib olishlarni yuklash xatosi',
    'billing.purchaseError': 'Sotib olishni qayta ishlash xatosi',
    'billing.dialogsAnalyticsError': 'Dialog tahlilini yuklash xatosi',

    // Integration
    'integration.connected': 'Muvaffaqiyatli ulandi!',
    'integration.cancelled': 'Ulanish bekor qilindi',
    'integration.error': 'Ulanish xatosi',
    'integration.status.connected': 'Ulangan',
    'integration.status.disconnected': 'Uzilgan',
    'integration.status.pending': 'Kutilmoqda',
    'integration.status.error': 'Xato',

    // Data loading
    'contacts.loadError': 'Kontaktlarni yuklash xatosi',
    'deals.loadError': 'Bitimlarni yuklash xatosi',
    'tasks.loadError': 'Vazifalarni yuklash xatosi',
    'media.uploadError': 'Media yuklash xatosi',

    // Success messages
    'success.saved': 'Muvaffaqiyatli saqlandi',
    'success.deleted': 'Muvaffaqiyatli o\'chirildi',
    'success.updated': 'Muvaffaqiyatli yangilandi',
    'success.created': 'Muvaffaqiyatli yaratildi',
  },
};
