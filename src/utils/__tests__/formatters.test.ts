import { describe, expect, it } from 'vitest';
import { formatCurrency } from '../formatters';

describe('formatCurrency', () => {
    it('formats values using the Brazilian locale', () => {
        expect(formatCurrency(1234.56)).toBe('1.234,56');
        expect(formatCurrency(0)).toBe('0,00');
    });

    it('falls back to zero for invalid values', () => {
        expect(formatCurrency(Number.NaN)).toBe('0,00');
    });
});
