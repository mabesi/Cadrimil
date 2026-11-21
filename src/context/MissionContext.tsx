// Mission Context for managing missions and periods
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Mission, Period, MissionState } from '../types';
import { loadMissionsWithStatus, saveMission as saveMissionToStorage, saveMissions, deleteMission as deleteMissionFromStorage } from '../services/storage';
import { useData } from './DataContext';
import { calculateTotal, getValorDiaria } from '../utils/calculations';
import { DateHelpers } from '../utils/dateHelpers';
import { createId } from '../utils/id';
import { Alert } from 'react-native';

interface MissionContextType {
    currentMissionState: MissionState;
    currentPeriods: Period[];
    savedMissions: Mission[];
    incluirAED: boolean;
    valorTotal: number;
    calculatorRevision: number;
    addPeriod: (period: Omit<Period, 'id'>) => void;
    updatePeriod: (period: Period) => void;
    removePeriod: (id: string) => void;
    saveMission: (nomeMissao: string) => Promise<boolean>;
    editMission: (id: string) => void;
    deleteMission: (id: string) => Promise<void>;
    resetCalculator: () => void;
    setIncluirAED: (value: boolean) => void;
    loadSavedMissions: (migrateSnapshots?: boolean) => Promise<void>;
    importMission: (mission: Mission) => Promise<boolean>;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

function coerceDate(value: Date | string): Date {
    return typeof value === 'string' ? DateHelpers.fromISOString(value) : value;
}

export function MissionProvider({ children }: { children: ReactNode }) {
    const { cadrimilData, dataSource, isRefreshing } = useData();
    const [currentMissionState, setCurrentMissionState] = useState<MissionState>({
        id: null,
        nomeMissao: '',
        dataCriacao: null,
        aedValue: null,
        tabelaMeta: null,
    });
    const [currentPeriods, setCurrentPeriods] = useState<Period[]>([]);
    const [savedMissions, setSavedMissions] = useState<Mission[]>([]);
    const [incluirAED, setIncluirAED] = useState<boolean>(false);
    const [valorTotal, setValorTotal] = useState<number>(0);
    const [calculatorRevision, setCalculatorRevision] = useState<number>(0);

    // Load saved missions immediately, but only freeze legacy snapshots after
    // the data refresh finishes, so we use the most recent table available.
    useEffect(() => {
        loadSavedMissions(false);
    }, []);

    useEffect(() => {
        if (!isRefreshing) {
            loadSavedMissions(true);
        }
    }, [isRefreshing, dataSource]);

    // Recalculate total whenever periods or AED changes
    useEffect(() => {
        const aedValue = currentMissionState.aedValue ?? cadrimilData.aed.value;
        const total = calculateTotal(currentPeriods, incluirAED, cadrimilData, aedValue);
        setValorTotal(total);
    }, [currentPeriods, incluirAED, cadrimilData, currentMissionState.aedValue]);

    const loadSavedMissions = async (migrateSnapshots: boolean = true) => {
        const result = await loadMissionsWithStatus();

        if (result.corrupted) {
            // Never replace the in-memory list when the stored payload could
            // not be read. Writes are also blocked by the storage service.
            console.error('Saved missions could not be read; keeping current list.');
            return;
        }

        const missions = result.missions;
        const shouldMigrate = migrateSnapshots && !isRefreshing;

        if (!shouldMigrate) {
            setSavedMissions(missions.sort((a, b) =>
                new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
            ));
            return;
        }

        let changed = false;

        const normalized = missions.map(mission => {
            let missionChanged = false;

            const periodos = mission.periodos.map(period => {
                if (typeof period.valorUnitario === 'number') return period;

                missionChanged = true;
                return {
                    ...period,
                    valorUnitario: getValorDiaria(
                        period.grupo,
                        period.localidade,
                        cadrimilData
                    ),
                };
            });

            const aedValue = typeof mission.aedValue === 'number'
                ? mission.aedValue
                : cadrimilData.aed.value;
            if (aedValue !== mission.aedValue) missionChanged = true;

            const tabelaMeta = mission.tabelaMeta ?? cadrimilData.meta;
            if (tabelaMeta !== mission.tabelaMeta) missionChanged = true;

            if (!missionChanged) return mission;

            changed = true;
            return {
                ...mission,
                periodos,
                aedValue,
                tabelaMeta,
                valorTotal: calculateTotal(
                    periodos,
                    mission.incluirAED,
                    cadrimilData,
                    aedValue
                ),
            };
        });

        if (changed) {
            await saveMissions(normalized);
        }

        setSavedMissions(normalized.sort((a, b) =>
            new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
        ));
    };

    const addPeriod = (period: Omit<Period, 'id'>) => {
        const newPeriod: Period = {
            ...period,
            id: createId(),
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
        if (!cadrimilData) {
            Alert.alert('Erro', 'Dados não carregados');
            return false;
        }

        if (currentPeriods.length === 0) {
            Alert.alert('Atenção', 'Adicione pelo menos um período para salvar a missão.');
            return false;
        }

        const aedValue = currentMissionState.aedValue ?? cadrimilData.aed.value;
        const missionId = currentMissionState.id || createId();
        // Editing a mission must keep its original creation date.
        const dataCriacao = currentMissionState.id
            ? currentMissionState.dataCriacao ?? new Date().toISOString()
            : new Date().toISOString();
        const mission: Mission = {
            id: missionId,
            nomeMissao: nomeMissao || 'Missão Sem Título',
            dataCriacao,
            periodos: currentPeriods,
            incluirAED,
            aedValue,
            tabelaMeta: currentMissionState.tabelaMeta ?? cadrimilData.meta,
            valorTotal: calculateTotal(
                currentPeriods,
                incluirAED,
                cadrimilData,
                aedValue
            ),
            decretosReferencia: cadrimilData.decretos.map(d => ({
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
            Alert.alert('Erro', 'Erro ao salvar a missão localmente. Os dados existentes não foram alterados.');
            return false;
        }
    };

    const editMission = (id: string) => {
        const mission = savedMissions.find(m => m.id === id);
        if (!mission) {
            Alert.alert('Erro', 'Missão não encontrada para edição.');
            return;
        }

        const periodos = mission.periodos.map(period => ({
            ...period,
            valorUnitario: typeof period.valorUnitario === 'number'
                ? period.valorUnitario
                : getValorDiaria(period.grupo, period.localidade, cadrimilData),
            registrarEmMinhasMissoes: Boolean(period.registrarEmMinhasMissoes),
        }));

        setCurrentMissionState({
            id: mission.id,
            nomeMissao: mission.nomeMissao,
            dataCriacao: typeof mission.dataCriacao === 'string'
                ? mission.dataCriacao
                : null,
            aedValue: typeof mission.aedValue === 'number'
                ? mission.aedValue
                : cadrimilData.aed.value,
            tabelaMeta: mission.tabelaMeta ?? cadrimilData.meta,
        });
        setCurrentPeriods(periodos);
        setIncluirAED(mission.incluirAED);
        setCalculatorRevision(prev => prev + 1);
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
        setCurrentMissionState({
            id: null,
            nomeMissao: '',
            dataCriacao: null,
            aedValue: null,
            tabelaMeta: null,
        });
        setCurrentPeriods([]);
        setIncluirAED(false);
        setValorTotal(0);
        setCalculatorRevision(prev => prev + 1);
    };

    const loadMissionFromObject = (mission: Mission) => {
        type LegacyMission = Mission & {
            meuGrupo?: string | null;
            registrarEmMinhasMissoes?: boolean;
        };
        const legacyMission: LegacyMission = mission;
        const legacyMeuGrupo = legacyMission.meuGrupo ?? null;
        const legacyRegistrar =
            Boolean(legacyMission.registrarEmMinhasMissoes) &&
            legacyMeuGrupo !== null;

        setCurrentMissionState({
            id: null, // New ID will be generated on save, or keep it if we want to overwrite? Let's treat import as new/unsaved initially or keep ID?
            // User request: "import a mission". Usually implies loading data.
            // Let's clear ID to treat as a new copy unless saved.
            nomeMissao: mission.nomeMissao,
            dataCriacao: null,
            aedValue: typeof mission.aedValue === 'number'
                ? mission.aedValue
                : cadrimilData.aed.value,
            tabelaMeta: mission.tabelaMeta ?? cadrimilData.meta,
        });
        const parsedPeriods = mission.periodos.map(p => ({
            ...p,
            registrarEmMinhasMissoes:
                typeof p.registrarEmMinhasMissoes === 'boolean'
                    ? p.registrarEmMinhasMissoes
                    : legacyRegistrar && p.grupo === legacyMeuGrupo,
            valorUnitario: typeof p.valorUnitario === 'number'
                ? p.valorUnitario
                : getValorDiaria(p.grupo, p.localidade, cadrimilData),
            dataInicio: coerceDate(p.dataInicio),
            dataFim: coerceDate(p.dataFim),
        }));
        setCurrentPeriods(parsedPeriods);
        setIncluirAED(mission.incluirAED);
        setCalculatorRevision(prev => prev + 1);
        // valorTotal will be recalculated by useEffect
    };

    const importMission = (mission: Mission): Promise<boolean> => {
        const hasCurrentWork =
            currentPeriods.length > 0 ||
            currentMissionState.id !== null ||
            currentMissionState.nomeMissao.trim().length > 0;

        if (!hasCurrentWork) {
            loadMissionFromObject(mission);
            return Promise.resolve(true);
        }

        return new Promise(resolve => {
            let settled = false;
            const finish = (value: boolean) => {
                if (!settled) {
                    settled = true;
                    resolve(value);
                }
            };

            Alert.alert(
                'Substituir cálculo atual?',
                'A missão importada substituirá os dados do cálculo em andamento.',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                        onPress: () => finish(false),
                    },
                    {
                        text: 'Importar',
                        style: 'destructive',
                        onPress: () => {
                            loadMissionFromObject(mission);
                            finish(true);
                        },
                    },
                ],
                {
                    cancelable: true,
                    onDismiss: () => finish(false),
                }
            );
        });
    };

    return (
        <MissionContext.Provider
            value={{
                currentMissionState,
                currentPeriods,
                savedMissions,
                incluirAED,
                valorTotal,
                calculatorRevision,
                addPeriod,
                updatePeriod,
                removePeriod,
                saveMission,
                editMission,
                deleteMission,
                resetCalculator,
                setIncluirAED,
                loadSavedMissions,
                importMission,
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
