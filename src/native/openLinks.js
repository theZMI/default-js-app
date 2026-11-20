// Открытие приложения по ссылке: https://LINK_HOST/… (Android App Links) и своя схема
// URL_SCHEME://… — свой плагин native-plugins/cordova-plugin-open-link (FEATURES.openLinks).
// Ставится с параметрами конкретного приложения:
//   cordova plugin add ../<app>/native-plugins/cordova-plugin-open-link \
//       --variable LINK_HOST=site.ru --variable LINK_PATH_PREFIX=/ --variable URL_SCHEME=myapp
//
// По умолчанию ссылка превращается в маршрут приложения:
//   https://site.ru/some/page?x=1   → #/some/page?x=1
//   myapp://open?url=<https-ссылка> → как https-ссылка
//   myapp://some/page               → #/some/page
// Нужна другая логика — передайте свой handler(link, router).
import {FEATURES} from '@/config/features';
import {getPlugin} from '@/native/cordova';

export function linkToRoute(link) {
    try {
        let url = new URL(link);
        if (!/^https?:$/.test(url.protocol)) {
            const inner = url.searchParams.get('url');
            if (inner) {
                url = new URL(inner);
            } else {
                // myapp://some/page — host у нестандартной схемы = первый сегмент пути
                return '/' + [url.host, url.pathname.replace(/^\/+/, '')].filter(Boolean).join('/') + url.search;
            }
        }
        // Ссылка вида https://site.ru/#/page — берём маршрут из хэша
        if (url.hash.startsWith('#/')) return url.hash.slice(1);
        return url.pathname + url.search;
    } catch (e) {
        return null;
    }
}

export async function initOpenLinks(router, handler = null) {
    if (!FEATURES.openLinks) return;
    const plugin = await getPlugin('cordova.plugins.OpenLink');
    if (!plugin) return;
    plugin.listen((link) => {
        if (handler) {
            handler(link, router);
            return;
        }
        const route = linkToRoute(link);
        if (route) router.push(route);
    });
}
