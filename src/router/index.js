import { createRouter, createWebHashHistory } from 'vue-router'
import { routes } from "@/router/routes";

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes
});

// Скролл приложения живёт в #app, а не в окне (см. App.vue), поэтому стандартный
// scrollBehavior роутера не работает: на новой странице прокручиваем #app наверх сами.
// При «Назад» (popstate) позицию не трогаем — keep-alive страницы сохраняют свою.
let isPopState = false;
window.addEventListener('popstate', () => { isPopState = true; });
router.afterEach((to, from) => {
    if (!isPopState && to.path !== from.path) {
        const app = document.getElementById('app');
        if (app) app.scrollTop = 0;
    }
    isPopState = false;
});

export default router;
