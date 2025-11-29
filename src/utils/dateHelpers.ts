// Date helper functions using date-fns
import { parseISO as dateFnsParseISO, differenceInDays as dateFnsDifferenceInDays, format as dateFnsFormat } from 'date-fns';

export const DateHelpers = {
    parseISO: (isoString: string): Date => {
        return dateFnsParseISO(isoString);
    },

    differenceInDays: (dateLeft: Date, dateRight: Date): number => {
        return dateFnsDifferenceInDays(dateLeft, dateRight);
    },

    format: (date: Date, formatString: string): string => {
        return dateFnsFormat(date, formatString);
    },

    toISOString: (date: Date): string => {
        return dateFnsFormat(date, 'yyyy-MM-dd');
    },

    fromISOString: (isoString: string): Date => {
        const [year, month, day] = isoString.split('-').map(Number);
        return new Date(year, month - 1, day);
    },
};
