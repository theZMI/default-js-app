// Информация об устройстве: cordova-plugin-device (модель, ОС, uuid), в вебе — что
// можно узнать из браузера. Пригодится для логов ошибок и обращения в поддержку.
import {FEATURES} from '@/config/features';
import {PLATFORM} from '@/config/platform';
import {getPlugin} from '@/native/cordova';
import {CURRENT_VERSION} from '@/native/appUpdates';

export async function getDeviceInfo() {
    const base = {
        appVersion: CURRENT_VERSION,
        buildPlatform: PLATFORM,
        // eslint-disable-next-line no-undef
        buildTime: typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : '',
        online: navigator.onLine,
        language: navigator.language,
        screen: `${window.screen.width}×${window.screen.height} @${window.devicePixelRatio}x`,
    };
    const device = FEATURES.deviceInfo ? await getPlugin('device') : null;
    if (device && device.platform) {
        return {
            ...base,
            cordova: device.cordova,
            platform: device.platform,
            osVersion: device.version,
            model: `${device.manufacturer || ''} ${device.model || ''}`.trim(),
            uuid: device.uuid,
            isVirtual: device.isVirtual,
        };
    }
    return {...base, platform: 'browser', userAgent: navigator.userAgent};
}
