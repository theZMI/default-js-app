// Общие помощники для работы с Cordova.
//
// В Cordova-сборке cordova.js подключается в конце <body> (см. auto-build-app/prepare-to-cordova.js)
// обычным скриптом, а бандл приложения — с defer, поэтому window.cordova уже существует,
// когда стартует main.js. Плагины же становятся доступны только после 'deviceready'.
// В обычном браузере (dev-сервер, веб-версия) window.cordova нет и 'deviceready' не приходит.

export function isCordova() {
    return typeof window !== 'undefined' && !!window.cordova;
}

let readyPromise = null;

// Резолвится, когда плагины Cordova готовы (true), или сразу в браузере (false).
// 'deviceready' у Cordova «липкое»: если оно уже было, обработчик вызовется сразу.
export function deviceReady() {
    if (!readyPromise) {
        readyPromise = isCordova()
            ? new Promise((resolve) => document.addEventListener('deviceready', () => resolve(true), {once: true}))
            : Promise.resolve(false);
    }
    return readyPromise;
}

// Достаёт объект по пути от window: getGlobal('cordova.plugins.barcodeScanner').
// Возвращает null, если чего-то по дороге нет (плагин не установлен / не браузер Cordova).
export function getGlobal(path) {
    let obj = typeof window !== 'undefined' ? window : null;
    for (const key of path.split('.')) {
        if (obj == null) return null;
        obj = obj[key];
    }
    return obj ?? null;
}

// Дождаться deviceready и вернуть плагин (или null)
export async function getPlugin(path) {
    await deviceReady();
    return getGlobal(path);
}

// Обёртка над callback-API плагинов (success, error) → Promise
export function promisify(fn) {
    return new Promise((resolve, reject) => fn(resolve, reject));
}
