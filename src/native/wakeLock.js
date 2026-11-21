// «Не гасить экран» — пока открыт сканер, карта, аудиогид, презентация.
//  - Cordova: cordova-plugin-insomnia (флаг FLAG_KEEP_SCREEN_ON у окна) — надёжно в WebView;
//  - веб: Screen Wake Lock API (Chrome, Safari 16.4+), только по https/localhost.
//    Браузер снимает блокировку, когда вкладка скрыта, — возвращаем её при возврате.
// Включение считается по «причинам» (как фоновый режим): экран снова может гаснуть,
// только когда все, кто просил, отпустили.
import {FEATURES} from '@/config/features';
import {getPlugin} from '@/native/cordova';

const reasons = new Set();
let webLock = null;

export function isWakeLockAvailable() {
    return FEATURES.wakeLock && (!!window.cordova || 'wakeLock' in navigator);
}

async function acquire() {
    const insomnia = await getPlugin('plugins.insomnia');
    if (insomnia) {
        insomnia.keepAwake();
        return true;
    }
    if (!('wakeLock' in navigator)) return false;
    try {
        webLock = await navigator.wakeLock.request('screen');
        webLock.addEventListener('release', () => { webLock = null; });
        return true;
    } catch (e) {
        return false; // нет жеста пользователя / не secure context / батарея садится
    }
}

async function release() {
    const insomnia = await getPlugin('plugins.insomnia');
    if (insomnia) insomnia.allowSleepAgain();
    if (webLock) {
        await webLock.release();
        webLock = null;
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && reasons.size && !webLock && !window.cordova) acquire();
});

/** Не гасить экран. Возвращает false, если не получилось (браузер не умеет / запретил). */
export async function keepScreenOn(reason = 'default') {
    if (!FEATURES.wakeLock) return false;
    reasons.add(reason);
    return acquire();
}

export async function allowScreenOff(reason = 'default') {
    reasons.delete(reason);
    if (!reasons.size) await release();
}

export function isScreenKeptOn() {
    return reasons.size > 0;
}
