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
