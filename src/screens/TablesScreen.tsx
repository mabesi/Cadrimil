// Tables Screen
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useData } from '../context/DataContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Colors } from '../constants/colors';
import { GlobalStyles } from '../constants/styles';

export function TablesScreen() {
    const { cadrmilData, loading } = useData();
    const [gruposExpanded, setGruposExpanded] = useState(false);
    const [localidadesExpanded, setLocalidadesExpanded] = useState(false);

    if (loading || !cadrmilData) {
        return <LoadingSpinner message="Carregando tabelas..." />;
    }

    const grupoKeys = Object.keys(cadrmilData.grupos);
    const localidadeKeys = Object.keys(cadrmilData.localidades);

    return (
        <ScrollView style={GlobalStyles.container}>
            <View style={styles.content}>
                {/* Tabela de Grupos */}
                <TouchableOpacity
                    style={styles.collapsibleHeader}
                    onPress={() => setGruposExpanded(!gruposExpanded)}
                >
                    <Text style={styles.sectionTitle}>Grupos de Militares</Text>
                    <Text style={styles.collapseIcon}>{gruposExpanded ? '▼' : '▶'}</Text>
                </TouchableOpacity>

                {gruposExpanded && (
                    <View style={styles.tableContainer}>
                        {grupoKeys.map((grupo, index) => (
                            <View
                                key={grupo}
                                style={[
                                    styles.tableRow,
                                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                                ]}
                            >
                                <Text style={styles.grupoCode}>{grupo}</Text>
                                <Text style={styles.grupoDesc}>{cadrmilData.grupos[grupo]}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Tabela de Localidades */}
                <TouchableOpacity
                    style={styles.collapsibleHeader}
                    onPress={() => setLocalidadesExpanded(!localidadesExpanded)}
                >
                    <Text style={styles.sectionTitle}>Localidades</Text>
                    <Text style={styles.collapseIcon}>{localidadesExpanded ? '▼' : '▶'}</Text>
                </TouchableOpacity>

                {localidadesExpanded && (
                    <View style={styles.tableContainer}>
                        {localidadeKeys.map((loc, index) => (
                            <View
                                key={loc}
                                style={[
                                    styles.tableRow,
                                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                                ]}
                            >
                                <Text style={styles.locCode}>{loc}</Text>
                                <Text style={styles.locDesc}>{cadrmilData.localidades[loc]}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Tabela de Valores de Diárias */}
                <Text style={styles.sectionTitle}>Valores de Diárias</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    <View style={styles.diariasTable}>
                        {/* Header */}
                        <View style={styles.diariasHeaderRow}>
                            <View style={[styles.diariasHeaderCell, styles.grupoColumn]}>
                                <Text style={styles.diariasHeaderText}>Grupo</Text>
                            </View>
                            <View style={[styles.diariasHeaderCell, styles.descColumn]}>
                                <Text style={styles.diariasHeaderText}>Descrição</Text>
                            </View>
                            {localidadeKeys.map(loc => (
                                <View key={loc} style={[styles.diariasHeaderCell, styles.valueColumn]}>
                                    <Text style={styles.diariasHeaderText} numberOfLines={2}>
                                        {cadrmilData.localidades[loc]}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Rows */}
                        {grupoKeys.map((grupo, index) => (
                            <View
                                key={grupo}
                                style={[
                                    styles.diariasRow,
                                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                                ]}
                            >
                                <Text style={[styles.diariasCell, styles.grupoCode, styles.grupoColumn]}>
                                    {grupo}
                                </Text>
                                <Text style={[styles.diariasCell, styles.descColumn]}>
                                    {cadrmilData.grupos[grupo]}
                                </Text>
                                {localidadeKeys.map(loc => {
                                    const valor = cadrmilData.diarias[grupo][loc];
                                    return (
                                        <Text key={loc} style={[styles.diariasCell, styles.valueColumn]}>
                                            {valor ? valor.toFixed(2).replace('.', ',') : 'N/D'}
                                        </Text>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {/* AED */}
                <View style={styles.aedContainer}>
                    <Text style={styles.aedTitle}>{cadrmilData.aed.title}</Text>
                    <Text style={styles.aedValue}>
                        R$ {cadrmilData.aed.value.toFixed(2).replace('.', ',')}
                    </Text>
                    <Text style={styles.aedSubtext}>Valor por militar</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 16,
    },
    collapsibleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: Colors.white,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    collapseIcon: {
        fontSize: 18,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    tableContainer: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tableRow: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        alignItems: 'center',
    },
    evenRow: {
        backgroundColor: Colors.white,
    },
    oddRow: {
        backgroundColor: Colors.backgroundSecondary,
    },
    grupoCode: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
        width: 70,
        textAlign: 'center',
    },
    grupoDesc: {
        fontSize: 14,
        color: Colors.textSecondary,
        flex: 1,
        lineHeight: 20,
    },
    locCode: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
        width: 70,
        textAlign: 'center',
    },
    locDesc: {
        fontSize: 14,
        color: Colors.textSecondary,
        flex: 1,
        lineHeight: 20,
    },
    diariasTable: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    diariasHeaderRow: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        borderBottomWidth: 0,
        paddingVertical: 8,
    },
    diariasHeaderCell: {
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    diariasHeaderText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.white,
        textAlign: 'center',
        flexWrap: 'wrap',
    },
    diariasHeaderSubtext: {
        fontSize: 10,
        color: Colors.white,
        opacity: 0.8,
        marginTop: 2,
    },
    diariasRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        minHeight: 48,
        alignItems: 'center',
    },
    diariasCell: {
        padding: 8,
        fontSize: 13,
        color: Colors.text,
        textAlign: 'right',
    },
    grupoColumn: {
        width: 70,
        minWidth: 70,
        maxWidth: 70,
        alignItems: 'center',
    },
    descColumn: {
        width: 180,
        minWidth: 180,
        maxWidth: 180,
        textAlign: 'left',
        paddingRight: 12,
    },
    valueColumn: {
        width: 65,
        minWidth: 65,
        maxWidth: 65,
    },
    aedContainer: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        borderLeftWidth: 4,
        borderLeftColor: Colors.aedBorder,
        alignItems: 'center',
    },
    aedTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    aedValue: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.warning,
    },
    aedSubtext: {
        fontSize: 12,
        color: Colors.textMuted,
        marginTop: 2,
    },
});
