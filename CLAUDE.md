# default-js-app — заготовка js-приложения (Vue 3 + Cordova)

Шаблон, из которого делаются приложения автора (`*-app` + `*-app-cordova` в `/Users/zmi/Sites`).
Подробности для человека — в `README.md`; здесь — что важно знать при правках.

- Пара папок: эта (Vue 3 SPA, свои плагины `native-plugins/`, скрипты `auto-build-app/`) и
  `../default-js-app-cordova` (только `config.xml`, `hooks/`, `res/`, список плагинов в `package.json`).
  Правки, затрагивающие нативную часть (плагины, разрешения), делать согласованно в обеих.
- Язык кода, комментариев и интерфейса — русский. Комментарии объясняют «зачем», особенно хаки
  WebView/iOS/Cordova — их не удалять без понимания. Git: `github.com/theZMI/default-js-app`, ветка `main`.
- Стек: Vue 3, vue-router 4 (hash-история — работает под `file://`), vuex 4 (только индикатор сети),
  vue-cli 5, Bootstrap 5 (урезанный: `styles/scss/bootstrap-trimmed.scss` — новый класс утилиты может не работать, пока не добавлена его группа), bootstrap-icons, SCSS, axios, idb.

## Правила

- Возможности устройства включаются ТОЛЬКО через `src/config/features.js` (`FEATURES`); код —
  в `src/native/*`, каждый модуль сам проверяет флаг и наличие плагина и имеет веб-фолбэк или
  понятную ошибку. Новая возможность = флаг + модуль + пример в `src/components/examples/` (и строка в его `index.js`) + строки в README.
- Платформа сборки — `src/config/platform.js` (`VUE_APP_PLATFORM` из Makefile → `EnvConfig.PLATFORM`).
- `src/envs/local.js`, `prod.js` не в git, создаются из `*.example.js` (`vue.config.js`).
- Пункты меню — `src/router/menu.js`, маршруты — `src/router/routes.js`.
- Тексты ошибок пользователю — через `helpers/errors.js` (`userErrorMessage`).
- Иконки `bi-…` писать целиком (в прод-сборку попадают только найденные в `src/`).
- Версия приложения — `version` в `package.json` (имя APK, самообновление).

## Проверка

- `npx vue-cli-service build` — должна проходить без предупреждений (кроме размеров ассетов).
- Браузер: `.claude/launch.json` (dev-сервер на 8095), раздел `#/examples` — по странице на каждую возможность.
- APK: `make build-android` (несколько минут; на свежем клоне сам делает `cordova prepare`).
  После него `dist/index.html` содержит Cordova CSP — для веб-проверок пересобрать.
- Нативное поведение (камера, сканер, фон, установка APK) проверяется только на устройстве/эмуляторе.
