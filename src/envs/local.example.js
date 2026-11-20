// Окружение dev-сервера (npm run serve). Копируется в local.js при первом запуске
// (см. vue.config.js); local.js в git не хранится — правьте его под себя.
export class EnvConfig {
    // Бэкенд приложения (API, проверка обновлений, скачивание APK). На телефоне/эмуляторе
    // localhost — это само устройство: для сборки под них подставьте IP компьютера в сети.
    static SITE_ROOT_URL = 'http://localhost:98/';
    // Ссылка на скачивание свежего APK (самообновление, FEATURES.appUpdates).
    // Секретный код — свой у каждого проекта, поэтому он здесь, а не в коде.
    static APP_DOWNLOAD_URL = 'http://localhost:98/app/get?secretCode=CHANGE_ME';
    // Fallback, если сборка запущена без VUE_APP_PLATFORM (её ставит Makefile). См. config/platform.js
    static PLATFORM = 'web'; // web, android, ios
    static DEBUG = true;
}
