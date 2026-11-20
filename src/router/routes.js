import {FEATURES} from '@/config/features';
import HomePage from "@/components/HomePage.vue";

// Стартовая страница — в основном бандле. Остальные — отдельными чанками: первый
// запуск не разбирает их JS. vue-cli добавляет на них <link rel="prefetch">, так что
// браузер докачивает их в простое (а service worker кладёт в кэш для офлайна).
const DevicePage = () => import("@/components/DevicePage.vue");
const AboutPage = () => import("@/components/AboutPage.vue");
const CheckUpdatesPage = () => import("@/components/CheckUpdatesPage.vue");
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
    ...(FEATURES.devicePage ? [{
        path: '/device',
        name: 'device',
        component: DevicePage,
    }] : []),
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
