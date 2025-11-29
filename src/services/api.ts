// API service for loading Cadrimil data
import { CadrmilData } from '../types';

const API_URL = 'https://apps.mabesi.dev/cadrimil/api.json';

/**
 * Load Cadrimil data from the API
 */
export async function loadCadrmilData(): Promise<CadrmilData> {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CadrmilData = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading Cadrimil data:', error);
        throw new Error('Erro ao carregar dados da API. Verifique sua conexão.');
    }
}

/**
 * Load Cadrimil data with retry logic
 */
export async function loadCadrmilDataWithRetry(
    maxRetries: number = 3,
    retryDelay: number = 1000
): Promise<CadrmilData> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await loadCadrmilData();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries - 1) {
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
            }
        }
    }

    throw lastError || new Error('Failed to load data after retries');
}
