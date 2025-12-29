/**
 * Standard currency formatter for the application.
 * Currently defaults to Malaysian Ringgit (RM).
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Formats a number with 2 decimal places for precise display (e.g. detailed views).
 */
export const formatCurrencyPrecise = (amount: number): string => {
    return new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Standard date formatter.
 * Returns formatted date string (e.g., "Oct 24, 2025").
 */
export const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(d);
};

/**
 * Returns a relative time string (e.g., "2 hours ago", "Yesterday").
 */
export const formatRelativeTime = (date: Date | string): string => {
    const d = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';

    return formatDate(d);
};
