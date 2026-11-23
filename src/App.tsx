import React, { useEffect, useRef, useState } from 'react';
import { SONGS, Song } from './songs';
import { isCorrectPlacement } from './rules';

type Placed = { t: string; a: string; y: number };
type Player = { name: string; color: string; cards: Placed[] };
type Phase = 'setup' | 'turn' | 'judge' | 'gameover';
type Side = 'bottom' | 'top' | 'left' | 'right';
type Judge = { ok: boolean; song: Song; x: number; y: number; slot: number };

const COLORS = ['#4f8ef7', '#3fbf7f', '#f76b6b', '#f7c948'];
const DEFAULT_WIN = 12;
const MIN_WIN = 5;
const MAX_WIN = 30;
const SIDES: Record<number, Side[]> = {
    2: ['bottom', 'top'],
    3: ['bottom', 'left', 'right'],
    4: ['bottom', 'left', 'top', 'right'],
};
const SIDE_ARR: Side[] = ['bottom', 'left', 'top', 'right'];
const SIDE_ROT: Record<Side, number> = { bottom: 0, right: -90, top: 180, left: 90 };
const MAXLISTEN = 30;
const JUDGE_MS = 3400;

class AudioEngine {
    ctx: AudioContext | null = null;
    buffer: AudioBuffer | null = null;
    source: AudioBufferSourceNode | null = null;
    startedAt = 0;
    offset = 0;
    playing = false;
    ensure(): AudioContext {
        if (!this.ctx) {
            const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AC();
        }
        return this.ctx!;
    }
    async load(url: string) {
        const ctx = this.ensure();
        if (url.startsWith('demo:')) {
            const offline = new OfflineAudioContext(1, 5 * 44100, 44100);
            const oscillator = offline.createOscillator();
            const gain = offline.createGain();
            oscillator.frequency.value = 180 + Number(url.slice(5)) * 13;
            gain.gain.value = 0.08;
            oscillator.connect(gain); gain.connect(offline.destination);
            oscillator.start(); oscillator.stop(5);
            this.buffer = await offline.startRendering();
            return;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('http ' + res.status);
        const ab = await res.arrayBuffer();
        this.buffer = await ctx.decodeAudioData(ab.slice(0));
    }
    play(onEnd: () => void): void {
        const ctx = this.ensure();
        if (!this.buffer) return;
        if (ctx.state === 'suspended') ctx.resume();
        this.stopSource();
        const dur = Math.min(MAXLISTEN, this.buffer.duration) - this.offset;
        if (dur <= 0.05) { this.offset = 0; return this.play(onEnd); }
        const src = ctx.createBufferSource();
        src.buffer = this.buffer;
        src.connect(ctx.destination);
        src.start(0, this.offset, dur);
        this.startedAt = ctx.currentTime;
        this.playing = true;
        this.source = src;
        src.onended = () => { if (this.source === src) { this.offset = 0; this.playing = false; onEnd(); } };
    }
    pause() {
        if (!this.ctx || !this.playing) return;
        this.offset += this.ctx.currentTime - this.startedAt;
        this.playing = false;
        this.stopSource();
    }
    stopSource() {
        if (this.source) { const s = this.source; this.source = null; try { s.onended = null; s.stop(); } catch {} }
    }
    reset() { this.offset = 0; this.playing = false; this.stopSource(); }
    elapsed() { return this.ctx && this.playing ? Math.min(MAXLISTEN, this.offset + this.ctx.currentTime - this.startedAt) : this.offset; }
}

function shuffled<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

export function App() {
    const [phase, setPhase] = useState<Phase>('setup');
    const [count, setCount] = useState(4);
    const [win, setWin] = useState(DEFAULT_WIN);
    const [names, setNames] = useState<string[]>(['שחקן 1', 'שחקן 2', 'שחקן 3', 'שחקן 4']);
    const [players, setPlayers] = useState<Player[]>([]);
    const [turn, setTurn] = useState(0);
    const [song, setSong] = useState<Song | null>(null);
    const [judge, setJudge] = useState<Judge | null>(null);
    const [winner, setWinner] = useState<Player | null>(null);
    const [tick, setTick] = useState(0);
    const [toast, setToast] = useState('');
    const [loading, setLoading] = useState(false);
    const [drag, setDrag] = useState<{ x: number; y: number; slot: number | null; over: boolean } | null>(null);
    const [fs, setFs] = useState(false);

    const engine = useRef(new AudioEngine());
    const deck = useRef<Song[]>([]);
    const deckIdx = useRef(0);
    const cardEls = useRef<Record<string, HTMLElement | null>>({});
    const stripEls = useRef<Record<number, HTMLElement | null>>({});
    const panelEls = useRef<Record<number, HTMLElement | null>>({});
    const dragRef = useRef<{ id: number; sx: number; sy: number; moved: boolean } | null>(null);
    const judgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sides = SIDES[count] || SIDES[4];
    const cur = players[turn];
    const curSide: Side = sides[turn] || 'bottom';
    const elapsed = engine.current.elapsed();

    const nextSong = (): Song => {
        if (deckIdx.current >= deck.current.length) { deck.current = shuffled(SONGS); deckIdx.current = 0; }
        return deck.current[deckIdx.current++];
    };

    const startTurn = () => {
        const s = nextSong();
        setSong(s);
        setJudge(null);
        setDrag(null);
        engine.current.reset();
        setPhase('turn');
        setLoading(true);
        engine.current.load(s.u).then(() => setLoading(false)).catch(() => {
            setLoading(false);
            engine.current.reset();
            setPhase('setup');
            window.alert('קובץ השמע לא נטען. בדקו את הקטלוג המקומי ונסו שוב.');
        });
    };

    const startGame = () => {
        const ps: Player[] = Array.from({ length: count }, (_, i) => ({
            name: names[i]?.trim() || `שחקן ${i + 1}`,
            color: COLORS[i],
            cards: [],
        }));
        setPlayers(ps);
        setTurn(0);
        setWinner(null);
        deck.current = shuffled(SONGS);
        deckIdx.current = 0;
        engine.current.ensure();
        startTurn();
    };

    // Restore a game carried into a separate fullscreen tab.
    useEffect(() => {
        const m = /restore=([A-Za-z0-9_-]+)/.exec(window.location.hash);
        if (!m) return;
        try {
            const data = JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g, '+').replace(/_/g, '/')))));
            if (data && Array.isArray(data.players) && data.players.length >= 2) {
                setCount(data.count || data.players.length);
                setWin(typeof data.win === 'number' ? data.win : DEFAULT_WIN);
                setNames(data.names || data.players.map((p: Player) => p.name));
                setPlayers(data.players);
                setTurn(typeof data.turn === 'number' ? data.turn : 0);
                setWinner(null);
                deck.current = shuffled(SONGS);
                deckIdx.current = 0;
                startTurn();
            }
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // fullscreen state tracking
    useEffect(() => {
        const onFs = () => setFs(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
        document.addEventListener('fullscreenchange', onFs);
        document.addEventListener('webkitfullscreenchange', onFs);
        return () => {
            document.removeEventListener('fullscreenchange', onFs);
            document.removeEventListener('webkitfullscreenchange', onFs);
        };
    }, []);

    const toggleFs = () => {
        try {
            const doc: any = document;
            const el: any = document.documentElement;
            if (doc.fullscreenElement || doc.webkitFullscreenElement) {
                void (doc.exitFullscreen ? doc.exitFullscreen() : doc.webkitExitFullscreen());
                return;
            }
            if (doc.fullscreenEnabled || doc.webkitFullscreenEnabled) {
                void (el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen());
                return;
            }
            // Sandboxed embed (fullscreen API blocked): open the game in its own tab,
            // carrying the current game state in the URL so play continues there.
            window.open(fullscreenTabUrl(), '_blank');
        } catch {
            try { window.open(fullscreenTabUrl(), '_blank'); } catch {}
        }
    };

    const fullscreenTabUrl = () => {
        let href = window.location.href;
        if (players.length >= 2 && phase !== 'setup') {
            try {
                const snap = { count, names, players, turn, win };
                const payload = btoa(unescape(encodeURIComponent(JSON.stringify(snap))))
                    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                href = href.includes('#/')
                    ? href.replace('#/', '#/?restore=' + payload)
                    : href + '#/?restore=' + payload;
            } catch {}
        }
        return href;
    };

    // progress ticker
    useEffect(() => {
        if (phase !== 'turn') return;
        const id = setInterval(() => setTick(t => t + 1), 200);
        return () => clearInterval(id);
    }, [phase]);

    // judge auto-advance
    useEffect(() => {
        if (phase !== 'judge') return;
        judgeTimer.current = setTimeout(() => advance(), JUDGE_MS);
        return () => { if (judgeTimer.current) clearTimeout(judgeTimer.current); };
    }, [phase, judge]);

    const advance = () => {
        if (winner) { setPhase('gameover'); return; }
        setTurn(t => (t + 1) % players.length);
        startTurn();
    };

    const axis: 'x' | 'y' = (curSide === 'bottom' || curSide === 'top') ? 'x' : 'y';

    const computeDrop = (clientX: number, clientY: number): { slot: number | null; over: boolean } => {
        const panel = panelEls.current[turn];
        if (!panel) return { slot: null, over: false };
        const pr = panel.getBoundingClientRect();
        const M = 60;
        const over = clientX >= pr.left - M && clientX <= pr.right + M && clientY >= pr.top - M && clientY <= pr.bottom + M;
        if (!over) return { slot: null, over: false };
        const n = cur.cards.length;
        if (n === 0) return { slot: 0, over: true };
        const p = axis === 'x' ? clientX : clientY;
        const vis = cur.cards.map((_, ci) => {
            const el = cardEls.current[turn + ':' + ci];
            const r = el ? el.getBoundingClientRect() : null;
            return { idx: ci, c: r ? (axis === 'x' ? r.left + r.width / 2 : r.top + r.height / 2) : 0 };
        }).filter(v => cardEls.current[turn + ':' + v.idx]).sort((a, b) => a.c - b.c);
        if (vis.length !== n) return { slot: n, over: true };
        let g = 0;
        while (g < n && vis[g].c < p) g++;
        // does ascending screen position follow array order or its reverse?
        let reversed: boolean;
        if (n >= 2) reversed = vis[0].idx > vis[1].idx;
        else {
            const rtl = stripEls.current[turn] ? getComputedStyle(stripEls.current[turn]!).direction === 'rtl' : true;
            const axDir = (curSide === 'top' || curSide === 'right') ? -1 : 1;
            reversed = rtl ? axDir === 1 : axDir === -1;
        }
        const slot = reversed ? n - g : g;
        return { slot, over: true };
    };

    const onRecordDown = (e: React.PointerEvent) => {
        if (phase !== 'turn' || !song) return;
        dragRef.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onRecordMove = (e: React.PointerEvent) => {
        const d = dragRef.current;
        if (!d || d.id !== e.pointerId) return;
        if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 10) return;
        if (!d.moved) { d.moved = true; engine.current.pause(); setTick(t => t + 1); }
        const { slot, over } = computeDrop(e.clientX, e.clientY);
        setDrag({ x: e.clientX, y: e.clientY, slot, over });
    };

    const onRecordUp = (e: React.PointerEvent) => {
        const d = dragRef.current;
        dragRef.current = null;
        if (!d) return;
        if (!d.moved) { togglePlay(); return; }
        const { slot, over } = computeDrop(e.clientX, e.clientY);
        if (over && slot !== null && song && cur) {
            placeSong(slot, e.clientX, e.clientY);
        }
        setDrag(null);
    };

    const togglePlay = () => {
        if (loading || !song) return;
        if (engine.current.playing) { engine.current.pause(); }
        else { engine.current.play(() => setTick(t => t + 1)); }
        setTick(t => t + 1);
    };

    const placeSong = (slot: number, x: number, y: number) => {
        if (!song || !cur) return;
        engine.current.reset();
        const cards = cur.cards;
        const ok = isCorrectPlacement(cards.map(c => c.y), song.y, slot);
        let won = false;
        if (ok) {
            const nc = cards.slice();
            nc.splice(slot, 0, { t: song.t, a: song.a, y: song.y });
            const np = players.slice();
            np[turn] = { ...cur, cards: nc };
            setPlayers(np);
            if (nc.length >= win) { setWinner(np[turn]); won = true; }
        }
        const cx = Math.min(Math.max(x, 140), window.innerWidth - 140);
        const cy = Math.min(Math.max(y, 150), window.innerHeight - 150);
        setJudge({ ok, song, x: cx, y: cy, slot });
        setPhase('judge');
    };

    // ---------- setup screen ----------
    if (phase === 'setup') {
        return <div className="hit-root" dir="rtl">
            <div className="hit-setup">
                <div className="hit-logo">Timeliner</div>
                <div className="hit-demo-note">{SONGS[0]?.u.startsWith('demo:') ? 'הדגמה טכנית בלבד: צלילים סינתטיים, לא שירים אמיתיים' : 'קטלוג שמע מקומי'}</div>
                <div className="hit-sub">נחשו מתי יצא השיר · מי שמשלים ראשון {win} תקליטים מנצח</div>
                <div className="hit-setup-row">
                    <span>מספר שחקנים:</span>
                    {[2, 3, 4].map(n => <button key={n} type="button" className={'hit-chip' + (count === n ? ' on' : '')} onClick={() => setCount(n)}>{n}</button>)}
                </div>
                <div className="hit-setup-row">
                    <span>נקודות לניצחון:</span>
                    <button type="button" className="hit-step-btn" aria-label="פחות נקודות" onClick={() => setWin(w => Math.max(MIN_WIN, w - 1))}>−</button>
                    <span className="hit-step-val">{win}</span>
                    <button type="button" className="hit-step-btn" aria-label="עוד נקודות" onClick={() => setWin(w => Math.min(MAX_WIN, w + 1))}>+</button>
                </div>
                {Array.from({ length: count }, (_, i) => (
                    <div key={i} className="hit-setup-row">
                        <span className="hit-dot" style={{ background: COLORS[i] }} />
                        <input value={names[i]} maxLength={14}
                            onChange={e => { const n = names.slice(); n[i] = e.target.value; setNames(n); }}
                            onKeyDown={e => { if (e.key === 'Enter') startGame(); }} />
                        <span className="hit-side-label">{{ bottom: 'יושב/ת בתחתית', left: 'יושב/ת משמאל', top: 'יושב/ת למעלה', right: 'יושב/ת מימין' }[(SIDES[count] || SIDES[4])[i]]}</span>
                    </div>
                ))}
                <button type="button" className="hit-big-btn" onClick={startGame}>התחילו משחק</button>
                <button type="button" className="hit-btn hit-fs-setup" onClick={toggleFs}>{fs ? 'יציאה ממסך מלא' : 'מסך מלא'}</button>
                <div className="hit-hint">שמו את הטאבלט באמצע, כל שחקן בצד שלו. הקשה על התקליט משמיעה את השיר, וגרירה שלו לציר הזמן שלך משבצת אותו לפי השנה.</div>
            </div>
        </div>;
    }

    // ---------- game board ----------
    const sideOf = (i: number): Side => sides[i];

    const renderPanel = (p: Player, i: number) => {
        const isActive = i === turn && phase !== 'gameover';
        const s = sideOf(i);
        const cls = 'hit-panel hit-panel-' + s + (isActive ? ' active' : ' dim') + (isActive && drag?.over ? ' drop' : '');
        const slot = isActive && drag?.over ? drag.slot : null;
        return <div key={i} ref={el => { panelEls.current[i] = el; }} className={cls} style={{ ['--pc' as any]: p.color }}>
            <div className="hit-panel-head">
                <span className="hit-pname">{p.name}</span>
                <span className="hit-pscore">{p.cards.length}/{win}</span>
            </div>
            <div className="hit-strip" ref={el => { stripEls.current[i] = el; }}>
                <div className="hit-strip-inner">
                    {slot === 0 && <div className="hit-dropmark" />}
                    {p.cards.map((c, ci) => <React.Fragment key={ci}>
                        <div ref={el => { cardEls.current[i + ':' + ci] = el; }}
                            className={'hit-mini' + (phase === 'judge' && judge?.ok && i === turn && ci === judge.slot ? ' hit-new' : '')}>
                            <div className="hit-mini-disc"><span>{c.y}</span></div>
                            <div className="hit-mini-title">{c.t}</div>
                            <div className="hit-mini-artist">{c.a}</div>
                        </div>
                        {slot === ci + 1 && <div className="hit-dropmark" />}
                    </React.Fragment>)}
                    {p.cards.length === 0 && slot === null && <div className="hit-empty">{isActive ? 'גררו את התקליט לכאן' : ''}</div>}
                </div>
            </div>
        </div>;
    };

    const rot = SIDE_ROT[curSide];
    const ringR = 104;
    const ringC = 2 * Math.PI * ringR;

    const recordFace = (extra?: string) => <div className={'hit-vwrap ' + (extra || '')} style={{ ['--pc' as any]: cur?.color }}>
        <svg className="hit-ring" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r={ringR} className="hit-ring-bg" />
            <circle cx="120" cy="120" r={ringR} className="hit-ring-fg"
                strokeDasharray={ringC} strokeDashoffset={ringC * (1 - Math.min(1, elapsed / MAXLISTEN))} />
        </svg>
        <div className="hit-vinyl"><div className="hit-vinyl-hole">{loading ? '…' : (engine.current.playing ? '❚❚' : '▶')}</div></div>
    </div>;

    return <div className="hit-root" dir="rtl">
        {toast && <div className="hit-toast">{toast}</div>}
        <div className="hit-board">
            {players.map((p, i) => renderPanel(p, i))}

            <div className="hit-center">
                <button type="button" className="hit-fs-btn" onClick={toggleFs}>{fs ? 'יציאה ממסך מלא' : 'מסך מלא'}</button>
                {phase !== 'gameover' && cur && <>
                    <div className="hit-stack" style={{ transform: `rotate(${rot}deg)` }}>
                        <div className="hit-turn" style={{ color: cur.color }}>התור של <b>{cur.name}</b></div>
                        <div className={'hit-record' + (drag ? ' away' : '') + (judge ? ' judged' : '')}
                            style={{ ['--pc' as any]: cur.color, boxShadow: `0 0 34px ${cur.color}66, 0 12px 32px rgba(0,0,0,0.45)` }}
                            onPointerDown={onRecordDown} onPointerMove={onRecordMove} onPointerUp={onRecordUp} onPointerCancel={() => { dragRef.current = null; setDrag(null); }}>
                            {recordFace()}
                        </div>
                        <div className="hit-hint-sm">{loading ? 'טוען שיר…' : 'הקש לשמיעה · גרור לציר שלך'}</div>
                    </div>

                    {judge && <div className={'hit-judge ' + (judge.ok ? 'ok' : 'bad')} onClick={advance}>
                        {!judge.ok && <div className="hit-shatter" style={{ left: judge.x, top: judge.y }}><div className="hit-half left" /><div className="hit-half right" /></div>}
                        <div className="hit-judge-face" style={{ transform: `rotate(${rot}deg)` }}>
                            {judge.ok
                                ? <div className="hit-chip-ok">✔ נכון! · {judge.song.y}</div>
                                : <div className="hit-chip-bad">✖ לא נכון · {judge.song.y}<br /><span>{judge.song.t} · {judge.song.a}</span></div>}
                            <div className="hit-next-hint">הקשה להמשך</div>
                        </div>
                    </div>}

                    {drag && <div className={'hit-drag-ghost' + (drag.over ? ' mini' : '')} style={{ left: drag.x, top: drag.y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${drag.over ? 0.27 : 1})` }}>
                        {recordFace('ghost')}
                    </div>}
                </>}

                {phase === 'gameover' && winner && <div className="hit-win">
                    <div className="hit-win-trophy">🏆</div>
                    <div className="hit-win-name" style={{ color: winner.color }}>{winner.name} ניצח/ה!</div>
                    <div className="hit-win-sub">{win} תקליטים נכונים על ציר הזמן</div>
                    <button type="button" className="hit-btn primary big" onClick={() => setPhase('setup')}>משחק חדש</button>
                </div>}
            </div>
        </div>
    </div>;
      }
