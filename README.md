# Default JS App — заготовка js-приложения (Vue 3 + Cordova)

Одна кодовая база → веб-версия/PWA, Android-приложение (APK) и iOS-приложение.
Заготовка собрана из лучшего, что накопилось в `zmi-music-player-app`, `kkosa-attractions-app`,
`kkosa-performance-app`, `kkosa2-app`, `vpark-app`, и **содержит все возможности устройства сразу**
(GPS, компас, камера, сканер кодов, файлы, фоновый режим, самообновление…) — лишнее выключается
одним флагом в конфиге.

Проект — это две соседние папки:

| Папка | Что |
|---|---|
| `my-app/` (эта заготовка) | само приложение: Vue 3 SPA, свои Cordova-плагины, скрипты сборки |
| `my-app-cordova/` (`default-js-app-cordova`) | Cordova-оболочка: `config.xml`, иконки, хуки, список плагинов. Кода приложения там нет |

Имя cordova-папки = имя папки приложения + `-cordova` — скрипты сборки находят её сами.

## Быстрый старт

```bash
make install   # npm install здесь и в ../<имя>-cordova
make start     # dev-сервер: http://localhost:8080
```

При первом `serve`/`build` из `src/envs/*.example.js` создаются `src/envs/local.js` и `prod.js`
(в git их нет) — пропишите там адрес своего бэкенда.

## Новое приложение из заготовки

1. Скопировать обе папки: `default-js-app` → `my-app`, `default-js-app-cordova` → `my-app-cordova`.
2. Здесь: `name`/`version` в `package.json`, `NAME`/`DESCRIPTION` в `src/config/app.js`,
   название в `public/index.html` и `public/manifest.webmanifest`, префикс кэша в `public/service-worker.js`.
3. В cordova-проекте: `id`, `name`, `description` в `config.xml`, `name` в `package.json`, путь
   `file:../my-app/native-plugins/...` у своих плагинов в `package.json`.
4. Иконка: положить квадратную картинку 1024×1024 в `resources/icon.png` и запустить `make icons` —
   сгенерируются favicon, PWA-иконки, иконки Android (включая адаптивную) и iOS.
5. Выключить ненужные возможности в `src/config/features.js` (и при желании удалить их плагины, см. таблицу ниже).
6. Демо-страницу «Возможности устройства» выключить: `devicePage: false`.

## Команды

| Команда | Что делает |
|---|---|
| `make start` | dev-сервер (`npm run serve`) |
| `make build-web` | веб-версия в `dist/` |
| `make build-android` | APK → `dist-apps/<version>.apk` (версия из `package.json`) |
| `make install-android` | поставить этот APK на подключённый телефон/эмулятор (`adb`) |
| `make build-ios` / `make prepare-ios` | iOS (нужен Xcode) / только подготовить iOS-проект |
| `make icons` | все иконки из `resources/icon.png` |
| `make build-app`, `build-dist` | старые имена `build-android`, `build-web` |

`make build-android` по шагам: `npm run build` (с `VUE_APP_PLATFORM=android`) →
`prepare-to-cordova.js` (CSP с `blob:`/`data:`, `cordova.js`, относительные пути) →
`copy-to-cordova-project.js` (`dist/` → `../<имя>-cordova/www/`) → `cordova build android`
(на свежем клоне сначала `cordova prepare android` — ставит платформу и плагины по `package.json` cordova-проекта) → копия APK в `dist-apps/`.

**Внимание:** `make build-android` меняет `dist/index.html` под Cordova — для проверки веб-версии
после него пересоберите `make build-web`.

## Конфигурация

| Файл | Что в нём |
|---|---|
| `src/config/features.js` | **какие возможности устройства включены** (по платформам) |
| `src/config/app.js` | имя, pull-to-refresh, бейдж версии, настройки самообновления |
| `src/config/platform.js` | платформа сборки: `PLATFORM`, `isWeb/isAndroid/isIos` |
| `src/envs/local.js`, `prod.js` | адрес бэкенда, ссылка на APK (с секретным кодом), DEBUG. Не в git |
| `src/router/menu.js` | пункты бокового и нижнего меню, keep-alive страниц |
| `src/router/routes.js` | маршруты (hash-история — работает и под `file://`) |

Окружение: dev-сервер → `local`, любая сборка → `prod`; `VUE_APP_ENV=local make build-android` —
APK, который ходит на локальный бэкенд (в `local.js` тогда нужен IP компьютера, а не localhost).

## Возможности устройства (`src/native/`)

Каждый модуль сам проверяет свой флаг в `FEATURES` и наличие плагина; без плагина (браузер)
использует веб-фолбэк или бросает понятную ошибку на русском. Демо всего — страница `/device`.

| Флаг `FEATURES` | Модуль | Cordova-плагин | Веб-фолбэк |
|---|---|---|---|
| `geolocation`, `geolocationPermissionOnStartup` | `geolocation.js` — `getCurrentPosition`, `watchPosition` (с фоновым режимом), `distanceMeters` | `cordova-plugin-geolocation`, `cordova-plugin-android-permissions` | `navigator.geolocation` (https/localhost) |
| `compass` | `compass.js` — `startCompass` | — | `DeviceOrientationEvent` |
| `camera` | `camera.js` — `takePhoto`, `selectPhoto` → `{dataUrl, blob}` | `cordova-plugin-camera` | `<input type=file capture>` |
| `scanner` | `scanner.js` — `scan({formats})` → строка | `@red-mobile/cordova-plugin-barcodescanner` | `BarcodeDetector` по фото (Chrome) |
| `vibration` | `vibration.js` — `vibrate` | — | `navigator.vibrate` |
| `backgroundMode` | `backgroundMode.js` — `enableBackgroundMode(reason)` / `disable` | `cordova-plugin-background-mode` + хук `fix-background-service-type.js` | нет (no-op) |
| `files` | `files.js` — `downloadFile` (с прогрессом), `openFile` | `cordova-plugin-file`, `-file-transfer`, `-file-opener2` | скачивание браузером |
| `appUpdates` | `appUpdates.js` + страница `CheckUpdatesPage` | те же + `cordova-plugin-inappbrowser` | — (только Android) |
| `externalLinks` | `browser.js` — `openExternal`, `openInApp` | `cordova-plugin-inappbrowser` | `window.open` |
| `deviceInfo` | `device.js` — `getDeviceInfo` | `cordova-plugin-device` | userAgent |
| `audioOutput` | `audioOutput.js` — `useAudioOutput()` | свой `native-plugins/cordova-plugin-audio-output` | только список |
| `openLinks` | `openLinks.js` — App Links / своя схема → маршрут | свой `native-plugins/cordova-plugin-open-link` (не установлен по умолчанию) | — |
| `backButton` | `backButton.js` — «Назад» на Android: меню → история → свернуть | — | — |
| `pwa` | service worker + manifest | — | — |

Общие помощники: `cordova.js` (`deviceReady()`, `getPlugin()`), `permissions.js` (runtime-разрешения Android).

**Удалить возможность совсем:** флаг → `false`; модуль из `src/native/` и его использование; плагин —
`cd ../<имя>-cordova && cordova plugin rm <плагин> --save`.

### Свои плагины (`native-plugins/`)

Ставятся в cordova-проект из этой папки (`file:../<имя>/native-plugins/...` в его `package.json`).
После правки Java-кода плагина: `cordova plugin rm <имя> && cordova plugin add ../<имя>/native-plugins/<плагин>`,
иначе в сборку поедет старая копия.

`cordova-plugin-open-link` нужны параметры приложения:
```bash
cordova plugin add ../my-app/native-plugins/cordova-plugin-open-link --save \
    --variable LINK_HOST=site.ru --variable LINK_PATH_PREFIX=/ --variable URL_SCHEME=myapp
```
и `FEATURES.openLinks = true`. Для https-ссылок Android 12+ сайт должен отдавать
`/.well-known/assetlinks.json` с SHA256 ключа подписи APK.

## Остальное в `src/`

- `libraries/Api.js` — все запросы к бэкенду: `API_ROOT_URL = SITE_ROOT_URL + 'api/v1.0/'`, ответы
  `{is_success, is_error, data}`, Bearer-токен (`Api.authToken`), обработчик 401, индикатор сети.
- `libraries/localDB.js` — IndexedDB (idb): таблицы, key-value, Blob.
- `helpers/errors.js` — `userErrorMessage(e)`: понятный текст ошибки без технических деталей.
- `components/UI/` — глобальные компоненты: `my-loader`, `info-block`, `popup-message`, `network-status`, `switcher-sizes`.
- `directives/` — `v-swipe-left`, `v-swipe-right`.
- `styles/scss/` — Bootstrap 5 (подключены только используемые модули, см. `App.vue`), шрифт PT Sans,
  стеклянные панели. Из bootstrap-icons в сборку попадают только встречающиеся в `src/` иконки —
  **имена `bi-…` писать целиком**.

## Окружение для сборки приложений

1. Android Studio (удобно ставить SDK и эмуляторы), Android SDK, JDK 17, Gradle
2. Cordova CLI (`npm i -g cordova`), Node.js/npm
3. Для iOS — Xcode

Например, в `~/.bash_profile`:
```shell
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
export PATH="/opt/homebrew/opt/gradle@8/bin:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
export ANDROID_AVD_HOME=~/.android/avd
```
