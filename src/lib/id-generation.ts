
import { format } from 'date-fns';
import { type IdSuffixType } from './types';

export function generateSuffix(suffixType: IdSuffixType): string {
    const now = new Date();
    switch (suffixType) {
        case 'timestamp':
            return String(now.getTime());
        case 'date':
            return format(now, 'yyyyMMdd');
        case 'month_year':
            return format(now, 'MMyyyy');
        case 'year':
            return format(now, 'yyyy');
        case 'random_4':
            return String(Math.floor(1000 + Math.random() * 9000));
        case 'none':
            return '';
        default:
            return '';
    }
}
