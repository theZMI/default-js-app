// Вибрация: navigator.vibrate работает в Android WebView и Chrome без плагинов.
// iOS (и Safari) вибрацию из JS не поддерживает — вызовы просто ничего не делают.
import {FEATURES} from '@/config/features';
import {settings} from '@/libraries/settings';

export function isVibrationAvailable() {
    return FEATURES.vibration && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

// pattern — миллисекунды или массив [вибрация, пауза, вибрация, ...]
export function vibrate(pattern = 50) {
    if (!isVibrationAvailable()) return false;
    // Пользователь выключил вибро-отклик в настройках (остановку vibrate(0) пропускаем всегда)
    if (!settings.haptics && pattern !== 0) return false;
    return navigator.vibrate(pattern);
}

export const VIBRATION = {
    TAP: 15,
    SUCCESS: [30, 60, 30],
    ERROR: [80, 50, 80, 50, 80],
};
