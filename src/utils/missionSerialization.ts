// Shared serialization for missions persisted locally or exported to files.
import { Mission, Period } from '../types';
import { DateHelpers } from './dateHelpers';

export type SerializedPeriod = Omit<Period, 'dataInicio' | 'dataFim'> & {
    dataInicio: string;
    dataFim: string;
};

export type SerializedMission = Omit<Mission, 'periodos'> & {
    periodos: SerializedPeriod[];
};

/**
 * Converts mission dates to the date-only format used by the app.
 * This avoids timezone shifts when a mission is imported on another device.
 */
export function serializeMissionDates(mission: Mission): SerializedMission {
    return {
        ...mission,
        periodos: mission.periodos.map(period => ({
            ...period,
            dataInicio: DateHelpers.toISOString(period.dataInicio),
            dataFim: DateHelpers.toISOString(period.dataFim),
        })),
    };
}
