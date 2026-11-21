// Data Context for managing Cadrimil API data
import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { CadrimilData } from '../types';
import { loadCadrimilDataWithRetry } from '../services/api';
import { loadDataCache, saveDataCache } from '../services/dataCache';
import { isCadrimilData } from '../utils/validation';
import fallbackJson from '../../assets/data/cadrimil-fallback.json';

export type DataSource = 'network' | 'cache' | 'bundled';

interface DataContextType {
    cadrimilData: CadrimilData;
    error: string | null;
    dataSource: DataSource;
    fetchedAt: string | null;
    updatedAt: string;
    isRefreshing: boolean;
    reloadData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const bundledData = fallbackJson as CadrimilData;

if (!isCadrimilData(bundledData)) {
    throw new Error('JSON de fallback do Cadrimil inválido.');
}

function isAtLeastAsNew(candidate: string, reference: string | null): boolean {
    if (!reference) return true;

    const candidateTime = new Date(candidate).getTime();
    const referenceTime = new Date(reference).getTime();

    if (Number.isNaN(candidateTime)) return false;
    if (Number.isNaN(referenceTime)) return true;

    return candidateTime >= referenceTime;
}

export function DataProvider({ children }: { children: ReactNode }) {
    const [cadrimilData, setCadrimilData] = useState<CadrimilData>(bundledData);
    const [dataSource, setDataSource] = useState<DataSource>('bundled');
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string>(bundledData.meta.updatedAt);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(true);

    const reloadData = useCallback(async () => {
        setIsRefreshing(true);
        setError(null);

        try {
            const freshData = await loadCadrimilDataWithRetry();
            const now = new Date().toISOString();

            setCadrimilData(freshData);
            setDataSource('network');
            setFetchedAt(now);
            setUpdatedAt(freshData.meta.updatedAt);
            await saveDataCache(freshData, now);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Erro ao carregar dados da API.'
            );
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const bootstrap = async () => {
            const cached = await loadDataCache();

            if (!cancelled && cached) {
                const cachedDate = cached.payload.meta.updatedAt;
                const bundledDate = bundledData.meta.updatedAt;

                if (isAtLeastAsNew(cachedDate, bundledDate)) {
                    setCadrimilData(cached.payload);
                    setDataSource('cache');
                    setFetchedAt(cached.fetchedAt);
                    setUpdatedAt(cached.payload.meta.updatedAt);
                }
            }

            if (!cancelled) {
                await reloadData();
            }
        };

        bootstrap();

        return () => {
            cancelled = true;
        };
    }, [reloadData]);

    return (
        <DataContext.Provider
            value={{
                cadrimilData,
                error,
                dataSource,
                fetchedAt,
                updatedAt,
                isRefreshing,
                reloadData,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
