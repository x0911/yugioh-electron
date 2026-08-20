/**
 * Formats a combat stat (ATK or DEF) value for display.
 * Negative values (like -2 used in database/engine for '?') are displayed as '?'.
 */
export function formatCombatStat(val) {
    if (val === undefined || val === null)
        return '0';
    if (val < 0)
        return '?';
    return String(val);
}
