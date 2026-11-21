import { describe, expect, it } from 'vitest';
import { CadrimilData, Period } from '../../types';
import {
    calculateIndividualMissionTotal,
    calculateTotal,
    calcularDiarias,
    getValorDiaria,
} from '../calculations';

const data: CadrimilData = {
    meta: {
        schemaVersion: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
    },
    decretos: [],
    aed: {
        title: 'Adicional de Embarque e Desembarque',
        value: 95,
    },
    grupos: {
        A: 'Grupo A',
    },
    localidades: {
        '1': 'Capital',
    },
    diarias: {
        A: {
            '1': 800,
        },
    },
};

function makePeriod(overrides: Partial<Period> = {}): Period {
    return {
        id: 'period-1',
        grupo: 'A',
        localidade: '1',
        dataInicio: new Date(2025, 0, 1),
        dataFim: new Date(2025, 0, 3),
        quantidadeMilitares: 2,
        contarUltimoDiaInteiro: false,
        valorUnitario: 800,
        registrarEmMinhasMissoes: true,
        ...overrides,
    };
}

describe('calcularDiarias', () => {
    it('counts the last day as half by default', () => {
        expect(calcularDiarias(new Date(2025, 0, 1), new Date(2025, 0, 3), false)).toBe(2.5);
    });

    it('counts the last day as a full day when requested', () => {
        expect(calcularDiarias(new Date(2025, 0, 1), new Date(2025, 0, 3), true)).toBe(3);
    });

    it('handles a single-day period', () => {
        expect(calcularDiarias(new Date(2025, 0, 1), new Date(2025, 0, 1), false)).toBe(0.5);
        expect(calcularDiarias(new Date(2025, 0, 1), new Date(2025, 0, 1), true)).toBe(1);
    });

    it('returns zero for an inverted range', () => {
        expect(calcularDiarias(new Date(2025, 0, 3), new Date(2025, 0, 1), false)).toBe(0);
    });
});

describe('getValorDiaria', () => {
    it('returns the configured rate', () => {
        expect(getValorDiaria('A', '1', data)).toBe(800);
    });

    it('returns zero for an unknown combination', () => {
        expect(getValorDiaria('Z', '9', data)).toBe(0);
    });
});

describe('calculateTotal', () => {
    it('multiplies diárias, rate and military count', () => {
        expect(calculateTotal([makePeriod()], false, data)).toBe(4000);
    });

    it('adds AED per military when included', () => {
        expect(calculateTotal([makePeriod()], true, data)).toBe(4190);
    });

    it('uses the historical rate stored in the period', () => {
        expect(
            calculateTotal([makePeriod({ valorUnitario: 1000 })], false, data)
        ).toBe(5000);
    });
});

describe('calculateIndividualMissionTotal', () => {
    it('includes only periods marked for the user', () => {
        const result = calculateIndividualMissionTotal(
            [
                makePeriod(),
                makePeriod({
                    id: 'period-2',
                    grupo: 'B',
                    quantidadeMilitares: 10,
                    registrarEmMinhasMissoes: false,
                }),
            ],
            true,
            data
        );

        expect(result.diariasTotal).toBe(2000);
        expect(result.aedTotal).toBe(95);
        expect(result.total).toBe(2095);
        expect(result.periodos).toHaveLength(1);
    });
});
