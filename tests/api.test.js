import {describe, it, expect} from 'vitest';
import {IsApiResponse, ToApiResponse} from '@/helpers/api';

describe('формат ответа API', () => {
    it('распознаёт {is_success, is_error, data}', () => {
        expect(IsApiResponse({is_success: true, is_error: false, data: 1})).toBe(true);
        expect(IsApiResponse({data: 1})).toBe(false);
        expect(IsApiResponse('<html>')).toBe(false);
    });
    it('оборачивает данные', () => {
        expect(ToApiResponse({a: 1})).toEqual({is_success: false, is_error: false, data: {a: 1}});
    });
});
