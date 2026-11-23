export function isCorrectPlacement(years: number[], year: number, slot: number): boolean {
    if (!Number.isInteger(slot) || slot < 0 || slot > years.length) return false;
    return year >= (slot > 0 ? years[slot - 1] : -Infinity)
        && year <= (slot < years.length ? years[slot] : Infinity);
}
