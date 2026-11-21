// Отчёты об ошибках: необработанные исключения JS, отклонённые промисы и ошибки компонентов
// Vue собираются с версией, платформой, устройством и маршрутом. Хранятся на устройстве
// (последние MAX_LOCAL) и, если задан APP.ERROR_REPORTS.URI, отправляются на сервер через
// офлайн-очередь — так отчёт с телефона без сети тоже дойдёт, когда сеть появится.
//
// Подключение — initErrorReporter(app, router) в main.js. Вручную: reportError(e, {where: '…'}).
// Сервер получает POST {APP.ERROR_REPORTS.URI} c полями из buildReport() ниже.
import {APP} from '@/config/app';
import {FEATURES} from '@/config/features';
import {PLATFORM} from '@/config/platform';
import localDB from '@/libraries/localDB';
import {apiQueue} from '@/libraries/offlineQueue';
import {CURRENT_VERSION} from '@/native/appUpdates';

const LOCAL_KEY = 'error-reports';
const MAX_LOCAL = 50;
// Одна и та же ошибка в цикле (например, в обработчике скролла) не должна завалить
// сервер и очередь: одинаковые отчёты чаще раза в DEDUPE_MS не пишем
const DEDUPE_MS = 10000;
const recent = new Map();

let routerRef = null;
const listeners = new Set();

function buildReport(error, extra = {}) {
    const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
    return {
        message: String(err.message || err).slice(0, 1000),
        stack: String(err.stack || '').slice(0, 4000),
        route: routerRef?.currentRoute?.value?.fullPath || location.hash,
        appVersion: CURRENT_VERSION,
        platform: PLATFORM,
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        time: new Date().toISOString(),
        ...extra,
    };
}

export async function reportError(error, extra = {}) {
    if (!FEATURES.errorReports) return null;
    const report = buildReport(error, extra);
    const key = report.message + report.stack.slice(0, 200);
    if (recent.has(key) && Date.now() - recent.get(key) < DEDUPE_MS) return null;
    recent.set(key, Date.now());

    try {
        const list = (await localDB.getValue(LOCAL_KEY, [])) || [];
        list.unshift(report);
        await localDB.setValue(LOCAL_KEY, list.slice(0, MAX_LOCAL));
        listeners.forEach((fn) => fn(report));
        if (APP.ERROR_REPORTS.URI) {
            await apiQueue.add({method: 'post', uri: APP.ERROR_REPORTS.URI, data: report, meta: {type: 'error-report'}});
        }
    } catch (e) {
        // Отчёт об ошибке не должен сам ронять приложение
        console.warn('errorReporter: не удалось сохранить отчёт', e);
    }
    if (APP.ERROR_REPORTS.LOG_TO_CONSOLE) console.error('[errorReporter]', report.message, error);
    return report;
}

export function getLocalReports() {
    return localDB.getValue(LOCAL_KEY, []);
}

export function clearLocalReports() {
    return localDB.setValue(LOCAL_KEY, []);
}

export function onReport(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

export function initErrorReporter(app, router) {
    if (!FEATURES.errorReports) return;
    routerRef = router;
    window.addEventListener('error', (e) => {
        // Ошибки загрузки ресурсов (картинка не нашлась) — не исключения JS
        if (e.error || e.message) reportError(e.error || e.message, {where: 'window.onerror'});
    });
    window.addEventListener('unhandledrejection', (e) => reportError(e.reason, {where: 'unhandledrejection'}));
    // Ошибки в компонентах Vue: в production Vue их только логирует, наружу они не всплывают
    const prev = app.config.errorHandler;
    app.config.errorHandler = (err, instance, info) => {
        reportError(err, {where: `vue: ${info}`, component: instance?.$options?.name || ''});
        if (prev) prev(err, instance, info);
        else console.error(err);
    };
}
