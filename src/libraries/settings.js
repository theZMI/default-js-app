// Пользовательские настройки приложения (страница «Настройки»): тема, размер текста,
// звук, вибро-отклик, язык. Какие из них видит пользователь — APP.SETTINGS. Хранятся в localStorage — он читается синхронно, поэтому тема и
// масштаб применяются ДО первой отрисовки, без «вспышки» тёмной темы при светлой настройке.
// Значения по умолчанию — в src/config/app.js (APP.DEFAULT_SETTINGS).
import {reactive, watch} from 'vue';
import {APP} from '@/config/app';

const STORAGE_KEY = 'app-settings';

export const THEMES = {DARK: 'dark', LIGHT: 'light', SYSTEM: 'system'};
export const TEXT_SCALES = {normal: 1, large: 1.12, xlarge: 1.25};

// Тема и размер текста без блока «Оформление» (APP.SETTINGS.APPEARANCE) пользователь не выбирает —
// всегда по умолчанию, даже если в localStorage осталось значение от прежней версии
const FIXED = APP.SETTINGS?.APPEARANCE ? [] : ['theme', 'textScale'];

function load() {
    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
        // приватный режим / битые данные — берём значения по умолчанию
    }
    const result = {...APP.DEFAULT_SETTINGS, ...saved};
    for (const key of FIXED) result[key] = APP.DEFAULT_SETTINGS[key];
    return result;
}

export const settings = reactive(load());

const systemDark = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

export function resolvedTheme() {
    if (settings.theme === THEMES.SYSTEM) return systemDark && !systemDark.matches ? THEMES.LIGHT : THEMES.DARK;
    return settings.theme === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
}

function apply() {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const theme = resolvedTheme();
    root.dataset.appTheme = theme;
    // Bootstrap-компоненты (поля, крестики, модалки) переключают свою палитру по data-bs-theme
    root.setAttribute('data-bs-theme', theme);
    const scale = TEXT_SCALES[settings.textScale] || 1;
    root.style.setProperty('--app-text-scale', String(scale));
    root.classList.toggle('app-text-scaled', scale !== 1);
    root.lang = settings.lang;
    // Цвет системной панели браузера/PWA — под фон темы
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--app-theme-color').trim() || '#000000');
}

/** Применить настройки и следить за изменениями. Вызывается один раз в main.js до mount. */
export function initSettings() {
    apply();
    watch(settings, () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            // приватный режим / нет места — настройки просто не переживут перезапуск
        }
        apply();
    }, {deep: true});
    systemDark?.addEventListener?.('change', () => settings.theme === THEMES.SYSTEM && apply());
}

export function resetSettings() {
    Object.assign(settings, APP.DEFAULT_SETTINGS);
}

// «Сбросить прогресс»: удалить ключи APP.SETTINGS.PROGRESS_KEYS и дать приложению сбросить
// данные в памяти (реактивный прогресс, кэш уровней) — через onProgressReset(fn)
const progressResetHandlers = [];

export function onProgressReset(handler) {
    progressResetHandlers.push(handler);
}

export function resetProgress() {
    for (const key of APP.SETTINGS?.PROGRESS_KEYS || []) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            // нет доступа к localStorage — нечего и удалять
        }
    }
    for (const handler of progressResetHandlers) handler();
}
