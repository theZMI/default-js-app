// Состояние сети и батареи — без плагинов.
//  - online/offline: navigator.onLine + события (в Cordova работают так же);
//  - тип соединения: navigator.connection (Chrome/Android WebView; в Safari нет);
//  - батарея: navigator.getBattery() (Chrome/Android WebView; в Safari/Firefox нет).
export function getConnectionInfo() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
        online: navigator.onLine,
        effectiveType: c?.effectiveType || null, // slow-2g | 2g | 3g | 4g
        downlinkMbps: c?.downlink ?? null,
        rttMs: c?.rtt ?? null,
        saveData: c?.saveData ?? null,
    };
}

/** onChange(info) при изменении сети. Возвращает stop(). */
export function watchConnection(onChange) {
    const handler = () => onChange(getConnectionInfo());
    const c = navigator.connection;
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
    c?.addEventListener?.('change', handler);
    handler();
    return () => {
        window.removeEventListener('online', handler);
        window.removeEventListener('offline', handler);
        c?.removeEventListener?.('change', handler);
    };
}

/** {level 0..1, charging} или null, если браузер не умеет */
export async function getBatteryInfo() {
    if (typeof navigator.getBattery !== 'function') return null;
    try {
        const b = await navigator.getBattery();
        return {level: b.level, charging: b.charging};
    } catch (e) {
        return null;
    }
}
