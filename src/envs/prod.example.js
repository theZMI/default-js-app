// Окружение любой сборки (веб для выкладки, APK, iOS). Копируется в prod.js при первом
// запуске (см. vue.config.js); prod.js в git не хранится — правьте его под себя.
export class EnvConfig {
    static SITE_ROOT_URL = 'https://example.com/';
    static APP_DOWNLOAD_URL = 'https://example.com/app/get?secretCode=CHANGE_ME';
    static PLATFORM = 'android'; // web, android, ios — fallback, если нет VUE_APP_PLATFORM
    static DEBUG = false;
}
