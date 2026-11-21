// Utilities for ordering and grouping missions by their first period start date
import { Mission } from '../types';
import { DateHelpers } from './dateHelpers';

function toDate(value: unknown): Date | null {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value !== 'string' || value.trim() === '') return null;

    const parsed = DateHelpers.parseISO(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getMissionStartDate(mission: Mission): Date {
    const starts = mission.periodos
        .map(period => toDate(period.dataInicio))
        .filter((date): date is Date => date !== null)
        .sort((a, b) => a.getTime() - b.getTime());

    if (starts.length > 0) return starts[0];

    const createdAt = new Date(mission.dataCriacao);
    return Number.isNaN(createdAt.getTime()) ? new Date(0) : createdAt;
}

export function groupMissionsByYear(
    missions: Mission[]
): Array<{ year: number; missions: Mission[] }> {
    const sorted = [...missions].sort(
        (a, b) => getMissionStartDate(a).getTime() - getMissionStartDate(b).getTime()
    );
    const groups = new Map<number, Mission[]>();

    sorted.forEach(mission => {
        const year = getMissionStartDate(mission).getFullYear();
        const group = groups.get(year) ?? [];
        group.push(mission);
        groups.set(year, group);
    });

    return Array.from(groups.entries()).map(([year, group]) => ({
        year,
        missions: group,
    }));
}
