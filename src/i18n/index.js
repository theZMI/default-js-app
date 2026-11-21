// Мини-локализация без библиотек: словари в ./ru.js, ./en.js, текущий язык — settings.lang.
//   В шаблоне:  {{ $t('menu.home') }}       В JS:  import {t} from '@/i18n'; t('menu.home')
//   Подстановки: t('about.version', {v: '1.0.0'}) для строки 'Версия {v}'
// Нет перевода — берётся русская строка, нет и её — сам ключ (видно, что забыли перевести).
// Переведена оболочка (меню, главная, настройки, «О приложении», 404, обновления);
// раздел «Примеры» — только на русском. Новый язык: файл словаря + строка в LANGUAGES.
import {settings} from '@/libraries/settings';
import ru from './ru';
import en from './en';

const MESSAGES = {ru, en};

export const LANGUAGES = [
    {code: 'ru', name: 'Русский'},
    {code: 'en', name: 'English'},
];

function lookup(dict, key) {
    return key.split('.').reduce((obj, part) => (obj && obj[part] !== undefined ? obj[part] : undefined), dict);
}

export function t(key, params = {}) {
    const text = lookup(MESSAGES[settings.lang] || ru, key) ?? lookup(ru, key) ?? key;
    return String(text).replace(/\{(\w+)\}/g, (_, name) => (params[name] ?? `{${name}}`));
}

// Плагин Vue: $t в шаблонах. Реактивен — settings.lang реактивный, шаблоны перерисуются.
export default {
    install(app) {
        app.config.globalProperties.$t = t;
    },
};
