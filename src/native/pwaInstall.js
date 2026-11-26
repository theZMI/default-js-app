// Установка сайта как приложения (PWA) — кнопка «Установить приложение» в меню.
//  - Chrome, Edge, Яндекс Браузер, Samsung Internet присылают событие beforeinstallprompt: перехватываем его и
//    показываем системное окно установки по нажатию кнопки (значок в адресной строке мало кто замечает);
//  - Safari на iPhone/iPad такого события не знает: там только вручную «Поделиться» → «На экран „Домой“» —
//    показываем подсказку;
//  - уже установленное (открыто как отдельное приложение) и сборка под Cordova — ничего не показываем.
// Установка требует https (или localhost), манифест и иконки — public/manifest.webmanifest.
import {reactive} from 'vue';
import {FEATURES} from '@/config/features';

export const pwaInstall = reactive({
    canPrompt: false,   // есть отложенное системное окно установки
    iosHint: false,     // iPhone/iPad в браузере — показать, как добавить вручную
});

let deferredPrompt = null;

// iPadOS представляется как Mac — отличаем по сенсорному экрану
export function isIosDevice(userAgent, maxTouchPoints = 0) {
    return /iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1);
}

export function isStandalone(win = window) {
    return !!(win.matchMedia?.('(display-mode: standalone)').matches || win.navigator?.standalone);
}

export function initPwaInstall() {
    if (!FEATURES.pwa || typeof window === 'undefined' || window.cordova || isStandalone()) return;
    pwaInstall.iosHint = isIosDevice(navigator.userAgent, navigator.maxTouchPoints);
    window.addEventListener('beforeinstallprompt', (event) => {
        // Не показывать мини-панель браузера сразу — окно откроется по кнопке в меню
        event.preventDefault();
        deferredPrompt = event;
        pwaInstall.canPrompt = true;
    });
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        pwaInstall.canPrompt = false;
        pwaInstall.iosHint = false;
    });
}

/** Открыть системное окно установки. true — пользователь согласился. */
export async function promptInstall() {
    if (!deferredPrompt) return false;
    const event = deferredPrompt;
    deferredPrompt = null;
    pwaInstall.canPrompt = false;
    event.prompt();
    const choice = await event.userChoice.catch(() => null);
    return choice?.outcome === 'accepted';
}
