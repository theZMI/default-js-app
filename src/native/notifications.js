// Локальные уведомления (напоминания по времени) — без сервера.
//  - Cordova: cordova-plugin-local-notification — уведомление придёт, даже если приложение
//    закрыто и телефон перезагружали; можно повторять (каждый день и т.п.).
//  - Веб: Notification API — работает, только пока вкладка открыта (таймер в странице);
//    для уведомлений в закрытом браузере нужен push (src/native/push.js).
// Android 13+ спрашивает разрешение на уведомления — requestPermission() показывает диалог.
import {FEATURES} from '@/config/features';
import {getPlugin, promisify} from '@/native/cordova';

const webTimers = new Map();

async function nativePlugin() {
    return getPlugin('cordova.plugins.notification.local');
}

export function isNotificationsAvailable() {
    return FEATURES.notifications && (!!window.cordova || 'Notification' in window);
}

/** true — можно показывать уведомления */
export async function requestPermission() {
    const plugin = await nativePlugin();
    if (plugin) {
        const has = await new Promise((r) => plugin.hasPermission(r));
        return has || new Promise((r) => plugin.requestPermission(r));
    }
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    return (await Notification.requestPermission()) === 'granted';
}

/**
 * Запланировать уведомление.
 * @param {{id?: number, title: string, text?: string, at?: Date, inSeconds?: number,
 *          every?: 'minute'|'hour'|'day'|'week', data?: object}} options
 * @returns {Promise<number>} id уведомления (для cancel)
 */
export async function schedule({id = Math.floor(Math.random() * 1e9), title, text = '', at, inSeconds, every, data} = {}) {
    if (!FEATURES.notifications) throw new Error('Уведомления отключены в настройках приложения.');
    if (!(await requestPermission())) throw new Error('Нет разрешения на уведомления — включите их в настройках телефона.');
    const when = at || new Date(Date.now() + (inSeconds || 0) * 1000);

    const plugin = await nativePlugin();
    if (plugin) {
        const trigger = every ? {every, firstAt: when} : {at: when};
        // Ждём подтверждения плагина — иначе getScheduled() сразу после schedule() его ещё не видит
        await new Promise((resolve) => plugin.schedule({id, title, text, trigger, data, foreground: true}, resolve));
        return id;
    }
    // Веб: таймер внутри страницы (уйдёт с закрытием вкладки)
    const delay = Math.max(0, when.getTime() - Date.now());
    webTimers.set(id, setTimeout(() => {
        webTimers.delete(id);
        new Notification(title, {body: text, data, icon: 'img/icons/android-chrome-192x192.png'});
    }, delay));
    return id;
}

export async function cancel(id) {
    const plugin = await nativePlugin();
    if (plugin) return promisify((ok) => plugin.cancel(id, ok));
    clearTimeout(webTimers.get(id));
    webTimers.delete(id);
}

export async function cancelAll() {
    const plugin = await nativePlugin();
    if (plugin) return promisify((ok) => plugin.cancelAll(ok));
    webTimers.forEach((t) => clearTimeout(t));
    webTimers.clear();
}

/** Запланированные уведомления (только в приложении; в вебе — те, что ждут в этой вкладке) */
export async function getScheduled() {
    const plugin = await nativePlugin();
    if (plugin) return promisify((ok) => plugin.getScheduled(ok));
    return [...webTimers.keys()].map((id) => ({id}));
}

/** Нажатие на уведомление: handler(notification) — например, открыть нужную страницу */
export async function onClick(handler) {
    const plugin = await nativePlugin();
    if (plugin) plugin.on('click', handler);
}
