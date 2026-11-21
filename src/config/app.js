// Общие настройки приложения. Всё, что отличается между проектами, созданными из
// заготовки, — здесь (имя, поведение оболочки), в src/config/features.js (какие
// возможности устройства включены) и в src/router/menu.js (пункты меню).
import Env from '@/env';

export const APP = {
    NAME: 'Default JS App',
    DESCRIPTION: 'Заготовка js-приложения (Vue 3 + Cordova)',

    // Бейдж с версией в правом верхнем углу (удобно тестировщикам)
    SHOW_VERSION_BADGE: false,

    // Потянуть страницу вниз — перезагрузить приложение. Страницы, где жест мешает
    // (карта, свой скролл), перечислите в PULL_TO_REFRESH_DISABLED_PAGES.
    PULL_TO_REFRESH: true,
    PULL_TO_REFRESH_DISABLED_PAGES: [],

    // Страницы, контент которых растягивается на всю высоту экрана (карта, плеер)
    STRETCH_HEIGHT_PAGES: [],

    // Жесты оболочки
    GESTURES: {
        // Провести пальцем слева направо — открыть боковое меню (справа налево — закрыть).
        // Жест начинается в левой части экрана (SWIPE_MENU_START_ZONE — доля ширины), чтобы
        // не мешать горизонтальным каруселям; элементы с атрибутом data-no-swipe (карта,
        // ползунки) жест не запускают.
        SWIPE_TO_OPEN_MENU: true,
        SWIPE_MENU_START_ZONE: 0.4,
    },

    // Отчёты об ошибках (FEATURES.errorReports, src/libraries/errorReporter.js).
    // URI — куда слать (относительно API_ROOT_URL), пусто — только копить на устройстве.
    ERROR_REPORTS: {
        URI: '',               // например 'errors'
        LOG_TO_CONSOLE: true,
    },

    // Вход в аккаунт по коду из письма (src/libraries/auth.js, пример «Вход в аккаунт»).
    // DEMO — без сервера: код всегда 1234 (чтобы пример работал из коробки). В боевом — false.
    AUTH: {
        DEMO: true,
        SEND_CODE_URI: 'auth/send-code',   // POST {email}
        LOGIN_URI: 'auth/login',           // POST {email, code} → {token, user}
        LOGOUT_URI: 'auth/logout',         // POST (с токеном)
    },

    // Карта (пример «Карта», Leaflet). Подложка OpenStreetMap: соблюдайте правила
    // https://operations.osmfoundation.org/policies/tiles/ — для боевого приложения с большой
    // аудиторией возьмите свой/коммерческий тайл-сервер и поменяйте TILE_URL.
    MAP: {
        TILE_URL: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        ATTRIBUTION: '© участники OpenStreetMap',
        MAX_ZOOM: 19,
        // Центр по умолчанию (пока не определена геолокация) — Калининград
        CENTER: [54.7104, 20.4522],
        ZOOM: 12,
    },

    // Настройки по умолчанию (страница «Настройки», src/libraries/settings.js)
    DEFAULT_SETTINGS: {
        theme: 'dark',        // dark | light | system
        textScale: 'normal',  // normal | large | xlarge
        haptics: true,        // вибро-отклик на нажатия
        lang: 'ru',           // ru | en (src/i18n)
    },

    // Самообновление APK (FEATURES.appUpdates): адрес номера последней версии
    // относительно API_ROOT_URL (ответ — строка semver, например "1.0.3") и ссылка
    // на сам APK (в env, т.к. содержит секретный код).
    UPDATES: {
        VERSION_URI: 'app/version',
        DOWNLOAD_URL: Env.APP_DOWNLOAD_URL,
        APK_FILE_PREFIX: 'default_js_app_',
        // Проверять обновление при запуске и показывать окно, если вышла новая версия
        AUTO_CHECK_ON_START: false,
    },
};
