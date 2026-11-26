import {describe, expect, it, vi} from 'vitest';

// Словари импортируют settings → localStorage; в node его нет — даём пустую заглушку
vi.stubGlobal('localStorage', {getItem: () => null, setItem: () => {}, removeItem: () => {}});

const {MESSAGES, LANGUAGES, t} = await import('@/i18n');
const {settings} = await import('@/libraries/settings');

// Плоский список путей словаря
function keys(obj, prefix = '') {
    return Object.entries(obj).flatMap(([k, v]) => {
        const path = prefix ? `${prefix}.${k}` : k;
        return v && typeof v === 'object' && !Array.isArray(v) ? keys(v, path) : [path];
    });
}

describe('i18n', () => {
    const ruKeys = keys(MESSAGES.ru).sort();

    it('у каждого языка из списка есть словарь, и наоборот', () => {
        expect(LANGUAGES.map((l) => l.code).sort()).toEqual(Object.keys(MESSAGES).sort());
    });

    it.each(Object.keys(MESSAGES))('словарь %s повторяет все ключи русского', (code) => {
        expect(keys(MESSAGES[code]).sort()).toEqual(ruKeys);
    });

    it.each(Object.keys(MESSAGES))('в словаре %s нет пустых строк', (code) => {
        const empty = keys(MESSAGES[code]).filter((k) => !String(k.split('.').reduce((o, p) => o[p], MESSAGES[code])).trim());
        expect(empty).toEqual([]);
    });

    it('перевод по текущему языку, подстановки и запасной русский', () => {
        const lang = settings.lang;
        settings.lang = 'de';
        expect(t('settings.title')).toBe('Einstellungen');
        settings.lang = 'ru';
        expect(t('about.version')).toBe('Версия');
        expect(t('no.such.key')).toBe('no.such.key');
        settings.lang = lang;
    });
});
