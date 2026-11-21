import {describe, it, expect} from 'vitest';
import {distanceMeters} from '@/native/geolocation';

describe('distanceMeters', () => {
    it('0 для одной точки', () => {
        expect(distanceMeters({latitude: 54.7, longitude: 20.5}, {latitude: 54.7, longitude: 20.5})).toBe(0);
    });
    it('1° широты ≈ 111 км', () => {
        const d = distanceMeters({latitude: 54, longitude: 20}, {latitude: 55, longitude: 20});
        expect(d).toBeGreaterThan(110000);
        expect(d).toBeLessThan(112500);
    });
});
