// Mission Context for managing missions and periods
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Mission, Period, MissionState } from '../types';
import { loadMissions, saveMission as saveMissionToStorage, deleteMission as deleteMissionFromStorage } from '../services/storage';
import { useData } from './DataContext';
import { calculateTotal } from '../utils/calculations';
import { DateHelpers } from '../utils/dateHelpers';
import { Alert } from 'react-native';

interface MissionContextType {
    currentMissionState: MissionState;
    currentPeriods: Period[];
    savedMissions: Mission[];
    incluirAED: boolean;
    valorTotal: number;
    addPeriod: (period: Omit<Period, 'id'>) => void;
    updatePeriod: (period: Period) => void;
    removePeriod: (id: string) => void;
    saveMission: (nomeMissao: string) => Promise<boolean>;
    editMission: (id: string) => void;
    deleteMission: (id: string) => Promise<void>;
    resetCalculator: () => void;
    setIncluirAED: (value: boolean) => void;
    loadSavedMissions: () => Promise<void>;
    loadMissionFromObject: (mission: Mission) => void;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export function MissionProvider({ children }: { children: ReactNode }) {
    const { cadrmilData } = useData();
    const [currentMissionState, setCurrentMissionState] = useState<MissionState>({
        id: null,
        nomeMissao: '',
    });
    const [currentPeriods, setCurrentPeriods] = useState<Period[]>([]);
    const [savedMissions, setSavedMissions] = useState<Mission[]>([]);
    const [incluirAED, setIncluirAED] = useState<boolean>(false);
    const [valorTotal, setValorTotal] = useState<number>(0);

    // Load saved missions on mount
    useEffect(() => {
        loadSavedMissions();
    }, []);

    // Recalculate total whenever periods or AED changes
    useEffect(() => {
        if (cadrmilData) {
            const total = calculateTotal(currentPeriods, incluirAED, cadrmilData);
            setValorTotal(total);
        }
    }, [currentPeriods, incluirAED, cadrmilData]);

    const loadSavedMissions = async () => {
        const missions = await loadMissions();
        setSavedMissions(missions.sort((a, b) =>
            new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
        ));
    };

    const addPeriod = (period: Omit<Period, 'id'>) => {
        const newPeriod: Period = {
            ...period,
            id: Date.now().toString(),
        };
        setCurrentPeriods([...currentPeriods, newPeriod]);
    };

    const updatePeriod = (period: Period) => {
        setCurrentPeriods(currentPeriods.map(p => p.id === period.id ? period : p));
    };

    const removePeriod = (id: string) => {
        setCurrentPeriods(currentPeriods.filter(p => p.id !== id));
    };

    const saveMission = async (nomeMissao: string): Promise<boolean> => {
        if (!cadrmilData) {
            Alert.alert('Erro', 'Dados não carregados');
            return false;
        }

        if (currentPeriods.length === 0) {
            Alert.alert('Atenção', 'Adicione pelo menos um período para salvar a missão.');
            return false;
        }

        const missionId = currentMissionState.id || Date.now().toString();
        const mission: Mission = {
            id: missionId,
            nomeMissao: nomeMissao || 'Missão Sem Título',
            dataCriacao: new Date().toISOString(),
            periodos: currentPeriods,
            incluirAED,
            valorTotal,
            decretosReferencia: cadrmilData.decretos.map(d => ({
                decree: d.decree,
                date: d.date,
            })),
        };

        const success = await saveMissionToStorage(mission);
        if (success) {
            const message = currentMissionState.id
                ? `Missão "${mission.nomeMissao}" atualizada com sucesso!`
                : `Nova missão "${mission.nomeMissao}" salva com sucesso!`;
            Alert.alert('Sucesso', message);
            await loadSavedMissions();
            resetCalculator();
            return true;
        } else {
            Alert.alert('Erro', 'Erro ao salvar a missão localmente.');
            return false;
        }
    };

    const editMission = (id: string) => {
        const mission = savedMissions.find(m => m.id === id);
        if (!mission) {
            Alert.alert('Erro', 'Missão não encontrada para edição.');
            return;
        }

        setCurrentMissionState({
            id: mission.id,
            nomeMissao: mission.nomeMissao,
        });
        setCurrentPeriods(mission.periodos);
        setIncluirAED(mission.incluirAED);
    };

    const deleteMission = async (id: string) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir esta missão?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteMissionFromStorage(id);
                        if (success) {
                            Alert.alert('Sucesso', 'Missão excluída com sucesso.');
                            await loadSavedMissions();
                        } else {
                            Alert.alert('Erro', 'Erro ao excluir a missão.');
                        }
                    },
                },
            ]
        );
    };

    const resetCalculator = () => {
        setCurrentMissionState({ id: null, nomeMissao: '' });
        setCurrentPeriods([]);
        setIncluirAED(false);
        setValorTotal(0);
    };

    const loadMissionFromObject = (mission: Mission) => {
        setCurrentMissionState({
            id: null, // New ID will be generated on save, or keep it if we want to overwrite? Let's treat import as new/unsaved initially or keep ID?
            // User request: "import a mission". Usually implies loading data.
            // Let's clear ID to treat as a new copy unless saved.
            nomeMissao: mission.nomeMissao,
        });
        const parsedPeriods = mission.periodos.map(p => ({
            ...p,
            dataInicio: typeof p.dataInicio === 'string' ? DateHelpers.fromISOString(p.dataInicio as unknown as string) : p.dataInicio,
            dataFim: typeof p.dataFim === 'string' ? DateHelpers.fromISOString(p.dataFim as unknown as string) : p.dataFim,
        }));
        setCurrentPeriods(parsedPeriods);
        setIncluirAED(mission.incluirAED);
        // valorTotal will be recalculated by useEffect
    };

    return (
        <MissionContext.Provider
            value={{
                currentMissionState,
                currentPeriods,
                savedMissions,
                incluirAED,
                valorTotal,
                addPeriod,
                updatePeriod,
                removePeriod,
                saveMission,
                editMission,
                deleteMission,
                resetCalculator,
                setIncluirAED,
                loadSavedMissions,
                loadMissionFromObject,
            }}
        >
            {children}
        </MissionContext.Provider>
    );
}

export function useMission() {
    const context = useContext(MissionContext);
    if (context === undefined) {
        throw new Error('useMission must be used within a MissionProvider');
    }
    return context;
}
