// Missions Screen
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMission } from '../context/MissionContext';
import { useData } from '../context/DataContext';
import { MissionCard } from '../components/MissionCard';
import { MyMissionCard } from '../components/MyMissionCard';
import { CustomButton } from '../components/CustomButton';
import { calculateIndividualMissionTotal } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { Colors } from '../constants/colors';
import { GlobalStyles } from '../constants/styles';

export function MissionsScreen() {
    const navigation = useNavigation();
    const { cadrimilData } = useData();
    const { savedMissions, editMission, deleteMission, resetCalculator, loadSavedMissions } = useMission();
    const [myMissionsExpanded, setMyMissionsExpanded] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadSavedMissions();
        });

        return unsubscribe;
    }, [navigation]);

    const handleEdit = (id: string) => {
        editMission(id);
        navigation.navigate('Cálculo' as never);
    };

    const handleReset = () => {
        resetCalculator();
        navigation.navigate('Cálculo' as never);
    };

    const myMissions = savedMissions.filter(mission =>
        mission.periodos.some(period => period.registrarEmMinhasMissoes)
    );

    const myMissionsTotal = myMissions.reduce((total, mission) => {
        return total + calculateIndividualMissionTotal(
            mission.periodos,
            mission.incluirAED,
            cadrimilData,
            mission.aedValue
        ).total;
    }, 0);

    return (
        <View style={GlobalStyles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
            >
                <Text style={styles.title}>Missões</Text>

                <CustomButton
                    title="Limpar Formulário de Cálculo"
                    onPress={handleReset}
                    variant="danger"
                    style={styles.resetButton}
                />

                {savedMissions.length === 0 ? (
                    <Text style={styles.emptyText}>
                        Nenhuma missão salva ainda. Use a aba "Cálculo" para salvar uma nova.
                    </Text>
                ) : (
                    <>
                        <View style={styles.section}>
                            <TouchableOpacity
                                style={styles.sectionToggle}
                                onPress={() => setMyMissionsExpanded(!myMissionsExpanded)}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityState={{ expanded: myMissionsExpanded }}
                            >
                                <View style={styles.sectionToggleText}>
                                    <Text style={styles.sectionTitle}>
                                        Minhas Missões ({myMissions.length})
                                    </Text>
                                    <Text
                                        style={[
                                            styles.sectionSubtitle,
                                            styles.sectionSubtitleToggle,
                                        ]}
                                    >
                                        Valores individuais das missões em que você participou.
                                    </Text>
                                </View>
                                <Text style={styles.sectionToggleIcon}>
                                    {myMissionsExpanded ? '▼' : '▶'}
                                </Text>
                            </TouchableOpacity>

                            {myMissionsExpanded && (
                                <View style={styles.sectionContent}>
                                    {myMissions.length === 0 ? (
                                        <Text style={styles.emptyText}>
                                            Nenhuma missão registrada em Minhas Missões ainda.
                                            Marque a opção "Registrar em Minhas Missões" ao
                                            salvar uma missão.
                                        </Text>
                                    ) : (
                                        <>
                                            {myMissions.map(mission => (
                                                <MyMissionCard
                                                    key={mission.id}
                                                    mission={mission}
                                                />
                                            ))}

                                            <View style={styles.myMissionsTotalBox}>
                                                <Text style={styles.myMissionsTotalLabel}>
                                                    Total recebido:
                                                </Text>
                                                <Text style={styles.myMissionsTotalValue}>
                                                    R$ {formatCurrency(myMissionsTotal)}
                                                </Text>
                                            </View>
                                        </>
                                    )}
                                </View>
                            )}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Todas as Missões</Text>
                            <Text style={styles.sectionSubtitle}>
                                Visão completa dos gastos com todos os grupos e militares.
                            </Text>

                            {savedMissions.map(mission => (
                                <MissionCard
                                    key={mission.id}
                                    mission={mission}
                                    onEdit={() => handleEdit(mission.id)}
                                    onDelete={() => deleteMission(mission.id)}
                                />
                            ))}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    },
    resetButton: {
        marginBottom: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    sectionToggleText: {
        flex: 1,
    },
    sectionToggleIcon: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    sectionContent: {
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: Colors.textLight,
        marginBottom: 12,
    },
    sectionSubtitleToggle: {
        marginBottom: 0,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.textMuted,
        fontStyle: 'italic',
        paddingVertical: 24,
    },
    myMissionsTotalBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.resultBackground,
        borderWidth: 1,
        borderColor: Colors.resultBorder,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 4,
    },
    myMissionsTotalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    myMissionsTotalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.primary,
    },
});
