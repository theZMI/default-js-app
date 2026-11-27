# Журнал default-js-app

## Статус

Заготовка используется для приложений: bottle-app, magic-ball-app, movie-advisor-app, gift-app, match3-app («Самоцветы»),
zuma-app («Квакша»). 27.11 догнала их по оболочке (настройки, меню, 11 языков, автоверсия, `make deploy`) — не закоммичено.
Незакоммичено в шаблоне: правки другой сессии и сплэш (`scripts/generate-icons.py`, `public/img/cordova-screen/android/logo.png`).

## Хронология

### 2026-11-27 — заготовка догнала приложения
- По итогам сравнения с magic-ball, bottle, movie-advisor, gift, match3, zuma, «Шаг за шагом» (из чата step-by-step-app)
  перенесено то, что во всех приложениях уже одинаковое:
  - `scripts/bump-version.mjs` и его вызов в `build-android`, `build-android-release`, `build-ios`; цель `make deploy`
    (переменная `DEPLOY_KEY` — имя приложения в `../hosting/deploy_static_apps.py`).
  - Имя кэша service worker — `<name>-<version>` из `package.json`, подставляется при сборке (плагин `swCacheName`
    в `vite.config.mjs`, метка `__APP_CACHE_NAME__`); `CACHE_VERSION` руками больше не поднимается.
  - «Настройки» единого вида, блоки — `APP.SETTINGS` (`APPEARANCE`, `SOUND`, `HAPTICS`, `LANGUAGE`, `PROGRESS_KEYS`);
    `settings.sound`, `resetProgress()` / `onProgressReset()`; без «Оформления» тема и размер текста фиксированы.
  - Меню: `APP.MENU_STYLE` — `'bottom'` (как было) или `'burger'` (кнопка «☰», без нижнего меню); отступы под меню —
    CSS-переменные. Пункт «Установить приложение» (PWA) — `native/pwaInstall.js` из movie-advisor/gift.
  - «О приложении» и главная — имя/описание из словарей (`app.name`, `app.description`); заголовок вкладки — по языку.
  - Словари оболочки на 11 языках (ru, en, de, fr, es, it, pt, nl, pl, tr, uk), `tests/i18n.test.js`.
- Проверки: `npm run lint`, `npm test` (56), `npm run build`; headless Chrome 390×844 — оба вида меню, все блоки настроек,
  сброс прогресса с подтверждением, смена языка, «О приложении». Не закоммичено.
- Дальше (обсуждали): режим веб-обновления `auto` / `manual` (как в zmi-music-player), защита от «битых» чанков
  (`chunkErrorGuard` из плеера); игровой слой (шапка, «желейные» кнопки, праздничный экран, звуки) — отдельно.

### 2026-11-25
- Из этого чата сделана игра zuma-app/zuma-app-cordova («Квакша», стрелялка шариками на canvas) — журнал в её `DIALOG.md`.

### 2026-11-26 — «О приложении»: только версия; закоммичены отложенные правки
- Убрана строка «Сборка» (время сборки и платформа) и ключ `about.build` в ru/en — как во всех приложениях из заготовки, где версия поднимается сама (`scripts/bump-version.mjs`). Время сборки осталось в отчётах об ошибках (`src/native/device.js`).
- Отдельным коммитом закоммичены лежавшие незакоммиченными правки других сессий: масштаб узких экранов через CSS `zoom` вместо viewport-extra (`helpers/viewportMinWidth.js`, `App.vue`, `tests/viewport.test.js`) и сплэш Android 12+ (`scripts/generate-icons.py`, `logo.png`).

### 2026-11-27
- Главная: блок «С чего начать» перенесён наверх (под описание) и сделан простым текстом без рамки; под ним — три плитки-ссылки.
- Меню: «Установить приложение» перенесён в «Дополнительно», значок — цвета текста; то же перенесено в 8 приложений. В заготовке включены тема и размер текста (APP.SETTINGS.APPEARANCE: true); страница «О заготовке» и README сверены с кодом (меню-бургер, 11 языков, PWA, deploy, icons, отчёты об ошибках, «Назад»).
- Настройки: кнопки «Тема» и «Размер текста» одной высоты (min-height 80px, значок и «Аа» в блоке 24px — подписи на одной линии).
