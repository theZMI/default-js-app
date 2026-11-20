// Компас — направление, куда «смотрит» верх устройства, в градусах от севера (0..360).
// Плагины не нужны: DeviceOrientationEvent есть и в WebView, и в браузерах.
//  - Android/Chrome: событие deviceorientationabsolute (alpha относительно севера);
//  - iOS Safari: webkitCompassHeading, но сначала нужно разрешение по жесту пользователя
//    (DeviceOrientationEvent.requestPermission) — поэтому startCompass вызывайте из обработчика клика.
import {FEATURES} from '@/config/features';

export function isCompassAvailable() {
    return FEATURES.compass && typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
}

async function requestPermissionIfNeeded() {
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
        try {
            return (await DOE.requestPermission()) === 'granted';
        } catch (e) {
            // Вызов не из жеста пользователя — пробуем слушать как есть
            return true;
        }
    }
    return true;
}

/**
 * Начать слушать компас. onHeading(degrees) вызывается на каждое изменение.
 * Возвращает Promise<stop()>; если разрешение не выдано — бросает ошибку.
 */
export async function startCompass(onHeading) {
    if (!isCompassAvailable()) throw new Error('Компас недоступен на этом устройстве.');
    if (!(await requestPermissionIfNeeded())) throw new Error('Нет доступа к датчикам ориентации.');

    const handler = (e) => {
        let heading = null;
        if (typeof e.webkitCompassHeading === 'number' && e.webkitCompassHeading >= 0) {
            heading = e.webkitCompassHeading; // iOS
        } else if (e.absolute && typeof e.alpha === 'number') {
            heading = (360 - e.alpha) % 360; // Android
        }
        if (heading !== null) onHeading(heading);
    };
    window.addEventListener('deviceorientationabsolute', handler, true);
    window.addEventListener('deviceorientation', handler, true);

    return function stop() {
        window.removeEventListener('deviceorientationabsolute', handler, true);
        window.removeEventListener('deviceorientation', handler, true);
    };
}
