// Storage service using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mission, Period } from '../types';
import { DateHelpers } from '../utils/dateHelpers';

const MISSIONS_KEY = 'cadrimil_missions';

/**
 * Load all missions from AsyncStorage
 */
export async function loadMissions(): Promise<Mission[]> {
    try {
        const missionsJson = await AsyncStorage.getItem(MISSIONS_KEY);
        if (!missionsJson) {
            return [];
        }

        const missions: Mission[] = JSON.parse(missionsJson);

        // Convert date strings back to Date objects and normalize
        // fields added after the first released version.
        return missions.map(mission => {
            const meuGrupo = mission.meuGrupo ?? null;

            return {
                ...mission,
                meuGrupo,
                registrarEmMinhasMissoes:
                    Boolean(mission.registrarEmMinhasMissoes) && meuGrupo !== null,
                periodos: mission.periodos.map(p => ({
                    ...p,
                    dataInicio: typeof p.dataInicio === 'string'
                        ? DateHelpers.fromISOString(p.dataInicio as unknown as string)
                        : p.dataInicio,
                    dataFim: typeof p.dataFim === 'string'
                        ? DateHelpers.fromISOString(p.dataFim as unknown as string)
                        : p.dataFim,
                })),
            };
        });
    } catch (error) {
        console.error('Error loading missions:', error);
        return [];
    }
}

/**
 * Convert Date objects to ISO strings before storing.
 */
function serializeMission(mission: Mission) {
    return {
        ...mission,
        periodos: mission.periodos.map(p => ({
            ...p,
            dataInicio: DateHelpers.toISOString(p.dataInicio) as unknown as Date,
            dataFim: DateHelpers.toISOString(p.dataFim) as unknown as Date,
        })),
    };
}

/**
 * Save the whole mission list. Used by migrations and bulk updates.
 */
export async function saveMissions(missions: Mission[]): Promise<boolean> {
    try {
        await AsyncStorage.setItem(
            MISSIONS_KEY,
            JSON.stringify(missions.map(serializeMission))
        );
        return true;
    } catch (error) {
        console.error('Error saving missions:', error);
        return false;
    }
}

/**
 * Save or update a mission in AsyncStorage
 */
export async function saveMission(mission: Mission): Promise<boolean> {
    try {
        const missions = await loadMissions();
        const existingIndex = missions.findIndex(m => m.id === mission.id);

        if (existingIndex > -1) {
            missions[existingIndex] = mission;
        } else {
            missions.push(mission);
        }

        return await saveMissions(missions);
    } catch (error) {
        console.error('Error saving mission:', error);
        return false;
    }
}

/**
 * Delete a mission from AsyncStorage
 */
export async function deleteMission(id: string): Promise<boolean> {
    try {
        const missions = await loadMissions();
        return await saveMissions(missions.filter(m => m.id !== id));
    } catch (error) {
        console.error('Error deleting mission:', error);
        return false;
    }
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
