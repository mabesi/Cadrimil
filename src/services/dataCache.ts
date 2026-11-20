// Local cache for the last valid Cadrimil API payload
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CadrimilData } from '../types';
import { isCadrimilData } from '../utils/validation';

const CACHE_KEY = 'cadrimil_data_cache_v1';

export interface CachedData {
    payload: CadrimilData;
    fetchedAt: string;
}

function isCachedData(value: unknown): value is CachedData {
    if (typeof value !== 'object' || value === null) return false;

    const record = value as Record<string, unknown>;

    return (
        typeof record.fetchedAt === 'string' &&
        !Number.isNaN(new Date(record.fetchedAt).getTime()) &&
        isCadrimilData(record.payload)
    );
}

export async function loadDataCache(): Promise<CachedData | null> {
    try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (!raw) return null;

        const parsed: unknown = JSON.parse(raw);
        if (!isCachedData(parsed)) {
            await AsyncStorage.removeItem(CACHE_KEY);
            return null;
        }

        return parsed;
    } catch (error) {
        console.warn('Error loading Cadrimil data cache:', error);
        return null;
    }
}

export async function saveDataCache(
    payload: CadrimilData,
    fetchedAt: string
): Promise<void> {
    try {
        const cached: CachedData = { payload, fetchedAt };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch (error) {
        console.warn('Error saving Cadrimil data cache:', error);
    }
}
