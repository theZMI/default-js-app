import {FEATURES} from '@/config/features';
import HomePage from "@/components/HomePage.vue";
import {exampleRoutes} from "@/components/examples";

// Стартовая страница — в основном бандле. Остальные — отдельными чанками: первый
// запуск не разбирает их JS. vue-cli добавляет на них <link rel="prefetch">, так что
// браузер докачивает их в простое (а service worker кладёт в кэш для офлайна).
const ExamplesPage = () => import("@/components/examples/ExamplesPage.vue");
const AboutPage = () => import("@/components/AboutPage.vue");
const SettingsPage = () => import("@/components/SettingsPage.vue");
const GuidePage = () => import("@/components/GuidePage.vue");
// Страница обновления и так в основном бандле (её встраивают App.vue и «О приложении»)
import CheckUpdatesPage from "@/components/CheckUpdatesPage.vue";
const NotFoundPage = () => import("@/components/NotFoundPage.vue");

export const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage,
    },
    // Cordova на Android открывает file:///android_asset/www/index.html — на случай, если
    // путь попадёт в роутер (history-режим, старые ссылки), уводим на главную
    {
        path: '/android_asset/www/index.html',
        redirect: '/',
    },
    // Раздел «Примеры»: хаб + по странице на каждую возможность (src/components/examples/)
    ...(FEATURES.examples ? [{
        path: '/examples',
        name: 'examples',
        component: ExamplesPage,
    }, ...exampleRoutes] : []),
    {
        path: '/settings',
        name: 'settings',
        component: SettingsPage,
    },
    {
        path: '/guide',
        name: 'guide',
        component: GuidePage,
    },
    {
        path: '/about',
        name: 'about',
        component: AboutPage,
    },
    ...(FEATURES.appUpdates ? [{
        path: '/check-updates',
        name: 'check-updates',
        component: CheckUpdatesPage,
    }] : []),
    {
        path: '/:pathMatch(.*)*',
        name: 'page-not-found',
        component: NotFoundPage,
    },
];
