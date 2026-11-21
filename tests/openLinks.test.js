import {describe, it, expect} from 'vitest';
import {linkToRoute} from '@/native/openLinks';

describe('linkToRoute', () => {
    it('https-ссылка сайта → путь', () => {
        expect(linkToRoute('https://site.ru/some/page?x=1')).toBe('/some/page?x=1');
    });
    it('ссылка с hash-маршрутом', () => {
        expect(linkToRoute('https://site.ru/#/examples/gps')).toBe('/examples/gps');
    });
    it('своя схема с вложенной ссылкой', () => {
        expect(linkToRoute('myapp://open?url=' + encodeURIComponent('https://site.ru/a/b'))).toBe('/a/b');
    });
    it('своя схема с путём', () => {
        expect(linkToRoute('myapp://some/page')).toBe('/some/page');
    });
    it('мусор → null', () => {
        expect(linkToRoute('не ссылка')).toBe(null);
    });
});
