// Missions Screen
import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMission } from '../context/MissionContext';
import { MissionCard } from '../components/MissionCard';
import { MyMissionCard } from '../components/MyMissionCard';
import { CustomButton } from '../components/CustomButton';
import { Colors } from '../constants/colors';
import { GlobalStyles } from '../constants/styles';

export function MissionsScreen() {
    const navigation = useNavigation();
    const { savedMissions, editMission, deleteMission, resetCalculator, loadSavedMissions } = useMission();

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

    const myMissions = savedMissions.filter(
        mission => mission.registrarEmMinhasMissoes && mission.meuGrupo !== null
    );

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
                            <Text style={styles.sectionTitle}>Minhas Missões</Text>
                            <Text style={styles.sectionSubtitle}>
                                Valores individuais das missões em que você participou.
                            </Text>

                            {myMissions.length === 0 ? (
                                <Text style={styles.emptyText}>
                                    Nenhuma missão registrada em Minhas Missões ainda. Marque a
                                    opção "Registrar em Minhas Missões" ao salvar uma missão.
                                </Text>
                            ) : (
                                myMissions.map(mission => (
                                    <MyMissionCard key={mission.id} mission={mission} />
                                ))
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
    emptyText: {
        textAlign: 'center',
        color: Colors.textMuted,
        fontStyle: 'italic',
        paddingVertical: 24,
    },
});
