import {describe, it, expect} from 'vitest';
import {heightFix, zoomForWidth} from '@/helpers/viewportMinWidth';

describe('масштаб узкого экрана', () => {
    it('уже 360 px — страница уменьшается целиком, чтобы макет 360 px влез без прокрутки вбок', () => {
        expect(zoomForWidth(320)).toBeCloseTo(320 / 360);
        expect(320 / zoomForWidth(320)).toBeCloseTo(360);
    });
    it('от 360 px и шире, а также неизвестная ширина — без масштаба', () => {
        expect(zoomForWidth(360)).toBe(1);
        expect(zoomForWidth(412)).toBe(1);
        expect(zoomForWidth(0)).toBe(1);
    });
    it('поправка высоты: 100dvh под zoom уменьшился — растянуть обратно, не уменьшился — не трогать', () => {
        expect(heightFix(640, 640 * (320 / 360))).toBeCloseTo(1.125);
        expect(heightFix(640, 640)).toBe(1);
        expect(heightFix(640, 639.5)).toBe(1);
        expect(heightFix(0, 500)).toBe(1);
        expect(heightFix(640, 0)).toBe(1);
    });
});
