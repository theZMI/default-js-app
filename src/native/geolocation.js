// Геолокация. В Cordova cordova-plugin-geolocation подменяет navigator.geolocation
// нативной реализацией, API тот же, поэтому код одинаков для веба и приложений.
//
// Веб: геолокация работает только в secure context (https или localhost).
import {FEATURES} from '@/config/features';
import {deviceReady} from '@/native/cordova';
import {ensurePermission, PERMISSIONS} from '@/native/permissions';
import {enableBackgroundMode, disableBackgroundMode} from '@/native/backgroundMode';

export const DEFAULT_GEO_OPTIONS = {enableHighAccuracy: true, maximumAge: 5000, timeout: 15000};

export function isGeolocationAvailable() {
    return FEATURES.geolocation && typeof navigator !== 'undefined' && !!navigator.geolocation;
}

// Понятный пользователю текст ошибки GeolocationPositionError
export function geoErrorMessage(err) {
    switch (err?.code) {
        case 1: return 'Нет доступа к геолокации — разрешите его в настройках.';
        case 2: return 'Не удалось определить местоположение — проверьте, включён ли GPS.';
        case 3: return 'Местоположение определяется слишком долго — попробуйте ещё раз на открытом месте.';
        default: return err?.message || 'Геолокация недоступна.';
    }
}

function toPlain(pos) {
    const c = pos.coords;
    return {
        latitude: c.latitude,
        longitude: c.longitude,
        accuracy: c.accuracy,
        altitude: c.altitude,
        heading: c.heading,
        speed: c.speed,
        timestamp: pos.timestamp,
    };
}

export async function getCurrentPosition(options = {}) {
    if (!isGeolocationAvailable()) throw new Error('Геолокация недоступна.');
    await deviceReady();
    await ensurePermission(PERMISSIONS.FINE_LOCATION);
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(toPlain(pos)),
            (err) => reject(Object.assign(new Error(geoErrorMessage(err)), {code: err?.code})),
            {...DEFAULT_GEO_OPTIONS, ...options},
        );
    });
}

/**
 * Следить за положением. Возвращает функцию stop().
 * options.background — {title, text}: держать приложение живым в фоне, пока идёт слежение
 * (FEATURES.backgroundMode), иначе свёрнутое приложение перестаёт получать координаты.
 */
export function watchPosition(onPosition, onError = () => {}, options = {}) {
    const {background, ...geoOptions} = options;
    let watchId = null;
    let stopped = false;
    const bgReason = `geo-${Math.random().toString(36).slice(2)}`;

    if (!isGeolocationAvailable()) {
        onError(new Error('Геолокация недоступна.'));
        return () => {};
    }
    if (background) enableBackgroundMode(bgReason, background);

    (async () => {
        await deviceReady();
        await ensurePermission(PERMISSIONS.FINE_LOCATION);
        if (stopped) return;
        watchId = navigator.geolocation.watchPosition(
            (pos) => onPosition(toPlain(pos)),
            (err) => {
                // Доступ запрещён — слежение не заработает, фон держать незачем.
                // Прочие ошибки (таймаут, нет сигнала) не прерывают watchPosition —
                // он продолжит попытки и подхватит координаты, когда они появятся.
                if (err?.code === 1) disableBackgroundMode(bgReason);
                onError(Object.assign(new Error(geoErrorMessage(err)), {code: err?.code}));
            },
            {...DEFAULT_GEO_OPTIONS, ...geoOptions},
        );
    })();

    return function stop() {
        stopped = true;
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        disableBackgroundMode(bgReason);
    };
}

// Спросить разрешение на геолокацию сразу при запуске (FEATURES.geolocationPermissionOnStartup).
// Фоновую геолокацию (ACCESS_BACKGROUND_LOCATION) намеренно не запрашиваем: трекинг в
// свёрнутом виде держится на foreground-сервисе с типом location (см. backgroundMode.js),
// а отдельное «разрешить всегда» лишний раз пугает пользователя.
export function requestGeoPermissionOnStartup() {
    if (!FEATURES.geolocation || !FEATURES.geolocationPermissionOnStartup) return;
    deviceReady().then((ready) => ready && ensurePermission(PERMISSIONS.FINE_LOCATION));
}

// Расстояние между двумя точками в метрах (формула гаверсинусов)
export function distanceMeters(a, b) {
    const R = 6371000;
    const toRad = (d) => d * Math.PI / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}
