import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import directives from '@/directives'
import components from '@/components/UI'
import { setupViewportMinWidth } from '@/helpers/viewportMinWidth'
import { initSettings } from '@/libraries/settings'
import i18n from '@/i18n'
import { FEATURES } from '@/config/features'
import { APP } from '@/config/app'
import { initBackButton } from '@/native/backButton'
import { initOpenLinks } from '@/native/openLinks'
import { initPwaInstall } from '@/native/pwaInstall'
import { requestGeoPermissionOnStartup } from '@/native/geolocation'
import { initErrorReporter } from '@/libraries/errorReporter'
import { apiQueue } from '@/libraries/offlineQueue'

// Из bootstrap-JS используется только offcanvas (боковое меню, data-bs-toggle в MainMenu).
// Понадобятся модалки/дропдауны/тултипы — подключите их так же поштучно:
// import 'bootstrap/js/dist/modal'
import 'bootstrap/js/dist/offcanvas'
import '@/styles/scss/bootstrap-icons.scss'

// Тема и масштаб — до монтирования, чтобы не мигала тёмная тема при светлой настройке
initSettings()
// Отступы под меню (App.vue): без нижнего меню — место под кнопку «☰» сверху
document.documentElement.classList.toggle('app-menu-burger', APP.MENU_STYLE === 'burger')
setupViewportMinWidth()

const app = createApp(App)

directives.forEach(v => { app.directive(v.name, v) })
components.forEach(v => { app.component(v.name, v) })

// Отчёты об ошибках — до mount, чтобы поймать и ошибки первой отрисовки
initErrorReporter(app, router)

app.use(store).use(router).use(i18n).mount('#app')

// Офлайн-очередь: отправлять накопленные запросы при появлении сети
if (FEATURES.offlineQueue) apiQueue.start()

// Нативные возможности: каждая сама проверяет свой флаг в FEATURES и наличие плагина
initBackButton(router)
initOpenLinks(router)
initPwaInstall()
requestGeoPermissionOnStartup()

// iOS (в первую очередь standalone-PWA): после аварийной перезагрузки страницы
// (система убила её по памяти) скролл-контейнер #app иногда «замерзает» — WebKit
// не пересоздаёт слой прокрутки, и страница ведёт себя как height:100vh+overflow:hidden.
// Лечится принудительным пересозданием слоя: выключить/включить overflow с relayout
// между ними. pageshow срабатывает на каждый показ страницы, включая восстановление
// после вылета и возврат из bfcache; на обычных стартах трюк безвреден и незаметен.
window.addEventListener('pageshow', () => {
    requestAnimationFrame(() => {
        const appEl = document.getElementById('app');
        if (!appEl) return;
        const scrollTop = appEl.scrollTop;
        appEl.style.overflowY = 'hidden';
        void appEl.offsetHeight; // форсируем relayout между переключениями
        appEl.style.overflowY = '';
        appEl.scrollTop = scrollTop;
    });
})

// Регистрация SW нужна только в настоящем браузере: под Cordova (file://,
// window.cordova) installability PWA не имеет смысла, а сам API там недоступен.
// Проверяем рантайм, а не только платформу сборки — один и тот же билд может
// открываться и в браузере (сайт), и оборачиваться в Cordova.
// Только production — иначе на dev-сервере SW закэширует JS/CSS по их фиксированным
// (без хэша) dev-URL и будет подсовывать старый бандл после каждой пересборки.
if (!window.cordova && location.protocol.startsWith('http') && 'serviceWorker' in navigator) {
    if (FEATURES.pwa && import.meta.env.PROD) {
        window.addEventListener('load', () => {
            // updateViaCache: 'none' — скрипт SW при проверке обновлений всегда мимо HTTP-кэша
            navigator.serviceWorker.register(`${import.meta.env.BASE_URL}service-worker.js`, {updateViaCache: 'none'});
        });
    } else {
        // Самоисцеление: снять SW, если он успел зарегистрироваться раньше (dev-сервер,
        // PWA выключили в FEATURES) — иначе origin так и будет показывать старый код
        navigator.serviceWorker.getRegistrations().then((regs) => {
            for (const reg of regs) reg.unregister();
        });
        if (window.caches) caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
}
