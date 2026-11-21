// Какие возможности устройства включены в приложении — ЕДИНСТВЕННОЕ место, где они
// включаются/выключаются. Заготовка содержит всё; в конкретном приложении лишнее
// выключите здесь (false), а если возможность не нужна совсем — удалите и её модуль
// из src/native/, и cordova-плагин (см. таблицу в README).
//
// Значение — «на этой платформе функция в принципе есть». Наличие самого
// cordova-плагина каждый модуль src/native/* дополнительно проверяет в рантайме
// (плагин мог не установиться, страница открыта в dev-браузере) и в его отсутствие
// использует веб-фолбэк или честно сообщает «недоступно».
import {isAndroid, isIos, isWeb, isNativeBuild} from '@/config/platform';

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

    // Микрофон: запись звука и уровень громкости — getUserMedia + MediaRecorder, без плагинов.
    // В Android WebView нужен runtime-доступ RECORD_AUDIO (запрашивается через
    // cordova-plugin-android-permissions) и разрешение в config.xml cordova-проекта.
    microphone: true,

    // Датчики движения: наклон (пузырьковый уровень), ускорение, встряхивание —
    // DeviceOrientationEvent/DeviceMotionEvent, без плагинов. iOS спрашивает разрешение по жесту.
    motion: true,

    // Локальные уведомления-напоминания: cordova-plugin-local-notification; в вебе — Notification API
    // (только пока вкладка открыта)
    notifications: true,

    // Push-уведомления с сервера (Firebase): плагин cordova-plugin-firebasex НЕ установлен —
    // нужен google-services.json своего Firebase-проекта. Как подключить — README, пример «Push».
    push: false,

    // Офлайн-очередь запросов (src/libraries/offlineQueue.js) — без плагинов
    offlineQueue: true,

    // Отчёты об ошибках JS (src/libraries/errorReporter.js), куда слать — APP.ERROR_REPORTS
    errorReports: true,

    // Не гасить экран: cordova-plugin-insomnia; в вебе — Screen Wake Lock API
    wakeLock: true,

    // Фонарик: вспышка через видеопоток камеры (getUserMedia + torch), без плагинов; не iOS
    torch: !isIos,

    // Кнопки воспроизведения в шторке/на экране блокировки: Media Session API (веб),
    // в Android-приложении — cordova-plugin-music-controls2
    mediaSession: true,

    // «Поделиться»: cordova-plugin-x-socialsharing; в вебе — Web Share API или буфер обмена
    share: true,

    // Карта: Leaflet + OpenStreetMap (настройки — APP.MAP), без плагинов
    map: true,

    // Вход в аккаунт по коду из письма (src/libraries/auth.js, APP.AUTH)
    auth: true,

    // Вход по отпечатку/лицу: cordova-plugin-fingerprint-aio (только приложение)
    biometric: isNativeBuild,

    // NFC-метки и карты: phonegap-nfc (Android); в вебе — Web NFC (Chrome Android)
    nfc: !isIos,

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

    // Раздел «Примеры» (/examples) — мини-приложения на каждую возможность: компас,
    // GPS-трекер, сканер, камера, диктофон, уровень… Код — src/components/examples/.
    // В боевом приложении выключить (или удалить папку и маршруты).
    examples: true,
};
