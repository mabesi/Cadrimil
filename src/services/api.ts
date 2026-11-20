// API service for loading Cadrimil data
import { CadrimilData } from '../types';
import { isCadrimilData } from '../utils/validation';

const API_URL = 'https://apps.mabesi.dev/cadrimil/api.json';

/**
 * Load Cadrimil data from the API
 */
export async function loadCadrimilData(): Promise<CadrimilData> {
    let payload: unknown;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        payload = await response.json();
    } catch (error) {
        console.error('Error loading Cadrimil data:', error);
        throw new Error('Erro ao carregar dados da API. Verifique sua conexão.');
    }

    if (!isCadrimilData(payload)) {
        console.error('Invalid Cadrimil data received from API:', payload);
        throw new Error('A API retornou dados em formato inválido.');
    }

    return payload;
}

/**
 * Load Cadrimil data with retry logic
 */
export async function loadCadrimilDataWithRetry(
    maxRetries: number = 3,
    retryDelay: number = 1000
): Promise<CadrimilData> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await loadCadrimilData();
        } catch (error) {
            lastError = error as Error;
            if (i < maxRetries - 1) {
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
            }
        }
    }

    throw lastError || new Error('Erro ao carregar dados da API após várias tentativas.');
}
