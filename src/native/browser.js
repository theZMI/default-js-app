// Открытие ссылок вне приложения: во внешнем браузере, звонилке, почте, картах.
//  - Cordova: cordova-plugin-inappbrowser с target '_system' (без плагина WebView
//    открыл бы сайт прямо внутри приложения, вместо него, без кнопки «назад»);
//  - веб: новая вкладка.
// Ссылки tel:/mailto:/geo: в Cordova разрешены через <allow-intent> в config.xml.
import {FEATURES} from '@/config/features';
import {getGlobal, isCordova} from '@/native/cordova';

// Схемы, которые можно открывать наружу. Ссылка может прийти из QR-кода или с сервера —
// javascript:, file:, intent: и т.п. открывать нельзя (выполнение кода, доступ к файлам).
const SAFE_SCHEMES = /^(https?|tel|mailto|sms|geo|market):/i;

export function isSafeExternalUrl(url) {
    return typeof url === 'string' && SAFE_SCHEMES.test(url.trim());
}

export function openExternal(url) {
    if (!isSafeExternalUrl(url)) {
        console.warn('openExternal: небезопасная ссылка отклонена', url);
        return false;
    }
    const iab = getGlobal('cordova.InAppBrowser');
    if (FEATURES.externalLinks && isCordova() && iab) {
        iab.open(url, '_system', 'location=yes');
        return true;
    }
    if (/^(tel|mailto|sms|geo|market):/i.test(url)) {
        window.location.href = url;
        return true;
    }
    window.open(url, '_blank', 'noopener');
    return true;
}

// Внутренний браузер поверх приложения (с крестиком «закрыть») — например, оплата или
// страница авторизации стороннего сервиса. В вебе — просто новая вкладка.
export function openInApp(url, options = 'location=yes,hidenavigationbuttons=yes,closebuttoncaption=Закрыть') {
    if (!/^https?:/i.test(url)) return null;
    const iab = getGlobal('cordova.InAppBrowser');
    if (iab) return iab.open(url, '_blank', options);
    return window.open(url, '_blank', 'noopener');
}
