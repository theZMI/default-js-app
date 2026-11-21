// Пункты меню — единый список для бокового меню (MainMenu), нижнего меню (BottomMainMenu)
// и keep-alive страниц (App.vue). Маршруты — в router/routes.js.
//
//   link          — путь маршрута (пункт подсвечен и на вложенных: /examples/compass)
//   name          — ключ перевода подписи (src/i18n), shortName — для нижнего меню (если отличается)
//   icon          — иконка bootstrap-icons (имя целиком, см. vue.config.js)
//   componentName — name компонента страницы (нужен для keepAlive)
//   keepAlive     — не пересоздавать страницу при уходе с неё (плеер, карта, формы)
//   bottom        — показывать в нижнем меню
//   section       — 'main' (верх бокового меню) или 'extra' (блок «Дополнительно»)
//   feature       — показывать, только если включена FEATURES[feature]
import {FEATURES} from '@/config/features';

const MENU = [
    {
        link: '/',
        name: 'menu.home',
        icon: 'bi-house-door-fill',
        componentName: 'HomePage',
        keepAlive: true,
        bottom: true,
        section: 'main',
    },
    {
        link: '/examples',
        name: 'menu.examples',
        shortName: 'menu.examplesShort',
        icon: 'bi-grid-fill',
        componentName: 'ExamplesPage',
        bottom: true,
        section: 'main',
        feature: 'examples',
    },
    {
        link: '/settings',
        name: 'menu.settings',
        icon: 'bi-gear-fill',
        componentName: 'SettingsPage',
        bottom: true,
        section: 'main',
    },
    {
        link: '/guide',
        name: 'menu.guide',
        icon: 'bi-book-fill',
        componentName: 'GuidePage',
        bottom: false,
        section: 'extra',
    },
    {
        link: '/about',
        name: 'menu.about',
        icon: 'bi-info-circle-fill',
        componentName: 'AboutPage',
        bottom: false,
        section: 'extra',
    },
];

export const menuItems = MENU.filter((item) => !item.feature || FEATURES[item.feature]);
export const mainMenuItems = menuItems.filter((item) => item.section === 'main');
export const extraMenuItems = menuItems.filter((item) => item.section === 'extra');
export const bottomMenuItems = menuItems.filter((item) => item.bottom);
export const keepAlivePages = menuItems.filter((item) => item.keepAlive).map((item) => item.componentName);
