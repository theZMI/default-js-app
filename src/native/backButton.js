// Аппаратная/жестовая кнопка «Назад» на Android. По умолчанию Cordova закрывает
// приложение на первом же нажатии — даже если открыто меню или есть куда вернуться.
// Здесь: закрыть открытое меню/окно → вернуться по истории роутера → свернуть приложение.
//
// Свои обработчики (например, закрыть полноэкранную галерею) регистрируйте через
// onBackButton(handler): handler возвращает true, если «съел» нажатие. Последний
// зарегистрированный вызывается первым.
import {FEATURES} from '@/config/features';
import {deviceReady} from '@/native/cordova';

const handlers = [];

export function onBackButton(handler) {
    handlers.push(handler);
    return () => {
        const i = handlers.indexOf(handler);
        if (i !== -1) handlers.splice(i, 1);
    };
}

function closeOpenOffcanvas() {
    const open = document.querySelector('.offcanvas.show [data-bs-dismiss="offcanvas"]');
    if (open) {
        open.click();
        return true;
    }
    return false;
}

export function initBackButton(router) {
    if (!FEATURES.backButton) return;
    deviceReady().then((ready) => {
        if (!ready) return;
        document.addEventListener('backbutton', (e) => {
            e.preventDefault();
            for (let i = handlers.length - 1; i >= 0; i--) {
                if (handlers[i]()) return;
            }
            if (closeOpenOffcanvas()) return;
            // vue-router 4 кладёт в history.state ссылку на предыдущую запись
            if (window.history.state && window.history.state.back) {
                router.back();
                return;
            }
            // Главный экран: свернуть, а не убивать приложение (как делают нативные приложения).
            // navigator.app.exitApp() полностью закрыл бы его — тогда холодный старт заново.
            if (window.cordova?.plugins?.backgroundMode?.moveToBackground) {
                window.cordova.plugins.backgroundMode.moveToBackground();
            } else if (navigator.app && navigator.app.exitApp) {
                navigator.app.exitApp();
            }
        }, false);
    });
}
