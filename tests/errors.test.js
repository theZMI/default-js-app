import {describe, it, expect} from 'vitest';
import {userErrorMessage, httpErrorMessage} from '@/helpers/errors';

describe('userErrorMessage', () => {
    it('берёт русский текст ошибки сервера', () => {
        expect(userErrorMessage({data: {message: 'Неверный код'}})).toBe('Неверный код');
    });
    it('не показывает английские служебные тексты', () => {
        expect(userErrorMessage(new Error('Network Error'), 'запасной')).toBe('запасной');
    });
    it('переводит HTTP-статусы', () => {
        expect(userErrorMessage({response: {status: 503}})).toBe(httpErrorMessage(503));
        expect(httpErrorMessage(404)).toMatch(/нет/);
    });
});
