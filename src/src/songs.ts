export type Song = { t: string; a: string; y: number; u: string };

// Original synthetic tones generated in the browser, not commercial recordings.
export let SONGS: Song[] = Array.from({ length: 40 }, (_, i) => ({
    t: `צליל בדיקה ${i + 1}`, a: 'Timeliner demo', y: 1950 + i, u: `demo:${i + 1}`,
}));

export async function loadLocalCatalog(): Promise<void> {
    const response = await fetch(`${import.meta.env.BASE_URL}catalog.local.json`);
    if (response.status === 404) return;
    if (!response.ok) throw new Error('Catalog request failed');
    const text = await response.text();
    // Static development servers may return their HTML fallback for absent files.
    if (text.trimStart().startsWith('<')) return;
    const data: unknown = JSON.parse(text);
    if (!Array.isArray(data) || data.length < 2 || !data.every(s =>
        typeof s.t === 'string' && typeof s.a === 'string' &&
        Number.isInteger(s.y) && s.y >= 1000 && s.y <= new Date().getFullYear() &&
        typeof s.u === 'string' && /^audio\/[A-Za-z0-9_./-]+$/.test(s.u) && !s.u.includes('..')
    )) throw new Error('Invalid catalog');
    SONGS = data.map(s => ({ ...s, u: `${import.meta.env.BASE_URL}${s.u}` }));
}
