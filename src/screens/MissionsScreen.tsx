// Missions Screen
import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMission } from '../context/MissionContext';
import { MissionCard } from '../components/MissionCard';
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
        Alert.alert(
            'Confirmar',
            'Deseja limpar o formulário de cálculo?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpar',
                    onPress: () => {
                        resetCalculator();
                        Alert.alert('Sucesso', 'Formulário de Cálculo Limpo. Pronto para uma nova missão.');
                    },
                },
            ]
        );
    };

    return (
        <View style={GlobalStyles.container}>
            <ScrollView style={styles.content}>
                <Text style={styles.title}>Missões Salvas</Text>

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
                    savedMissions.map(mission => (
                        <MissionCard
                            key={mission.id}
                            mission={mission}
                            onEdit={() => handleEdit(mission.id)}
                            onDelete={() => deleteMission(mission.id)}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 20,
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
    emptyText: {
        textAlign: 'center',
        color: Colors.textMuted,
        fontStyle: 'italic',
        paddingVertical: 32,
    },
});
