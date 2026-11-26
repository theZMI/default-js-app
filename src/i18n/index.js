// Мини-локализация без библиотек: словари ./<код>.js (11 языков, как в приложениях из заготовки),
// текущий язык — settings.lang.
//   В шаблоне:  {{ $t('menu.home') }}       В JS:  import {t} from '@/i18n'; t('menu.home')
//   Подстановки: t('about.version', {v: '1.0.0'}) для строки 'Версия {v}'
// Нет перевода — берётся русская строка, нет и её — сам ключ (видно, что забыли перевести).
// Переведена оболочка (меню, главная, настройки, «О приложении», 404); раздел «Примеры» и окно
// обновления APK — только на русском. Новый язык: файл словаря (те же ключи, что в ru.js) +
// импорт и строка в LANGUAGES; tests/i18n.test.js проверит, что все ключи на месте.
import {settings} from '@/libraries/settings';
import ru from './ru';
import en from './en';
import de from './de';
import fr from './fr';
import es from './es';
import it from './it';
import pt from './pt';
import nl from './nl';
import pl from './pl';
import tr from './tr';
import uk from './uk';

export const MESSAGES = {ru, en, de, fr, es, it, pt, nl, pl, tr, uk};

// Только языки на латинице и кириллице — их покрывает встроенный шрифт PT Sans.
// Названия — на самом языке, чтобы человек нашёл свой, даже если интерфейс на чужом.
export const LANGUAGES = [
    {code: 'ru', name: 'Русский'},
    {code: 'en', name: 'English'},
    {code: 'de', name: 'Deutsch'},
    {code: 'fr', name: 'Français'},
    {code: 'es', name: 'Español'},
    {code: 'it', name: 'Italiano'},
    {code: 'pt', name: 'Português'},
    {code: 'nl', name: 'Nederlands'},
    {code: 'pl', name: 'Polski'},
    {code: 'tr', name: 'Türkçe'},
    {code: 'uk', name: 'Українська'},
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
