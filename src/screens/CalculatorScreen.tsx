// Calculator Screen
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useData } from '../context/DataContext';
import { useMission } from '../context/MissionContext';
import { CustomInput } from '../components/CustomInput';
import { CustomSelect } from '../components/CustomSelect';
import { CustomButton } from '../components/CustomButton';
import { CustomCheckbox } from '../components/CustomCheckbox';
import { PeriodCard } from '../components/PeriodCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Colors } from '../constants/colors';
import { GlobalStyles } from '../constants/styles';
import { exportPDF } from '../utils/pdfGenerator';
import { DateHelpers } from '../utils/dateHelpers';

export function CalculatorScreen() {
    const { cadrmilData, loading } = useData();
    const {
        currentMissionState,
        currentPeriods,
        incluirAED,
        valorTotal,
        addPeriod,
        removePeriod,
        saveMission,
        setIncluirAED,
    } = useMission();

    const [nomeMissao, setNomeMissao] = useState(currentMissionState.nomeMissao);
    const [localidade, setLocalidade] = useState('');
    const [grupo, setGrupo] = useState('');
    const [quantidade, setQuantidade] = useState('1');
    const [dataInicio, setDataInicio] = useState(new Date());
    const [dataFim, setDataFim] = useState(new Date());
    const [contarInteiro, setContarInteiro] = useState(false);
    const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
    const [showDatePickerFim, setShowDatePickerFim] = useState(false);

    if (loading || !cadrmilData) {
        return <LoadingSpinner message="Carregando dados..." />;
    }

    const localidadeOptions = Object.keys(cadrmilData.localidades).map(key => ({
        label: cadrmilData.localidades[key],
        value: key,
    }));

    const grupoOptions = Object.keys(cadrmilData.grupos).map(key => ({
        label: `${key} - ${cadrmilData.grupos[key].substring(0, 30)}...`,
        value: key,
    }));

    const handleAddPeriod = () => {
        if (!grupo || !localidade || !quantidade || parseInt(quantidade) <= 0) {
            Alert.alert('Atenção', 'Por favor, preencha todos os campos corretamente.');
            return;
        }

        if (DateHelpers.differenceInDays(dataFim, dataInicio) < 0) {
            Alert.alert('Atenção', 'A data final deve ser igual ou posterior à data inicial.');
            return;
        }

        addPeriod({
            grupo,
            localidade,
            dataInicio,
            dataFim,
            quantidadeMilitares: parseInt(quantidade),
            contarUltimoDiaInteiro: contarInteiro,
        });

        // Reset form
        setQuantidade('1');
        setContarInteiro(false);
    };

    const handleSaveMission = async () => {
        await saveMission(nomeMissao);
    };

    const handleGeneratePDF = async () => {
        if (currentPeriods.length === 0) {
            Alert.alert('Atenção', 'Adicione pelo menos um período para gerar o PDF.');
            return;
        }

        try {
            const mission = {
                id: currentMissionState.id || Date.now().toString(),
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

            await exportPDF(mission, cadrmilData);
            Alert.alert('Sucesso', 'PDF gerado com sucesso!');
        } catch (error) {
            Alert.alert('Erro', 'Erro ao gerar PDF');
        }
    };

    return (
        <ScrollView style={GlobalStyles.container}>
            <View style={styles.content}>
                {/* Nome da Missão */}
                <CustomInput
                    label="Nome da Missão (Local)"
                    value={nomeMissao}
                    onChangeText={setNomeMissao}
                    placeholder="Ex: Missão Sudeste"
                />

                {/* Formulário de Adição de Período */}
                <View style={[GlobalStyles.card, styles.formCard]}>
                    <Text style={styles.sectionTitle}>Adicionar Período/Localidade</Text>

                    <CustomSelect
                        label="Localidade"
                        value={localidade}
                        onValueChange={setLocalidade}
                        items={localidadeOptions}
                        placeholder="Selecione a localidade"
                    />

                    <View style={styles.row}>
                        <View style={styles.grupoField}>
                            <CustomSelect
                                label="Grupo"
                                value={grupo}
                                onValueChange={setGrupo}
                                items={grupoOptions}
                                placeholder="Selecione o grupo"
                            />
                        </View>
                        <View style={styles.qtdField}>
                            <CustomInput
                                label="QTD"
                                value={quantidade}
                                onChangeText={setQuantidade}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfWidth}>
                            <Text style={styles.label}>Início</Text>
                            <CustomButton
                                title={DateHelpers.format(dataInicio, 'dd/MM/yyyy')}
                                onPress={() => setShowDatePickerInicio(true)}
                                variant="secondary"
                            />
                        </View>
                        <View style={styles.halfWidth}>
                            <Text style={styles.label}>Fim</Text>
                            <CustomButton
                                title={DateHelpers.format(dataFim, 'dd/MM/yyyy')}
                                onPress={() => setShowDatePickerFim(true)}
                                variant="secondary"
                            />
                        </View>
                    </View>

                    {showDatePickerInicio && (
                        <DateTimePicker
                            value={dataInicio}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                setShowDatePickerInicio(Platform.OS === 'ios');
                                if (selectedDate) setDataInicio(selectedDate);
                            }}
                        />
                    )}

                    {showDatePickerFim && (
                        <DateTimePicker
                            value={dataFim}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                setShowDatePickerFim(Platform.OS === 'ios');
                                if (selectedDate) setDataFim(selectedDate);
                            }}
                        />
                    )}

                    <CustomCheckbox
                        label="Contar Último Dia como Diária Inteira (1.0)"
                        value={contarInteiro}
                        onValueChange={setContarInteiro}
                    />

                    <CustomButton
                        title="ADICIONAR PERÍODO"
                        onPress={handleAddPeriod}
                        variant="primary"
                    />
                </View>

                {/* Resumo da Missão */}
                <Text style={styles.sectionTitle}>Resumo da Missão</Text>
                {currentPeriods.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum período adicionado.</Text>
                ) : (
                    currentPeriods.map(period => (
                        <PeriodCard
                            key={period.id}
                            period={period}
                            onRemove={() => removePeriod(period.id)}
                        />
                    ))
                )}

                {/* Opções Adicionais */}
                <View style={GlobalStyles.cardSecondary}>
                    <Text style={styles.sectionTitle}>Opções Adicionais</Text>
                    <CustomCheckbox
                        label="Incluir Adicional de Embarque e Desembarque"
                        value={incluirAED}
                        onValueChange={setIncluirAED}
                    />
                    <Text style={styles.aedText}>
                        Valor do AED: R$ {cadrmilData.aed.value.toFixed(2).replace('.', ',')} / militar
                    </Text>
                </View>

                {/* Resultado Total */}
                <View style={styles.resultBox}>
                    <Text style={styles.resultLabel}>VALOR TOTAL CALCULADO</Text>
                    <Text style={styles.resultValue}>
                        R$ {valorTotal.toFixed(2).replace('.', ',')}
                    </Text>
                </View>

                {/* Ações */}
                <View style={styles.actions}>
                    <CustomButton
                        title="Salvar Missão (Local)"
                        onPress={handleSaveMission}
                        variant="warning"
                        style={styles.actionButton}
                    />
                    <CustomButton
                        title="Gerar Relatório PDF"
                        onPress={handleGeneratePDF}
                        variant="success"
                        style={styles.actionButton}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 20,
    },
    formCard: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingBottom: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    grupoField: {
        flex: 0.78,
        marginRight: 12,
    },
    qtdField: {
        flex: 0.22,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.textMuted,
        fontStyle: 'italic',
        paddingVertical: 16,
    },
    aedText: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 4,
    },
    resultBox: {
        backgroundColor: Colors.resultBackground,
        borderWidth: 2,
        borderColor: Colors.resultBorder,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginVertical: 20,
    },
    resultLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    resultValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.success,
        marginTop: 8,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
    },
});
