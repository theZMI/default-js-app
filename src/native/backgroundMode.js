// Фоновая работа приложения: cordova-plugin-background-mode не даёт Android убить WebView
// (а с ним звук и GPS-трекинг), пока приложение свёрнуто или экран заблокирован — плагин
// поднимает foreground-service с уведомлением. Включайте его только когда фон реально нужен
// (играет звук, идёт трекинг), чтобы не держать лишнее уведомление.
//
// Фоновый режим могут запрашивать несколько независимых потребителей (плеер, GPS),
// поэтому включение считается по «причинам»: disable(reason) выключает плагин только
// когда не осталось ни одной активной причины.
//
// Плагин появляется только после 'deviceready', а страницы монтируются и просят фон
// раньше — поэтому причины копятся всегда, а плагину состояние передаётся по
// 'deviceready'. Без этого причина, заявленная при запуске, молча терялась.
//
// Нативная часть: хук hooks/fix-background-service-type.js в cordova-проекте дописывает
// foregroundServiceType (mediaPlayback|location) и чинит PendingIntent — без него
// на Android 12+/14+ сервис падает. На iOS плагин не нужен (UIBackgroundModes=audio,
// а хак с тихим аудио-лупом опасен для App Store Review), в вебе его нет — вызовы no-op.
import {FEATURES} from '@/config/features';
import {APP} from '@/config/app';
import {deviceReady, getGlobal} from '@/native/cordova';

const activeReasons = new Map(); // reason -> {title, text}
let configured = false;

function getBgPlugin() {
    if (!FEATURES.backgroundMode) return null;
    return getGlobal('cordova.plugins.backgroundMode');
}

function ensureConfigured(plugin) {
    if (configured) return;
    configured = true;
    // Android WebView по умолчанию замораживает таймеры/JS в фоне — без этого звук
    // и GPS-колбэки прерываются сразу после сворачивания/блокировки экрана.
    plugin.on('activate', () => {
        plugin.disableWebViewOptimizations();
    });
}

// Передать плагину текущее состояние причин
function sync() {
    const plugin = getBgPlugin();
    if (!plugin) return;
    ensureConfigured(plugin);
    if (activeReasons.size === 0) {
        plugin.disable();
        return;
    }
    // Текст уведомления — от последней заявленной причины
    const notification = [...activeReasons.values()].pop() || {};
    const settings = {
        title: notification.title || `${APP.NAME} работает в фоне`,
        text: notification.text || '',
        // Ресурс из cordova-проекта (res/android/adaptive): без существующей иконки
        // Android считает уведомление foreground-сервиса «битым»
        icon: 'ic_launcher_foreground',
        silent: false,
    };
    plugin.setDefaults(settings);
    // Если сервис уже поднят (приложение в фоне) — обновить текст живого уведомления
    if (plugin.isActive()) plugin.configure(settings);
    plugin.enable();
}

deviceReady().then((ready) => ready && sync());

/**
 * @param {string} reason — уникальный идентификатор потребителя ('audio', 'gps'...)
 * @param {{title?: string, text?: string}} notification — текст уведомления foreground-сервиса
 */
export function enableBackgroundMode(reason, notification = {}) {
    activeReasons.delete(reason); // чтобы эта причина стала «последней» (её текст в уведомлении)
    activeReasons.set(reason, notification);
    sync();
}

export function disableBackgroundMode(reason) {
    if (!activeReasons.delete(reason)) return;
    sync();
}

export function isBackgroundModeAvailable() {
    return !!getBgPlugin();
}

export function activeBackgroundReasons() {
    return [...activeReasons.keys()];
}
