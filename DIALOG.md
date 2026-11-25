# Журнал default-js-app

## Статус

Заготовка используется для игр: bottle-app, magic-ball-app, match3-app («Самоцветы»), zuma-app («Квакша»).
Незакоммичено в шаблоне: правки другой сессии и сплэш (`scripts/generate-icons.py`, `public/img/cordova-screen/android/logo.png`).

## Хронология

### 2026-11-25
- Из этого чата сделана игра zuma-app/zuma-app-cordova («Квакша», стрелялка шариками на canvas) — журнал в её `DIALOG.md`.

### 2026-11-26 — «О приложении»: только версия; закоммичены отложенные правки
- Убрана строка «Сборка» (время сборки и платформа) и ключ `about.build` в ru/en — как во всех приложениях из заготовки, где версия поднимается сама (`scripts/bump-version.mjs`). Время сборки осталось в отчётах об ошибках (`src/native/device.js`).
- Отдельным коммитом закоммичены лежавшие незакоммиченными правки других сессий: масштаб узких экранов через CSS `zoom` вместо viewport-extra (`helpers/viewportMinWidth.js`, `App.vue`, `tests/viewport.test.js`) и сплэш Android 12+ (`scripts/generate-icons.py`, `logo.png`).
