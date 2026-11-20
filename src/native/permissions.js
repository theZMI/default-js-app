// Runtime-разрешения Android через cordova-plugin-android-permissions.
//
// Зачем, если плагины (геолокация, камера) сами спрашивают права при первом обращении:
// так можно запросить разрешение заранее (например, на старте) и узнать его состояние,
// не дёргая саму функцию. Без плагина (браузер, iOS) считаем, что разрешение решит
// система при первом обращении, и возвращаем true.
import {getPlugin, promisify} from '@/native/cordova';

export const PERMISSIONS = {
    FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
    CAMERA: 'android.permission.CAMERA',
    POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
    READ_MEDIA_IMAGES: 'android.permission.READ_MEDIA_IMAGES',
    READ_MEDIA_AUDIO: 'android.permission.READ_MEDIA_AUDIO',
};

async function plugin() {
    return getPlugin('cordova.plugins.permissions');
}

// true/false — выдано ли; null — узнать нельзя (нет плагина)
export async function checkPermission(permission) {
    const p = await plugin();
    if (!p) return null;
    try {
        const status = await promisify((ok, fail) => p.checkPermission(permission, ok, fail));
        return !!status?.hasPermission;
    } catch (e) {
        return null;
    }
}

// Запросить, если ещё не выдано. Повторный запрос при уже выданном разрешении
// возвращает success без диалога.
export async function ensurePermission(permission) {
    const p = await plugin();
    if (!p) return true;
    if (await checkPermission(permission)) return true;
    try {
        const status = await promisify((ok, fail) => p.requestPermission(permission, ok, fail));
        return !!status?.hasPermission;
    } catch (e) {
        return false;
    }
}
