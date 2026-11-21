// Banner showing the source and freshness of the rates data
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useData } from '../context/DataContext';
import { Colors } from '../constants/colors';
import { DateHelpers } from '../utils/dateHelpers';

function formatDataDate(value: string | null): string | null {
    if (!value) return null;

    const parsed = DateHelpers.parseISO(value);
    if (Number.isNaN(parsed.getTime())) return null;

    return DateHelpers.format(parsed, 'dd/MM/yyyy');
}

export function DataStatusBanner() {
    const { cadrimilData, dataSource, updatedAt, error, isRefreshing, reloadData } = useData();

    if (dataSource === 'network' && !error && !isRefreshing) {
        return null;
    }

    const formattedDate = formatDataDate(updatedAt);
    const formattedValidFrom = formatDataDate(cadrimilData.meta.validFrom ?? null);
    const dateText = [
        formattedDate ? ` de ${formattedDate}` : '',
        formattedValidFrom ? ` (vigência desde ${formattedValidFrom})` : '',
    ].join('');

    const sourceLabel =
        dataSource === 'cache'
            ? 'a tabela salva no dispositivo'
            : dataSource === 'bundled'
                ? 'a tabela embutida no app'
                : 'a tabela de valores';

    const message = error
        ? `${error} Usando ${sourceLabel}${dateText}.`
        : isRefreshing
            ? 'Atualizando tabela de valores...'
            : `Usando ${sourceLabel}${dateText}.`;

    const showRetry = !isRefreshing && (dataSource !== 'network' || Boolean(error));

    return (
        <View
            style={[styles.container, error ? styles.errorContainer : styles.warningContainer]}
        >
            <Text style={styles.message} accessibilityLiveRegion="polite">
                {message}
            </Text>

            {showRetry && (
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={reloadData}
                    accessibilityRole="button"
                    accessibilityLabel="Tentar atualizar a tabela de valores"
                >
                    <Text style={styles.retryText}>Tentar atualizar</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginHorizontal: 16,
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    warningContainer: {
        backgroundColor: Colors.warningLight,
        borderColor: Colors.warning,
    },
    errorContainer: {
        backgroundColor: Colors.dangerLight,
        borderColor: Colors.danger,
    },
    message: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        color: Colors.text,
    },
    retryButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: Colors.primary,
    },
    retryText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
});
