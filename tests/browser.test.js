import {describe, it, expect} from 'vitest';
import {isSafeExternalUrl} from '@/native/browser';

describe('isSafeExternalUrl', () => {
    it.each(['https://ya.ru', 'http://site.ru/a?b=1', 'tel:+70000000000', 'mailto:a@b.ru', 'geo:1,2', 'sms:+7000'])('пропускает %s', (url) => {
        expect(isSafeExternalUrl(url)).toBe(true);
    });
    it.each(['javascript:alert(1)', 'file:///etc/passwd', 'intent://x#Intent;end', 'data:text/html,x', '', null])('отклоняет %s', (url) => {
        expect(isSafeExternalUrl(url)).toBe(false);
    });
});
