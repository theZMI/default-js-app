// Самообновление Android-приложения: узнать последнюю версию на сервере, скачать APK
// и запустить его установку. Сервер должен отдавать:
//   GET {API_ROOT_URL}{APP.UPDATES.VERSION_URI} → {is_success, data: "1.0.3"}
//   GET {APP.UPDATES.DOWNLOAD_URL}               → сам APK
// Версия текущей сборки — version из package.json (её же move-android-app.js
// использует как имя APK в dist-apps/). Поднимайте её перед каждой сборкой.
//
// Установка APK требует REQUEST_INSTALL_PACKAGES (config.xml cordova-проекта) и
// cordova-plugin-file-opener2; при первом обновлении Android попросит разрешить
// установку из этого источника.
import semver from 'semver';
import Api from '@/libraries/Api';
import {APP} from '@/config/app';
import {FEATURES} from '@/config/features';
import {downloadFile, openFile, MIME} from '@/native/files';
import {openExternal} from '@/native/browser';

// eslint-disable-next-line no-undef
export const CURRENT_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

export function isAppUpdatesAvailable() {
    return FEATURES.appUpdates;
}

/** {latest, hasUpdate} */
export async function checkLatestVersion() {
    const latest = String(await Api.get(APP.UPDATES.VERSION_URI)).trim();
    if (!semver.valid(latest)) throw new Error('Сервер прислал непонятный номер версии.');
    return {latest, hasUpdate: semver.gt(latest, CURRENT_VERSION)};
}

/** Скачать APK версии version. Возвращает путь к файлу для installApk(). */
export function downloadApk(version, onProgress) {
    return downloadFile(APP.UPDATES.DOWNLOAD_URL, `${APP.UPDATES.APK_FILE_PREFIX}${version}.apk`, {onProgress});
}

export function installApk(filePath) {
    return openFile(filePath, MIME.APK);
}

// Запасной путь, если скачивание внутри приложения не удалось: браузер скачает APK в «Загрузки»
export function downloadViaBrowser() {
    openExternal(APP.UPDATES.DOWNLOAD_URL);
}
