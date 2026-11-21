// Storage service using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mission, Period } from '../types';
import { DateHelpers } from '../utils/dateHelpers';
import { createId } from '../utils/id';
import { serializeMissionDates } from '../utils/missionSerialization';

const MISSIONS_KEY = 'cadrimil_missions';

type UnknownRecord = Record<string, unknown>;

export interface LoadedMissions {
    missions: Mission[];
    corrupted: boolean;
}

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toDate(value: unknown): Date | null {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
    }

    if (typeof value !== 'string' || value.trim() === '') return null;

    const parsed = DateHelpers.fromISOString(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toPositiveInteger(value: unknown): number | null {
    const parsed = typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : value;

    if (typeof parsed !== 'number' || !Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

/**
 * Normalizes a mission loaded from storage. Throws when the stored payload is
 * structurally invalid so callers can protect the original data.
 */
function normalizeMission(value: UnknownRecord): Mission {
    if (!Array.isArray(value.periodos)) {
        throw new Error('Mission has no valid period list');
    }

    // Legacy missions had the individual registration at mission level.
    // They are migrated to the per-period flag on load.
    const legacyMeuGrupo = typeof value.meuGrupo === 'string' ? value.meuGrupo : null;
    const legacyRegistrar =
        Boolean(value.registrarEmMinhasMissoes) && legacyMeuGrupo !== null;

    const {
        meuGrupo: _legacyMeuGrupo,
        registrarEmMinhasMissoes: _legacyRegistrar,
        ...missionData
    } = value;

    const periodos = value.periodos.map((rawPeriod, index): Period => {
        if (!isRecord(rawPeriod)) {
            throw new Error(`Invalid mission period at index ${index}`);
        }

        const dataInicio = toDate(rawPeriod.dataInicio);
        const dataFim = toDate(rawPeriod.dataFim);
        const quantidadeMilitares = toPositiveInteger(rawPeriod.quantidadeMilitares);

        if (!dataInicio || !dataFim || quantidadeMilitares === null) {
            throw new Error(`Invalid mission period at index ${index}`);
        }

        if (DateHelpers.differenceInDays(dataFim, dataInicio) < 0) {
            throw new Error(`Invalid mission period range at index ${index}`);
        }

        const id = typeof rawPeriod.id === 'string' && rawPeriod.id.length > 0
            ? rawPeriod.id
            : createId();

        return {
            ...rawPeriod,
            id,
            dataInicio,
            dataFim,
            quantidadeMilitares,
            contarUltimoDiaInteiro: Boolean(rawPeriod.contarUltimoDiaInteiro),
            registrarEmMinhasMissoes:
                typeof rawPeriod.registrarEmMinhasMissoes === 'boolean'
                    ? rawPeriod.registrarEmMinhasMissoes
                    : legacyRegistrar && rawPeriod.grupo === legacyMeuGrupo,
        } as unknown as Period;
    });

    return {
        ...missionData,
        periodos,
    } as unknown as Mission;
}

async function readMissions(): Promise<LoadedMissions> {
    let raw: string | null;

    try {
        raw = await AsyncStorage.getItem(MISSIONS_KEY);
    } catch (error) {
        console.error('Error reading missions:', error);
        return { missions: [], corrupted: true };
    }

    if (!raw) {
        return { missions: [], corrupted: false };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (error) {
        console.error('Corrupted missions JSON:', error);
        return { missions: [], corrupted: true };
    }

    if (!Array.isArray(parsed)) {
        console.error('Corrupted missions payload: expected an array');
        return { missions: [], corrupted: true };
    }

    try {
        return {
            missions: parsed.map(item => {
                if (!isRecord(item)) {
                    throw new Error('Invalid mission record');
                }
                return normalizeMission(item);
            }),
            corrupted: false,
        };
    } catch (error) {
        console.error('Corrupted missions payload:', error);
        return { missions: [], corrupted: true };
    }
}

/**
 * Loads all missions with a flag indicating whether the stored payload could
 * be read. Callers can avoid replacing the in-memory list on corruption.
 */
export async function loadMissionsWithStatus(): Promise<LoadedMissions> {
    return readMissions();
}

/**
 * Load all missions from AsyncStorage.
 */
export async function loadMissions(): Promise<Mission[]> {
    const result = await readMissions();
    return result.missions;
}

async function writeMissions(missions: Mission[]): Promise<boolean> {
    try {
        await AsyncStorage.setItem(
            MISSIONS_KEY,
            JSON.stringify(missions.map(serializeMissionDates))
        );
        return true;
    } catch (error) {
        console.error('Error saving missions:', error);
        return false;
    }
}

/**
 * Save the whole mission list. Used by migrations and bulk updates.
 * Refuses to overwrite a payload that could not be read.
 */
export async function saveMissions(missions: Mission[]): Promise<boolean> {
    const current = await readMissions();

    if (current.corrupted) {
        console.error('Refusing to overwrite corrupted mission storage');
        return false;
    }

    return writeMissions(missions);
}

/**
 * Save or update a mission in AsyncStorage
 */
export async function saveMission(mission: Mission): Promise<boolean> {
    const current = await readMissions();

    if (current.corrupted) {
        console.error('Refusing to overwrite corrupted mission storage');
        return false;
    }

    const missions = current.missions;
    const existingIndex = missions.findIndex(m => m.id === mission.id);

    if (existingIndex > -1) {
        missions[existingIndex] = mission;
    } else {
        missions.push(mission);
    }

    return writeMissions(missions);
}

/**
 * Delete a mission from AsyncStorage
 */
export async function deleteMission(id: string): Promise<boolean> {
    const current = await readMissions();

    if (current.corrupted) {
        console.error('Refusing to overwrite corrupted mission storage');
        return false;
    }

    return writeMissions(current.missions.filter(m => m.id !== id));
}

/**
 * Clear all missions from AsyncStorage
 */
export async function clearAllMissions(): Promise<boolean> {
    try {
        await AsyncStorage.removeItem(MISSIONS_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing missions:', error);
        return false;
    }
}
