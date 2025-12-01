/**
 * Format a number as Brazilian currency (BRL)
 * Adds thousands separator (.) and decimal separator (,)
 * @param value The number to format
 * @returns Formatted string (e.g., "1.234,56")
 */
export const formatCurrency = (value: number): string => {
    // Check if value is valid
    if (value === undefined || value === null || isNaN(value)) {
        return '0,00';
    }

    // Use Intl.NumberFormat for reliable formatting
    // We strip the "R$ " prefix since we usually add it manually in the UI
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};
