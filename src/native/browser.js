// Открытие ссылок вне приложения: во внешнем браузере, звонилке, почте, картах.
//  - Cordova: cordova-plugin-inappbrowser с target '_system' (без плагина WebView
//    открыл бы сайт прямо внутри приложения, вместо него, без кнопки «назад»);
//  - веб: новая вкладка.
// Ссылки tel:/mailto:/geo: в Cordova разрешены через <allow-intent> в config.xml.
import {FEATURES} from '@/config/features';
import {getGlobal, isCordova} from '@/native/cordova';

export function openExternal(url) {
    const iab = getGlobal('cordova.InAppBrowser');
    if (FEATURES.externalLinks && isCordova() && iab) {
        iab.open(url, '_system', 'location=yes');
        return;
    }
    if (/^(tel|mailto|sms|geo):/i.test(url)) {
        window.location.href = url;
        return;
    }
    window.open(url, '_blank', 'noopener');
}

// Внутренний браузер поверх приложения (с крестиком «закрыть») — например, оплата или
// страница авторизации стороннего сервиса. В вебе — просто новая вкладка.
export function openInApp(url, options = 'location=yes,hidenavigationbuttons=yes,closebuttoncaption=Закрыть') {
    const iab = getGlobal('cordova.InAppBrowser');
    if (iab) return iab.open(url, '_blank', options);
    return window.open(url, '_blank', 'noopener');
}
