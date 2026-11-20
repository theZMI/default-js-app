// Датчики движения без плагинов:
//  - наклон устройства (DeviceOrientationEvent: beta — вперёд/назад, gamma — влево/вправо) —
//    пузырьковый уровень, управление наклоном;
//  - ускорение (DeviceMotionEvent) — встряхивание, шагомер-подобные вещи.
// iOS 13+ требует разрешения, запрошенного из обработчика жеста (клика), поэтому start*
// вызывайте по нажатию кнопки. Android/Chrome — без разрешений.
import {FEATURES} from '@/config/features';

export function isMotionAvailable() {
    return FEATURES.motion && typeof window !== 'undefined' &&
        ('DeviceOrientationEvent' in window || 'DeviceMotionEvent' in window);
}

async function requestPermission(EventClass) {
    if (EventClass && typeof EventClass.requestPermission === 'function') {
        try {
            return (await EventClass.requestPermission()) === 'granted';
        } catch (e) {
            return true; // вызов не из жеста — пробуем как есть
        }
    }
    return true;
}

function assertAvailable() {
    if (!isMotionAvailable()) throw new Error('Датчики движения недоступны на этом устройстве.');
}

/** Наклон: onTilt({beta, gamma}) в градусах. Возвращает Promise<stop()>. */
export async function startTilt(onTilt) {
    assertAvailable();
    if (!(await requestPermission(window.DeviceOrientationEvent))) throw new Error('Нет доступа к датчикам движения.');
    const handler = (e) => {
        if (e.beta === null && e.gamma === null) return;
        onTilt({beta: e.beta || 0, gamma: e.gamma || 0});
    };
    window.addEventListener('deviceorientation', handler, true);
    return () => window.removeEventListener('deviceorientation', handler, true);
}

/** Ускорение с учётом гравитации: onMotion({x, y, z, magnitude}) в м/с². Возвращает Promise<stop()>. */
export async function startMotion(onMotion) {
    assertAvailable();
    if (!(await requestPermission(window.DeviceMotionEvent))) throw new Error('Нет доступа к датчикам движения.');
    const handler = (e) => {
        const a = e.accelerationIncludingGravity;
        if (!a || a.x === null) return;
        onMotion({x: a.x, y: a.y, z: a.z, magnitude: Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z)});
    };
    window.addEventListener('devicemotion', handler, true);
    return () => window.removeEventListener('devicemotion', handler, true);
}

/**
 * Встряхивание: onShake() не чаще раза в cooldownMs, когда ускорение заметно отличается
 * от земного (9.8 м/с²). Возвращает Promise<stop()>.
 */
export async function onShake(callback, {threshold = 15, cooldownMs = 800} = {}) {
    let last = 0;
    return startMotion(({magnitude}) => {
        const now = Date.now();
        if (Math.abs(magnitude - 9.81) > threshold && now - last > cooldownMs) {
            last = now;
            callback();
        }
    });
}
