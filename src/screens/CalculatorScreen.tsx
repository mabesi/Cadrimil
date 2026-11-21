// Calculator Screen
import React, { useState, useLayoutEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    Platform,
    TouchableOpacity,
    type ScrollViewInstance,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
// @ts-ignore
import * as FileSystem from 'expo-file-system/legacy';
import { useData } from '../context/DataContext';
import { useMission } from '../context/MissionContext';
import { CustomInput } from '../components/CustomInput';
import { CustomSelect } from '../components/CustomSelect';
import { CustomButton } from '../components/CustomButton';
import { CustomCheckbox } from '../components/CustomCheckbox';
import { PeriodCard } from '../components/PeriodCard';
import { DataStatusBanner } from '../components/DataStatusBanner';
import { Colors } from '../constants/colors';
import { GlobalStyles } from '../constants/styles';
import { exportPDF } from '../utils/pdfGenerator';
import { getValorDiaria } from '../utils/calculations';
import { DateHelpers } from '../utils/dateHelpers';
import { formatCurrency } from '../utils/formatters';

export function CalculatorScreen() {
    const { cadrimilData } = useData();
    const {
        currentMissionState,
        currentPeriods,
        incluirAED,
        valorTotal,
        calculatorRevision,
        addPeriod,
        removePeriod,
        saveMission,
        setIncluirAED,
        updatePeriod,
        loadMissionFromObject,
    } = useMission();

    const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
    const [nomeMissao, setNomeMissao] = useState(currentMissionState.nomeMissao);
    const [localidade, setLocalidade] = useState('');
    const [grupo, setGrupo] = useState('');
    const [quantidade, setQuantidade] = useState(''); // Default empty
    const [dataInicio, setDataInicio] = useState(new Date());
    const [dataFim, setDataFim] = useState(new Date());
    const [contarInteiro, setContarInteiro] = useState(false);
    const [registrarEmMinhasMissoes, setRegistrarEmMinhasMissoes] = useState(false);
    const [showDatePickerInicio, setShowDatePickerInicio] = useState(false);
    const [showDatePickerFim, setShowDatePickerFim] = useState(false);
    const scrollRef = useRef<ScrollViewInstance>(null);
    const meuGrupoRegistradoRef = useRef<string | null>(null);

    // Sync mission name when loading a saved mission or resetting
    // Sync mission name and reset form when loading a saved mission or resetting
    useLayoutEffect(() => {
        setNomeMissao(currentMissionState.nomeMissao);
        // Reset form fields
        setLocalidade('');
        setGrupo('');
        setQuantidade('');
        setDataInicio(new Date());
        setDataFim(new Date());
        setContarInteiro(false);
        setRegistrarEmMinhasMissoes(false);
        meuGrupoRegistradoRef.current = null;
        setEditingPeriodId(null);
    }, [calculatorRevision]);

    const localidadeOptions = Object.keys(cadrimilData.localidades).map(key => ({
        label: cadrimilData.localidades[key],
        value: key,
    }));

    const grupoOptions = Object.keys(cadrimilData.grupos).map(key => ({
        label: `${key} - ${cadrimilData.grupos[key]}`,
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

        const editingPeriod = editingPeriodId
            ? currentPeriods.find(period => period.id === editingPeriodId)
            : undefined;

        // Preserve the historical rate when editing dates/quantity.
        // If the group or locality changes, use the current table rate.
        const valorUnitario =
            editingPeriod &&
            editingPeriod.grupo === grupo &&
            editingPeriod.localidade === localidade &&
            typeof editingPeriod.valorUnitario === 'number'
                ? editingPeriod.valorUnitario
                : getValorDiaria(grupo, localidade, cadrimilData);

        const periodData = {
            grupo,
            localidade,
            dataInicio,
            dataFim,
            quantidadeMilitares: parseInt(quantidade),
            contarUltimoDiaInteiro: contarInteiro,
            valorUnitario,
            registrarEmMinhasMissoes,
        };

        if (editingPeriodId) {
            updatePeriod({
                ...periodData,
                id: editingPeriodId,
            });
            Alert.alert('Sucesso', 'Período atualizado com sucesso!');
            setEditingPeriodId(null);
        } else {
            addPeriod(periodData);
        }

        // Reset form. Keep group/locality so the user can quickly add another
        // period; the individual flag must be explicitly marked again.
        setQuantidade('');
        setContarInteiro(false);
        setRegistrarEmMinhasMissoes(false);
        meuGrupoRegistradoRef.current = null;
    };

    const handleEditPeriod = (period: any) => {
        const isRegistered = Boolean(period.registrarEmMinhasMissoes);

        setEditingPeriodId(period.id);
        setGrupo(period.grupo);
        setLocalidade(period.localidade);
        setQuantidade(period.quantidadeMilitares.toString());
        setDataInicio(new Date(period.dataInicio));
        setDataFim(new Date(period.dataFim));
        setContarInteiro(period.contarUltimoDiaInteiro);
        setRegistrarEmMinhasMissoes(isRegistered);
        meuGrupoRegistradoRef.current = isRegistered ? period.grupo : null;

        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const handleGrupoChange = (value: string) => {
        if (
            registrarEmMinhasMissoes &&
            value !== meuGrupoRegistradoRef.current
        ) {
            setRegistrarEmMinhasMissoes(false);
            meuGrupoRegistradoRef.current = null;
        }

        setGrupo(value);
    };

    const handleCancelEdit = () => {
        setEditingPeriodId(null);
        setQuantidade('');
        setContarInteiro(false);
        setRegistrarEmMinhasMissoes(false);
        meuGrupoRegistradoRef.current = null;
        setGrupo('');
        setLocalidade('');
        setDataInicio(new Date());
        setDataFim(new Date());
    };

    const handleRemovePeriod = (id: string) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja remover este período?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: () => removePeriod(id),
                },
            ]
        );
    };

    const handleSaveMission = async () => {
        await saveMission(nomeMissao.trim());
    };

    const handleToggleMyMissions = (value: boolean) => {
        if (value && !grupo) {
            Alert.alert(
                'Atenção',
                'Selecione o grupo do militar antes de registrar em Minhas Missões.'
            );
            return;
        }

        setRegistrarEmMinhasMissoes(value);
        meuGrupoRegistradoRef.current = value ? grupo : null;
    };

    const handleGeneratePDF = async () => {
        if (currentPeriods.length === 0) {
            Alert.alert('Atenção', 'Adicione pelo menos um período para gerar o PDF.');
            return;
        }

        try {
            const mission = {
                id: currentMissionState.id || Date.now().toString(),
                nomeMissao: nomeMissao.trim() || 'Missão Sem Nome',
                dataCriacao: new Date().toISOString(),
                periodos: currentPeriods,
                incluirAED,
                aedValue: currentMissionState.aedValue ?? cadrimilData.aed.value,
                tabelaMeta: currentMissionState.tabelaMeta ?? cadrimilData.meta,
                valorTotal,
                decretosReferencia: cadrimilData.decretos.map(d => ({
                    decree: d.decree,
                    date: d.date,
                })),
            };

            await exportPDF(mission, cadrimilData);
        } catch (error) {
            Alert.alert('Erro', 'Erro ao gerar PDF');
        }
    };

    const handleImportMission = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            const fileUri = result.assets[0].uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const missionData = JSON.parse(fileContent);

            if (!missionData.periodos || !Array.isArray(missionData.periodos)) {
                Alert.alert('Erro', 'Arquivo de missão inválido.');
                return;
            }

            loadMissionFromObject(missionData);
            Alert.alert('Sucesso', `Missão "${missionData.nomeMissao}" importada!`);

        } catch (error) {
            Alert.alert('Erro', 'Falha ao importar missão.');
            console.error(error);
        }
    };

    return (
        <ScrollView ref={scrollRef} style={GlobalStyles.container}>
            <DataStatusBanner />
            <View style={styles.content}>
                {/* Nome da Missão e Importar */}
                <View style={styles.missionHeaderRow}>
                    <View style={{ flex: 1 }}>
                        <CustomInput
                            label="Missão"
                            value={nomeMissao}
                            onChangeText={setNomeMissao}
                            placeholder="Ex. Operação Brasil"
                        />
                    </View>
                    <TouchableOpacity style={styles.importButton} onPress={handleImportMission}>
                        <Text style={styles.importButtonText}>📥</Text>
                    </TouchableOpacity>
                </View>

                {/* Formulário de Adição de Período */}
                <View style={[GlobalStyles.card, styles.formCard]}>
                    <Text style={styles.sectionTitle}>Dados da Missão</Text>

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
                                onValueChange={handleGrupoChange}
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
                                style={{ textAlign: 'center' }}
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

                    <View style={{ marginVertical: 12 }}>
                        <CustomCheckbox
                            label="Contar último dia como diária inteira (1.0)"
                            value={contarInteiro}
                            onValueChange={setContarInteiro}
                        />
                        <CustomCheckbox
                            label="Registrar em Minhas Missões"
                            value={registrarEmMinhasMissoes}
                            onValueChange={handleToggleMyMissions}
                        />
                        {registrarEmMinhasMissoes && grupo && (
                            <Text style={styles.myGroupText}>
                                Meu grupo: {grupo} - {cadrimilData.grupos[grupo]}
                            </Text>
                        )}
                    </View>

                    <View style={styles.buttonRow}>
                        {editingPeriodId && (
                            <CustomButton
                                title="CANCELAR"
                                onPress={handleCancelEdit}
                                variant="danger"
                                style={{ flex: 1, marginRight: 8 }}
                            />
                        )}
                        <CustomButton
                            title={editingPeriodId ? "ATUALIZAR" : "ADICIONAR"}
                            onPress={handleAddPeriod}
                            variant="primary"
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>

                {/* Resumo da Missão */}
                <Text style={styles.sectionTitle}>Resumo da Missão</Text>
                {currentPeriods.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum período adicionado.</Text>
                ) : (
                    <View style={styles.periodsContainer}>
                        {currentPeriods.map((period) => (
                            <PeriodCard
                                key={period.id}
                                period={period}
                                onRemove={() => handleRemovePeriod(period.id)}
                                onEdit={() => handleEditPeriod(period)}
                            />
                        ))}
                    </View>
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
                        Valor do AED: R$ {formatCurrency(cadrimilData.aed.value)} / militar
                    </Text>
                </View>

                {/* Resultado Total */}
                <View style={styles.resultBox}>
                    <Text style={styles.resultLabel}>VALOR TOTAL CALCULADO</Text>
                    <Text style={styles.resultValue}>
                        R$ {formatCurrency(valorTotal)}
                    </Text>
                </View>

                {/* Ações */}
                <View style={styles.actions}>
                    <CustomButton
                        title="Salvar Missão"
                        subtitle="Localmente"
                        onPress={handleSaveMission}
                        variant="success"
                        style={styles.actionButton}
                    />
                    <CustomButton
                        title="Relatório PDF"
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
        color: Colors.textLight,
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
        color: Colors.textLight,
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
    myGroupText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
        marginLeft: 28,
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
    periodsContainer: {
        gap: 1,
    },
    totalContainer: {
        backgroundColor: Colors.card,
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    totalLabel: {
        fontSize: 14,
        color: Colors.textMuted,
        marginBottom: 4,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    missionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        marginBottom: 0, // CustomInput already has margin? Let's check. CustomInput usually has marginBottom.
    },
    importButton: {
        height: 50, // Match typical input height
        width: 50,
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 16, // Align with input's margin
    },
    importButtonText: {
        fontSize: 24,
    },
});
