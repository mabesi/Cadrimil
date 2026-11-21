import { describe, expect, it } from 'vitest';
import { Mission, Period } from '../../types';
import { getMissionStartDate, groupMissionsByYear } from '../missionGrouping';

function makePeriod(dataInicio: Date, dataFim = dataInicio, id = 'period-1'): Period {
    return {
        id,
        grupo: 'A',
        localidade: '1',
        dataInicio,
        dataFim,
        quantidadeMilitares: 1,
        contarUltimoDiaInteiro: false,
        valorUnitario: 800,
        registrarEmMinhasMissoes: false,
    };
}

function makeMission(
    id: string,
    periods: Period[],
    dataCriacao = '2020-01-01T00:00:00.000Z'
): Mission {
    return {
        id,
        nomeMissao: `Missão ${id}`,
        dataCriacao,
        periodos: periods,
        incluirAED: false,
        aedValue: 95,
        tabelaMeta: {
            schemaVersion: 1,
            updatedAt: '2026-01-01T00:00:00.000Z',
        },
        valorTotal: 0,
        decretosReferencia: [],
    };
}

describe('getMissionStartDate', () => {
    it('uses the earliest period start date', () => {
        const mission = makeMission('1', [
            makePeriod(new Date(2025, 5, 10), undefined, 'p1'),
            makePeriod(new Date(2025, 0, 5), undefined, 'p2'),
        ]);

        expect(getMissionStartDate(mission).getTime()).toBe(new Date(2025, 0, 5).getTime());
    });

    it('falls back to the creation date when periods have invalid dates', () => {
        const mission = makeMission(
            '1',
            [makePeriod(new Date('invalid'))],
            '2023-04-02T00:00:00.000Z'
        );

        expect(getMissionStartDate(mission).getTime()).toBe(
            new Date('2023-04-02T00:00:00.000Z').getTime()
        );
    });
});

describe('groupMissionsByYear', () => {
    it('sorts missions and groups them by the first period year', () => {
        const missions = [
            makeMission('late-2025', [makePeriod(new Date(2025, 10, 1))]),
            makeMission('2024', [makePeriod(new Date(2024, 2, 1))]),
            makeMission('early-2025', [makePeriod(new Date(2025, 1, 1))]),
        ];

        const groups = groupMissionsByYear(missions);

        expect(groups.map(group => group.year)).toEqual([2024, 2025]);
        expect(groups[0].missions.map(mission => mission.id)).toEqual(['2024']);
        expect(groups[1].missions.map(mission => mission.id)).toEqual([
            'early-2025',
            'late-2025',
        ]);
    });
});
