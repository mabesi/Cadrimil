import { describe, expect, it } from 'vitest';
import { CadrimilData } from '../../types';
import { isCadrimilData } from '../validation';

function makeData(): CadrimilData {
    return {
        meta: {
            schemaVersion: 1,
            updatedAt: '2026-01-01T00:00:00.000Z',
            validFrom: '2024-12-19',
        },
        decretos: [
            {
                title: 'Decreto de teste',
                decree: 'Decreto nº 1',
                date: '19 de dezembro de 2024',
                link: 'https://example.com',
            },
        ],
        aed: {
            title: 'Adicional de Embarque e Desembarque',
            value: 95,
        },
        grupos: {
            A: 'Grupo A',
            B: 'Grupo B',
        },
        localidades: {
            '1': 'Capital',
            '2': 'Interior',
        },
        diarias: {
            A: { '1': 800, '2': 700 },
            B: { '1': 600, '2': 500 },
        },
    };
}

describe('isCadrimilData', () => {
    it('accepts a complete payload', () => {
        expect(isCadrimilData(makeData())).toBe(true);
    });

    it('rejects a missing group row', () => {
        const value = makeData();
        delete (value.diarias as Record<string, unknown>).B;
        expect(isCadrimilData(value)).toBe(false);
    });

    it('rejects a missing locality cell', () => {
        const value = makeData();
        delete (value.diarias.A as Record<string, unknown>)['2'];
        expect(isCadrimilData(value)).toBe(false);
    });

    it('rejects an extra group row', () => {
        const value = makeData();
        (value.diarias as Record<string, unknown>).C = { '1': 1, '2': 1 };
        expect(isCadrimilData(value)).toBe(false);
    });

    it('rejects an unsupported schema version', () => {
        const value = makeData();
        value.meta.schemaVersion = 2;
        expect(isCadrimilData(value)).toBe(false);
    });

    it('rejects invalid dates and rates', () => {
        const invalidDate = makeData();
        invalidDate.meta.updatedAt = 'not-a-date';
        expect(isCadrimilData(invalidDate)).toBe(false);

        const negativeRate = makeData();
        negativeRate.diarias.A['1'] = -1;
        expect(isCadrimilData(negativeRate)).toBe(false);
    });
});
