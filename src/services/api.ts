// API service for loading Cadrimil data
import { CadrimilData } from '../types';
import { isCadrimilData } from '../utils/validation';

const API_URL = 'https://apps.mabesi.dev/cadrimil/api.json';
const REQUEST_TIMEOUT_MS = 10000;

export class CadrimilApiError extends Error {
    readonly retryable: boolean;

    constructor(message: string, retryable: boolean) {
        super(message);
        this.name = 'CadrimilApiError';
        this.retryable = retryable;
    }
}

function isRetryableStatus(status: number): boolean {
    return status >= 500 || status === 408 || status === 429;
}

/**
 * Load Cadrimil data from the API.
 */
export async function loadCadrimilData(): Promise<CadrimilData> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let payload: unknown;

    try {
        const response = await fetch(API_URL, {
            signal: controller.signal,
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new CadrimilApiError(
                `Erro HTTP ${response.status} ao carregar dados da API.`,
                isRetryableStatus(response.status)
            );
        }

        payload = await response.json();
    } catch (error) {
        if (controller.signal.aborted) {
            throw new CadrimilApiError(
                'Tempo limite ao carregar os dados da API. Verifique sua conexão.',
                true
            );
        }

        if (error instanceof CadrimilApiError) {
            throw error;
        }

        if (error instanceof SyntaxError) {
            console.error('Invalid JSON received from API:', error);
            throw new CadrimilApiError('A API retornou uma resposta inválida.', false);
        }

        console.error('Error loading Cadrimil data:', error);
        throw new CadrimilApiError(
            'Erro ao carregar dados da API. Verifique sua conexão.',
            true
        );
    } finally {
        clearTimeout(timeoutId);
    }

    if (!isCadrimilData(payload)) {
        console.error('Invalid Cadrimil data received from API:', payload);
        throw new CadrimilApiError('A API retornou dados em formato inválido.', false);
    }

    return payload;
}

/**
 * Load Cadrimil data with retry logic for transient failures.
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

            if (error instanceof CadrimilApiError && !error.retryable) {
                throw error;
            }

            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
            }
        }
    }

    throw lastError || new CadrimilApiError(
        'Erro ao carregar dados da API após várias tentativas.',
        false
    );
}
