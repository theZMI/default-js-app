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
6. Раздел «Примеры» выключить: `examples: false` (или удалить `src/components/examples/`).

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
использует веб-фолбэк или бросает понятную ошибку на русском.

| Флаг `FEATURES` | Модуль | Cordova-плагин | Веб-фолбэк |
|---|---|---|---|
| `geolocation`, `geolocationPermissionOnStartup` | `geolocation.js` — `getCurrentPosition`, `watchPosition` (с фоновым режимом), `distanceMeters` | `cordova-plugin-geolocation`, `cordova-plugin-android-permissions` | `navigator.geolocation` (https/localhost) |
| `compass` | `compass.js` — `startCompass` | — | `DeviceOrientationEvent` |
| `camera` | `camera.js` — `takePhoto`, `selectPhoto` → `{dataUrl, blob}` | `cordova-plugin-camera` | `<input type=file capture>` |
| `scanner` | `scanner.js` — `scan({formats})` → строка | `@red-mobile/cordova-plugin-barcodescanner` | `BarcodeDetector` по фото (Chrome) |
| `microphone` | `microphone.js` — `startRecording({onLevel})` → `{blob, url}`, `startLevelMeter` | — (getUserMedia + MediaRecorder; `RECORD_AUDIO` в config.xml) | то же (https/localhost) |
| `motion` | `motion.js` — `startTilt`, `startMotion`, `onShake` | — | `DeviceOrientation/MotionEvent` |
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

Сеть и батарея без плагинов — `network.js` (`watchConnection`, `getBatteryInfo`).
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

## Раздел «Примеры» (`/examples`)

Мини-приложение на каждую возможность — готовый образец, который можно скопировать в своё приложение
(`src/components/examples/`, реестр — `index.js`, общий каркас — `ExampleLayout.vue`):

| Пример | Что показывает |
|---|---|
| Компас | циферблат, поворачивающийся к северу, градусы и сторона света |
| GPS-трекер | координаты, точность, скорость, пройденный путь, рисунок трека, запись в фоне, «открыть на карте» |
| Сканер кодов | QR/штрихкоды, вибро-отклик, открыть ссылку/копировать, история в IndexedDB |
| Камера | фото с камеры и из галереи, своя галерея (Blob в IndexedDB), просмотр и удаление |
| Диктофон | запись с микрофона, живой уровень громкости, список записей с прослушиванием |
| Вибрация | паттерны (успех, ошибка, сердцебиение, SOS), «держи, чтобы вибрировать», свой паттерн |
| Уровень | пузырьковый уровень по наклону, ускорение, счётчик встряхиваний |
| Фоновый режим | таймер с журналом: видно, сколько секунд «потерялось» без фонового режима |
| Файлы | скачивание с прогрессом, открытие системой |
| Хранилище | заметки в IndexedDB — переживают перезапуск |
| Устройство и сеть | модель/ОС/сборка, онлайн/офлайн, тип сети, батарея |
| Аудиовыходы | список и переключение выходов + тестовый звук |
| Ссылки | браузер, звонок, SMS, почта, карты, браузер поверх приложения |

Страница показывает только примеры включённых в `FEATURES` возможностей.
Проверено на эмуляторе Android: запрос разрешений, запись/воспроизведение, сканер, камера, датчики, сеть.

## Bootstrap: почему урезанный

`src/styles/scss/bootstrap-trimmed.scss` подключает только нужные модули и группы утилит
(без адаптивных `d-md-…`), из JS — только offcanvas. Замер на заготовке:

| | CSS | CSS gzip | JS |
|---|---|---|---|
| урезанный | ~152 КБ | ~24 КБ | только offcanvas |
| полный | ~241 КБ | ~34 КБ | +60 КБ |

Выигрыш заметен в веб-версии/PWA на мобильном интернете; в APK файлы локальные, разница меньше.
Цена — класс из неподключённой группы молча не работает: модуль раскомментируйте в
`bootstrap-trimmed.scss`, утилиту добавьте в `$utilities-in-use`. Не хотите об этом думать —
в `App.vue` импортируйте `bootstrap-full.scss`, а в `main.js` — `import 'bootstrap'`.

## Безопасность

- **WebView не уходит на чужие сайты**: в `config.xml` нет `allow-navigation="*"` — переход на внешний
  адрес открывается в системном браузере, а не внутри приложения с доступом к плагинам.
  `allow-intent` — только http(s), tel, sms, mailto, geo, market.
- **CSP в Cordova-сборке** (`prepare-to-cordova.js`): скрипты только свои (`script-src 'self'`),
  без `unsafe-eval`, `object-src 'none'`, `base-uri 'self'`.
- **Внешние ссылки** (`openExternal`) — только безопасные схемы: `javascript:`, `file:`, `intent:`
  из QR-кода или ответа сервера не откроются.
- **Тексты с сервера** выводятся как текст (`{{ }}`), не через `v-html`.
- **Самообновление**: в production ссылка на APK обязана быть https и заполненной (не `CHANGE_ME`).
  Секретный код ссылки лежит в `src/envs/*.js` (не в git), но попадает в собранный бандл — это
  защита от случайных скачиваний, а не секрет.
- **Зависимости**: `npm audit --omit=dev` — 0 уязвимостей. Остаются уязвимости dev-сервера
  vue-cli 5 (webpack-dev-middleware 5), которые закрываются только переездом на Vite; поэтому
  dev-сервер слушает только `localhost` (с телефона: `VUE_DEV_HOST=0.0.0.0 npm run serve`).
  `overrides` в `package.json` подтягивают исправленные postcss, serialize-javascript, uuid.
- `AndroidInsecureFileModeEnabled` (работа с `file://`) — осознанный компромисс, см. комментарий в `config.xml`.

## Остальное в `src/`

- `libraries/Api.js` — все запросы к бэкенду: `API_ROOT_URL = SITE_ROOT_URL + 'api/v1.0/'`, ответы
  `{is_success, is_error, data}`, Bearer-токен (`Api.authToken`), обработчик 401, индикатор сети.
- `libraries/localDB.js` — IndexedDB (idb): таблицы, key-value, Blob.
- `helpers/errors.js` — `userErrorMessage(e)`: понятный текст ошибки без технических деталей.
- `components/UI/` — глобальные компоненты: `my-loader`, `info-block`, `popup-message`, `network-status`, `switcher-sizes`.
- `directives/` — `v-swipe-left`, `v-swipe-right`.
- `styles/scss/ui.scss` — общие блоки интерфейса в стиле zmi-music-player-app: `page-title`, `page-lead`
  (описание «цитатой»), `glass-card` (+`-header`, `-hint`), `menu-tiles`/`menu-tile` (плитки-меню с иконкой
  и описанием), `stats-grid`, `icon-button`. Свои вариации — миксинами из `styles/scss/mixins.scss`.
- `styles/scss/` — Bootstrap 5 (урезанный, см. раздел выше), шрифт PT Sans,
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
