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

        // Convert date strings back to Date objects
        return missions.map(mission => ({
            ...mission,
            periodos: mission.periodos.map(p => ({
                ...p,
                dataInicio: typeof p.dataInicio === 'string'
                    ? DateHelpers.fromISOString(p.dataInicio as unknown as string)
                    : p.dataInicio,
                dataFim: typeof p.dataFim === 'string'
                    ? DateHelpers.fromISOString(p.dataFim as unknown as string)
                    : p.dataFim,
            })),
        }));
    } catch (error) {
        console.error('Error loading missions:', error);
        return [];
    }
}

/**
 * Save or update a mission in AsyncStorage
 */
export async function saveMission(mission: Mission): Promise<boolean> {
    try {
        const missions = await loadMissions();
        const existingIndex = missions.findIndex(m => m.id === mission.id);

        // Convert Date objects to ISO strings for storage
        const missionToSave = {
            ...mission,
            periodos: mission.periodos.map(p => ({
                ...p,
                dataInicio: DateHelpers.toISOString(p.dataInicio) as unknown as Date,
                dataFim: DateHelpers.toISOString(p.dataFim) as unknown as Date,
            })),
        };

        if (existingIndex > -1) {
            missions[existingIndex] = missionToSave;
        } else {
            missions.push(missionToSave);
        }

        await AsyncStorage.setItem(MISSIONS_KEY, JSON.stringify(missions));
        return true;
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
        const filteredMissions = missions.filter(m => m.id !== id);
        await AsyncStorage.setItem(MISSIONS_KEY, JSON.stringify(filteredMissions));
        return true;
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
