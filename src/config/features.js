// Какие возможности устройства включены в приложении — ЕДИНСТВЕННОЕ место, где они
// включаются/выключаются. Заготовка содержит всё; в конкретном приложении лишнее
// выключите здесь (false), а если возможность не нужна совсем — удалите и её модуль
// из src/native/, и cordova-плагин (см. таблицу в README).
//
// Значение — «на этой платформе функция в принципе есть». Наличие самого
// cordova-плагина каждый модуль src/native/* дополнительно проверяет в рантайме
// (плагин мог не установиться, страница открыта в dev-браузере) и в его отсутствие
// использует веб-фолбэк или честно сообщает «недоступно».
import {isAndroid, isIos, isWeb} from '@/config/platform';

export const FEATURES = {
    // Геолокация: navigator.geolocation (в Cordova — cordova-plugin-geolocation).
    // Разрешение на Android — cordova-plugin-android-permissions.
    geolocation: true,
    // Спросить разрешение на геолокацию сразу при запуске (а не при первом обращении)
    geolocationPermissionOnStartup: false,

    // Компас (направление устройства): DeviceOrientationEvent, без плагинов
    compass: true,

    // Камера / выбор фото из галереи: cordova-plugin-camera, в вебе — <input type="file" capture>
    camera: true,

    // Сканер QR/штрихкодов: @red-mobile/cordova-plugin-barcodescanner,
    // в вебе — BarcodeDetector по фото (Chrome на Android/macOS; в Safari/Firefox его нет)
    scanner: true,

    // Вибрация: navigator.vibrate (Android; iOS не поддерживает)
    vibration: !isIos,

    // Фоновый режим (не дать Android усыпить приложение: звук, GPS-трекинг в фоне):
    // cordova-plugin-background-mode + хук fix-background-service-type.js в cordova-проекте.
    // На iOS не нужен (UIBackgroundModes в config.xml), в вебе не существует.
    backgroundMode: isAndroid,

    // Скачивание файлов на устройство и открытие их системой:
    // cordova-plugin-file + cordova-plugin-file-transfer + cordova-plugin-file-opener2.
    // В вебе — обычное скачивание браузером.
    files: true,

    // Самообновление: скачать и установить свежий APK (страница «Обновления»)
    appUpdates: isAndroid,

    // Открытие ссылок во внешнем браузере / системных приложениях: cordova-plugin-inappbrowser
    externalLinks: true,

    // Информация об устройстве: cordova-plugin-device (в вебе — userAgent)
    deviceInfo: true,

    // Список и переключение аудиовыходов: свой плагин native-plugins/cordova-plugin-audio-output
    // (только Android); в вебе — только список через enumerateDevices
    audioOutput: true,

    // Открытие приложения по ссылке (App Links / своя схема): native-plugins/cordova-plugin-open-link.
    // По умолчанию выключено: плагину нужны LINK_HOST/URL_SCHEME конкретного приложения.
    openLinks: false,

    // Аппаратная кнопка «Назад» на Android: закрыть меню/окно → назад по истории → выйти
    backButton: isAndroid,

    // PWA: service worker (офлайн-оболочка) и manifest — только в настоящем браузере
    pwa: isWeb,

    // Демо-страница «Возможности устройства» (/device) — проверка всего перечисленного.
    // В боевом приложении выключить.
    devicePage: true,
};
