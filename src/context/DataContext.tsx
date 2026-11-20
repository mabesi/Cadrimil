// Data Context for managing Cadrimil API data
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CadrimilData } from '../types';
import { loadCadrimilDataWithRetry } from '../services/api';

interface DataContextType {
    cadrimilData: CadrimilData | null;
    loading: boolean;
    error: string | null;
    reloadData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [cadrimilData, setCadrimilData] = useState<CadrimilData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await loadCadrimilDataWithRetry();
            setCadrimilData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const reloadData = async () => {
        await loadData();
    };

    return (
        <DataContext.Provider value={{ cadrimilData, loading, error, reloadData }}>
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
