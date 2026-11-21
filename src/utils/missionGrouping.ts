// Utilities for ordering and grouping missions by their first period start date
import { Mission } from '../types';
import { DateHelpers } from './dateHelpers';

export function getMissionStartDate(mission: Mission): Date {
    const starts = mission.periodos
        .map(period => {
            if (period.dataInicio instanceof Date) return period.dataInicio;
            return DateHelpers.parseISO(period.dataInicio as unknown as string);
        })
        .filter(date => !Number.isNaN(date.getTime()))
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
