# Default JS App — заготовка js-приложения (Vue 3 + Vite + Cordova)

Один код → сайт/PWA, Android-приложение (APK для раздачи, AAB для Google Play) и iOS-приложение.
Заготовка собрана из лучшего, что накопилось в `zmi-music-player-app`, `kkosa-attractions-app`,
`kkosa-performance-app`, `kkosa2-app`, `vpark-app`, и **содержит все возможности устройства сразу** —
лишнее выключается одним флагом в конфиге. Дизайн — как у zmi-music-player-app (тёмная «стеклянная»
тема, плавающее нижнее меню), есть светлая тема.

Проект — это две соседние папки:

| Папка | Что |
|---|---|
| `my-app/` (эта заготовка) | само приложение: Vue 3 SPA, свои Cordova-плагины, скрипты сборки |
| `my-app-cordova/` (`default-js-app-cordova`) | Cordova-оболочка: `config.xml`, иконки, хуки, ключ подписи, список плагинов. Кода приложения там нет |

Имя cordova-папки = имя папки приложения + `-cordova` — скрипты сборки находят её сами.

## Быстрый старт

```bash
make install   # npm install здесь и в ../<имя>-cordova
make start     # dev-сервер: http://localhost:8080
```

При первом запуске из `src/envs/*.example.js` создаются `src/envs/local.js` и `prod.js`
(в git их нет) — пропишите там адрес своего бэкенда.

В приложении: раздел **«Примеры»** — мини-приложение на каждую возможность, **«О заготовке»** —
жесты, что где настраивается, как собрать.

## Что умеет оболочка

**Жесты и управление**

| Жест | Что делает | Настройка |
|---|---|---|
| Потянуть страницу вниз | перезагрузить приложение (pull-to-refresh) | `APP.PULL_TO_REFRESH`, `PULL_TO_REFRESH_DISABLED_PAGES` |
| Провести слева направо | открыть боковое меню (жест начинается в левых 40% экрана) | `APP.GESTURES` |
| Провести справа налево по меню | закрыть меню | — |
| Кнопка «Всё меню» | боковое меню со всеми разделами | `src/router/menu.js` |
| «Назад» на Android | закрыть меню → назад по страницам → свернуть (а не закрыть) приложение | `FEATURES.backButton` |
| Двойной тап / щипок | ничего: интерфейс не масштабируется, как у нативного приложения | `index.html` |

Элементы с атрибутом `data-no-swipe` (карта, ползунки) жест меню не запускают.

**Остальное:** страница «Настройки» единого вида (блоки включаются в `APP.SETTINGS`: тема и размер
текста, звук, вибро-отклик, язык — 11 языков, сброс настроек и прогресса); меню — нижнее или кнопка «☰»
(`APP.MENU_STYLE`); PWA с офлайн-кешем и пунктом «Установить приложение» в меню; индикатор сети;
офлайн-очередь запросов; отчёты об ошибках; самообновление APK; номер версии поднимается сам
при каждой сборке и выкладке; понятные тексты ошибок; безопасный WebView (см. «Безопасность»).

## Новое приложение из заготовки

1. Скопировать обе папки: `default-js-app` → `my-app`, `default-js-app-cordova` → `my-app-cordova`.
2. Здесь: `name`/`version` в `package.json` (из них же — имя кэша service worker), `NAME` в
   `src/config/app.js`, `app.name`/`app.description` во всех словарях `src/i18n/*.js`, название в
   `index.html` и `public/manifest.webmanifest`, `DEPLOY_KEY` в `Makefile` (для `make deploy`).
   Вид меню (`APP.MENU_STYLE`) и блоки настроек (`APP.SETTINGS`) — в `src/config/app.js`.
3. В cordova-проекте: `id`, `name`, `description` в `config.xml`, `name` в `package.json`, путь
   `file:../my-app/native-plugins/...` у своих плагинов в `package.json`.
4. Иконка: картинку 1024×1024 — в `resources/icon.png`, затем `make icons`.
5. Выключить ненужные возможности в `src/config/features.js` (и удалить их плагины, см. таблицу ниже).
6. Демо-режим входа выключить (`APP.AUTH.DEMO = false`), раздел «Примеры» — `examples: false`.
7. Ключ подписи для Google Play — `make keystore` (см. «Release-сборка»).

## Сборка

Все команды — в папке приложения. Cordova-проект собирается отсюда же, руками в него ходить не нужно.

| Команда | Что делает |
|---|---|
| `make install` | зависимости приложения и cordova-проекта (один раз) |
| `make start` | dev-сервер с горячей перезагрузкой, http://localhost:8080 |
| `make build-web` | сайт/PWA → `dist/` (выкладывается на любой статический хостинг) |
| `make deploy` | новая версия, сборка и заливка на хостинг (`../hosting/deploy_static_apps.py`, ключ — `DEPLOY_KEY`) |
| `make build-android` | тестовый (debug) APK → `dist-apps/<version>.apk` |
| `make install-android` | поставить этот APK на подключённый телефон/эмулятор (`adb`) |
| `make keystore` | ключ подписи release-сборок (один раз на приложение) |
| `make build-android-release` | подписанные AAB (Google Play) и APK → `dist-apps/<version>-release.{aab,apk}` |
| `make build-ios` / `make prepare-ios` | iOS-сборка (нужен Xcode) / только подготовить Xcode-проект |
| `make icons` | все иконки из `resources/icon.png` |
| `make lint` / `make test` | ESLint и автотесты (vitest) |

### Тестовый APK (`make build-android`)

1. `npm run build` с `VUE_APP_PLATFORM=android` → `dist/`.
2. `prepare-to-cordova.js`: строгий CSP, подключение `cordova.js`, относительные пути, без `crossorigin`.
3. `copy-to-cordova-project.js`: версия из `package.json` → `config.xml` (из неё считается versionCode),
   `dist/` → `../<имя>-cordova/www/`.
4. `cordova build android` (на свежем клоне сначала сам делает `cordova prepare` — ставит платформу и плагины).
5. APK → `dist-apps/<version>.apk`.

Debug-APK подписан общим отладочным ключом — годится для тестов и самообновления «своих», не для магазина.
После сборки `dist/index.html` содержит Cordova-CSP — для проверки веб-версии пересоберите `make build-web`.

### Release-сборка для Google Play (`make build-android-release`)

Один раз на приложение:
1. `make keystore` — создаст `../<имя>-cordova/signing/release.keystore`, спросит пароли и данные владельца.
2. Скопируйте `signing/release.example.json` → `signing/release.json` и впишите пароли
   (путь к ключу в нём — относительно папки `signing/`).
3. **Сохраните ключ и пароли в надёжном месте** (менеджер паролей + резервная копия). Потеряете ключ —
   не сможете выпускать обновления. Папка `signing/` в `.gitignore`, в git она не попадёт.
   Рекомендуется включить Play App Signing — тогда Google хранит итоговый ключ, а ваш — только ключ загрузки.

Каждый выпуск:
1. Версию поднимать не нужно: `make build-android-release` (как и `build-android`, `build-ios`, `deploy`)
   сам увеличивает последнюю цифру в `package.json` (`scripts/bump-version.mjs`); Google Play примет только
   бо́льшую версию (1.2.3 → versionCode 10203). После сборки закоммитьте `package.json`.
2. `make build-android-release` → `dist-apps/<version>-release.aab` загружается в Play Console,
   `dist-apps/<version>-release.apk` — для самообновления и установки вручную.

### iOS

Нужны Mac с Xcode и Apple Developer аккаунт (для устройства/App Store). Платформа в cordova-проект
не добавлена: `cd ../<имя>-cordova && cordova platform add ios`, затем `make build-ios` или
`make prepare-ios` и сборка из `platforms/ios/*.xcworkspace` в Xcode. Тексты запросов разрешений
(камера, микрофон, геолокация, движение) уже есть в `config.xml`.

### Если сборка упала

- `Manifest merger failed … duplicated with element` — два плагина объявили одно разрешение с разными
  атрибутами. Уберите атрибут (`maxSdkVersion`) в своём объявлении — см. комментарии в `config.xml`.
- `cannot find symbol` в Java плагина — плагин отстал от Android SDK. Пример починки хуком —
  `hooks/fix-phonegap-nfc.js` в cordova-проекте.
- `No platforms added to this project` — в `package.json` cordova-проекта пропала платформа
  (так бывает после `cordova platform rm`). Верните `"platforms": ["android"]` и `cordova-android` в devDependencies.
- Правки `config.xml` (разрешения) не применились — `cordova platform rm android && cordova platform add android`
  (после этого проверьте пункт выше).

### Окружение

Android Studio (удобно ставить SDK и эмуляторы), Android SDK, JDK 17, Gradle, Cordova CLI
(`npm i -g cordova`), Node.js 20+. Например, в `~/.bash_profile`:
```shell
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
export PATH="/opt/homebrew/opt/gradle@8/bin:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
export ANDROID_AVD_HOME=~/.android/avd
```

## Конфигурация

| Файл | Что в нём |
|---|---|
| `src/config/features.js` | **какие возможности устройства включены** (по платформам) |
| `src/config/app.js` | имя, жесты, pull-to-refresh, обновления, вход (`AUTH`), карта (`MAP`), отчёты об ошибках, вид меню (`MENU_STYLE`), блоки и значения настроек (`SETTINGS`, `DEFAULT_SETTINGS`) |
| `src/config/platform.js` | платформа сборки: `PLATFORM`, `isWeb/isAndroid/isIos` |
| `src/envs/local.js`, `prod.js` | адрес бэкенда, ссылка на APK (с секретным кодом), DEBUG. Не в git |
| `src/router/menu.js` | пункты бокового и нижнего меню (подписи — ключи перевода) |
| `src/router/routes.js` | маршруты (hash-история — работает и под `file://`) |
| `src/i18n/*.js` | переводы оболочки на 11 языков (`$t('menu.home')`, ключи — как в `ru.js`, проверяет `tests/i18n.test.js`); раздел «Примеры» — только на русском |
| `src/styles/scss/theme.scss` | цвета тёмной и светлой темы (CSS-переменные) |
| `vite.config.mjs` | сборка: относительные пути, версия/время сборки, отбор иконок, имя кэша SW из `package.json` |

Окружение: dev-сервер → `local`, любая сборка → `prod`; `VUE_APP_ENV=local make build-android` —
APK, который ходит на локальный бэкенд (в `local.js` тогда нужен IP компьютера, а не localhost).

## Возможности устройства (`src/native/`, `src/libraries/`)

Каждый модуль сам проверяет свой флаг в `FEATURES` и наличие плагина; без плагина (браузер)
использует веб-фолбэк или бросает понятную ошибку на русском. **Все перечисленные плагины уже
установлены в cordova-проекте**, кроме push (ему нужен ваш Firebase-проект).

| Флаг `FEATURES` | Модуль | Cordova-плагин | Где работает |
|---|---|---|---|
| `geolocation` | `geolocation.js` — `getCurrentPosition`, `watchPosition` (+фон), `distanceMeters` | `cordova-plugin-geolocation`, `-android-permissions` | везде (браузер — https) |
| `map` | пример «Карта» (Leaflet, кеш тайлов в IndexedDB), `APP.MAP` | — | везде |
| `compass` | `compass.js` — `startCompass` | — | телефон |
| `motion` | `motion.js` — `startTilt`, `startMotion`, `onShake` | — | телефон |
| `camera` | `camera.js` — `takePhoto`, `selectPhoto` → `{dataUrl, blob}` | `cordova-plugin-camera` | везде |
| `torch` | `torch.js` — `toggleTorch` (вспышка через камеру) | — | Android |
| `scanner` | `scanner.js` — `scan({formats})` | `@red-mobile/cordova-plugin-barcodescanner` | приложение; браузер — Chrome |
| `nfc` | `nfc.js` — `startNfcScan`, `nfcStatus` | `phonegap-nfc` + хук `fix-phonegap-nfc.js` | Android-телефон с NFC |
| `microphone` | `microphone.js` — `startRecording({onLevel})`, `startLevelMeter` | — (`RECORD_AUDIO` в config.xml) | везде (браузер — https) |
| `mediaSession` | `mediaSession.js` — кнопки в шторке/на экране блокировки | `cordova-plugin-music-controls2` | телефон |
| `notifications` | `notifications.js` — `schedule`, `cancel`, `getScheduled` | `cordova-plugin-local-notification` | приложение; браузер — пока вкладка открыта |
| `push` | `push.js` — `getToken`, `onMessage` (Firebase) | `cordova-plugin-firebasex` — **ставится вручную** | приложение + ваш сервер |
| `vibration` | `vibration.js` — `vibrate` | — | Android |
| `wakeLock` | `wakeLock.js` — `keepScreenOn`, `allowScreenOff` | `cordova-plugin-insomnia` | везде (браузер — https) |
| `backgroundMode` | `backgroundMode.js` — `enableBackgroundMode(reason)` | `cordova-plugin-background-mode` + хук `fix-background-service-type.js` | Android-приложение |
| `share` | `share.js` — `share({title, text, url, files})` | `cordova-plugin-x-socialsharing` | везде (иначе — буфер обмена) |
| `files` | `files.js` — `downloadFile`, `openFile` | `cordova-plugin-file`, `-file-transfer`, `-file-opener2` | везде |
| `appUpdates` | `appUpdates.js` + страница `CheckUpdatesPage` | те же + `cordova-plugin-inappbrowser` | Android-приложение |
| `externalLinks` | `browser.js` — `openExternal`, `openInApp` | `cordova-plugin-inappbrowser` | везде |
| `deviceInfo` | `device.js` — `getDeviceInfo`; `network.js` — сеть, батарея | `cordova-plugin-device` | везде |
| `audioOutput` | `audioOutput.js` — `useAudioOutput()` | свой `native-plugins/cordova-plugin-audio-output` | Android-приложение |
| `biometric` | `biometric.js` — `verifyBiometric` | `cordova-plugin-fingerprint-aio` | приложение |
| `auth` | `libraries/auth.js` — вход по коду из письма, токен, 401 | — | везде + ваш сервер (или демо) |
| `offlineQueue` | `libraries/offlineQueue.js` — `apiQueue.add(...)` | — | везде |
| `errorReports` | `libraries/errorReporter.js` — `reportError`, перехват ошибок | — | везде (+сервер, `APP.ERROR_REPORTS.URI`) |
| `openLinks` | `openLinks.js` — App Links / своя схема → маршрут | свой `native-plugins/cordova-plugin-open-link` (не установлен) | приложение |
| `backButton` | `backButton.js` | — | Android |
| `pwa` | service worker + manifest | — | браузер |

Общие помощники: `cordova.js` (`deviceReady()`, `getPlugin()`), `permissions.js` (runtime-разрешения Android).

**Удалить возможность совсем:** флаг → `false`; модуль и пример; плагин —
`cd ../<имя>-cordova && cordova plugin rm <плагин> --save`.

### Push-уведомления

1. console.firebase.google.com → проект → Android-приложение с `id` из `config.xml`.
2. `google-services.json` → в корень cordova-проекта, в `config.xml` (секция android):
   `<resource-file src="google-services.json" target="app/google-services.json" />`.
3. `cd ../<имя>-cordova && cordova plugin add cordova-plugin-firebasex --save`.
4. `FEATURES.push = true`, собрать APK. Токен (`getToken()` из `src/native/push.js`) отправить на свой сервер.
5. Сервер шлёт сообщения через Firebase Admin SDK (HTTP v1 API). Ключ сервисного аккаунта — только на сервере.
6. iOS: Apple Developer аккаунт, APNs-ключ в Firebase, capability Push Notifications в Xcode.

### Свои плагины (`native-plugins/`)

Ставятся в cordova-проект из этой папки (`file:../<имя>/native-plugins/...` в его `package.json`).
После правки Java-кода: `cordova plugin rm <имя> && cordova plugin add ../<имя>/native-plugins/<плагин>`.

`cordova-plugin-open-link` нужны параметры приложения:
```bash
cordova plugin add ../my-app/native-plugins/cordova-plugin-open-link --save \
    --variable LINK_HOST=site.ru --variable LINK_PATH_PREFIX=/ --variable URL_SCHEME=myapp
```
и `FEATURES.openLinks = true`. Для https-ссылок Android 12+ сайт должен отдавать
`/.well-known/assetlinks.json` с SHA256 ключа подписи APK.

## Раздел «Примеры» (`/examples`)

Мини-приложение на каждую возможность (`src/components/examples/`, реестр — `index.js`, каркас —
`ExampleLayout.vue`). У каждого примера:
- **пометки**: «Только на телефоне», «Только Android», «Только в приложении», «Нужен сервер»,
  «В браузере — по https», «Нужна настройка»;
- **«Как подключить в своём приложении»** — плагин, разрешения, флаги, функции модуля.

Примеры: компас, GPS-трекер, карта, сканер кодов, NFC, камера, фонарик, диктофон, плеер в шторке,
уведомления, push-уведомления (инструкция), вибрация, уровень, «не гасить экран», фоновый режим,
«поделиться», офлайн-очередь, файлы, хранилище, вход в аккаунт (с отпечатком), отчёты об ошибках,
устройство и сеть, аудиовыходы, ссылки, обновление приложения.

Показываются только примеры включённых в `FEATURES` возможностей.

## Проверка кода

- `make lint` — ESLint (правила — `eslint.config.mjs`).
- `make test` — автотесты vitest (`tests/`): офлайн-очередь, разбор ссылок, безопасные ссылки, ошибки, геометрия.
- Нативное поведение (камера, сканер, NFC, фон, уведомления) проверяется только на устройстве/эмуляторе.

## Bootstrap: почему урезанный

`src/styles/scss/bootstrap-trimmed.scss` подключает только нужные модули и группы утилит
(без адаптивных `d-md-…`), из JS — только offcanvas. Полный Bootstrap — около +90 КБ CSS и +60 КБ JS.
Цена — класс из неподключённой группы молча не работает: модуль раскомментируйте в
`bootstrap-trimmed.scss`, утилиту добавьте в `$utilities-in-use`. Не хотите об этом думать —
в `App.vue` импортируйте `bootstrap-full.scss`, а в `main.js` — `import 'bootstrap'`.

## Безопасность

- **WebView не уходит на чужие сайты**: в `config.xml` нет `allow-navigation="*"` — внешний адрес
  открывается в системном браузере. `allow-intent` — только http(s), tel, sms, mailto, geo, market.
- **CSP в Cordova-сборке** (`prepare-to-cordova.js`): скрипты только свои, без `unsafe-eval`,
  `object-src 'none'`, `base-uri 'self'`.
- **Внешние ссылки** (`openExternal`) — только безопасные схемы.
- **Тексты с сервера** выводятся как текст, не через `v-html`.
- **Самообновление**: ссылка на APK в production обязана быть https и заполненной.
- **Ключ подписи** — только в `signing/` cordova-проекта (в `.gitignore`).
- **Зависимости**: `npm audit` — 0 уязвимостей (после переезда с vue-cli на Vite).
  Dev-сервер слушает только `localhost` (с телефона: `VUE_DEV_HOST=0.0.0.0 npm run dev`).
- `AndroidInsecureFileModeEnabled` (работа с `file://`) — осознанный компромисс, см. `config.xml`.

## Остальное в `src/`

- `libraries/Api.js` — запросы к бэкенду: `API_ROOT_URL = SITE_ROOT_URL + 'api/v1.0/'`, ответы
  `{is_success, is_error, data}`, Bearer-токен (`Api.authToken`), обработчик 401, индикатор сети.
- `libraries/localDB.js` — IndexedDB (idb): таблицы, key-value, Blob.
- `libraries/settings.js` — настройки пользователя (тема, размер текста, звук, вибро-отклик, язык), сброс
  прогресса (`resetProgress`, `onProgressReset`).
- `helpers/errors.js` — `userErrorMessage(e)`: понятный текст ошибки без технических деталей.
- `components/UI/` — глобальные компоненты: `my-loader`, `info-block`, `popup-message`, `network-status`, `switcher-sizes`.
- `styles/scss/ui.scss` — общие блоки в стиле zmi-music-player-app: `page-title`, `page-lead`,
  `glass-card`, `menu-tiles`/`menu-tile`, `stats-grid`, `icon-button`; миксины — `mixins.scss`.
- Из bootstrap-icons в сборку попадают только встречающиеся в `src/` иконки — **имена `bi-…` писать целиком**.
