// Interface de la manette : elle se transforme selon la scène.
// Utilisée sur le téléphone, et sur l'écran en mode « sans téléphone ».

import { useEffect, useRef, useState } from 'react';
import {
  availableSpots,
  currentNode,
  FLIRT_DELTA,
  FLIRT_HIGH,
  fmt,
  phoneMode,
  PHONE_MODE_LABEL,
  type GameState,
  type Input,
  type PhoneMode,
} from '../../shared/engine.ts';
import type { Fx } from '../../shared/protocol.ts';
import type { FlirtNode, FlirtTone, HeartbeatNode, MirrorNode, Story, Tone, ViewfinderNode } from '../../shared/types.ts';
import { focusColor, ViewfinderWorld, VIEW_DEFAULT, type ViewfinderView } from '../common/ViewfinderWorld.tsx';
import { Photo } from '../common/art/Photo.tsx';
import { PortraitArt } from '../common/art/Portrait.tsx';
import { cue, setMuted } from '../common/feedback.ts';
import { EndSummary } from '../common/EndSummary.tsx';

export const TONE_LABEL: Record<Tone, string> = {
  franchise: 'Franchise',
  esquive: 'Esquive',
  mensonge: 'Mensonge',
  retourner: 'Retourner la question',
  action: 'Agir',
};

const MODE_ICON: Record<PhoneMode, string> = {
  attente: '◌',
  telecommande: '▶',
  dialogue: '❝',
  navigation: '✥',
  telephone: '✉',
  digicode: '#',
  action: '!',
  saisie: '⌨',
  viseur: '◎',
  flirt: '♡',
  moniteur: '♥',
  miroir: '◐',
  fin: '★',
};

interface Props {
  story: Story;
  state: GameState;
  send: (i: Input) => void;
  sendFx: (fx: Fx) => void;
  connection: string;
  serverOffset: number;
}

export function ControllerView({ story, state, send, sendFx, connection, serverOffset }: Props) {
  const mode = phoneMode(story, state);
  const [shown, setShown] = useState<PhoneMode | null>(null);
  const [dossier, setDossier] = useState(false);
  const prevMode = useRef<PhoneMode>(mode);

  useEffect(() => {
    if (prevMode.current !== mode) {
      if (prevMode.current === 'digicode') cue('succes');
      prevMode.current = mode;
      if (mode === 'telephone') cue('message');
      else if (mode === 'action') cue('alerte');
      else cue('mode');
      setShown(mode);
      setDossier(false);
      const t = setTimeout(() => setShown(null), 1100);
      return () => clearTimeout(t);
    }
  }, [mode]);

  const tap = (i: Input) => {
    cue('tap');
    send(i);
  };

  const canDossier = !['telephone', 'action', 'attente', 'viseur', 'flirt', 'moniteur', 'miroir'].includes(mode);

  return (
    <div className={`ctrl mode-${mode}`}>
      <header className="ctrl-top">
        <span className={`dot ${connection === 'connecte' || connection === 'solo' ? 'ok' : 'ko'}`} />
        <span className="ctrl-mode">
          <span className="ctrl-mode-icon">{MODE_ICON[mode]}</span> {PHONE_MODE_LABEL[mode]}
        </span>
        {canDossier && (
          <button className="ctrl-dossier-btn" onClick={() => setDossier((d) => !d)} aria-expanded={dossier}>
            {dossier ? 'Fermer' : `Dossier · ${state.clues.length}`}
          </button>
        )}
      </header>

      <main className="ctrl-body" key={mode}>
        {dossier ? (
          <Dossier story={story} state={state} send={send} />
        ) : (
          <ModeView mode={mode} story={story} state={state} tap={tap} send={send} sendFx={sendFx} serverOffset={serverOffset} />
        )}
      </main>

      {shown && (
        <div className="ctrl-morph" aria-live="polite">
          <div className="ctrl-morph-icon">{MODE_ICON[shown]}</div>
          <div className="ctrl-morph-label">{PHONE_MODE_LABEL[shown]}</div>
        </div>
      )}
    </div>
  );
}

function ModeView({
  mode,
  story,
  state,
  tap,
  send,
  sendFx,
  serverOffset,
}: {
  mode: PhoneMode;
  story: Story;
  state: GameState;
  tap: (i: Input) => void;
  send: (i: Input) => void;
  sendFx: (fx: Fx) => void;
  serverOffset: number;
}) {
  const node = currentNode(story, state);
  switch (mode) {
    case 'attente':
      return (
        <div className="m-attente">
          <h1 className="brand">Le Lotissement</h1>
          <p>Votre téléphone est relié à l’écran. Il changera de rôle au fil de l’histoire.</p>
          <Toggle label="Temps élargi pour les actions" checked={state.settings.extendedTime} onChange={(v) => send({ type: 'settings', extendedTime: v })} />
          <button className="big-btn" onClick={() => tap({ type: 'start' })}>
            Commencer
          </button>
          <p className="small">Conseil : montez le son de l’ordinateur, gardez le téléphone en main.</p>
        </div>
      );

    case 'telecommande': {
      const speaker = node.type === 'line' ? (node.speaker === 'heroine' ? state.alias : node.speaker ? story.characters[node.speaker].name : null) : null;
      return (
        <div className="m-remote">
          <p className="hint">{node.type === 'title' ? node.kicker : speaker ?? (node.type === 'line' && node.memory ? 'Souvenir' : 'Regardez l’écran')}</p>
          <button className="remote-btn" onClick={() => tap({ type: 'advance' })} aria-label="Continuer">
            <span>Continuer</span>
          </button>
        </div>
      );
    }

    case 'dialogue':
      if (node.type !== 'choice') return null;
      return (
        <div className="m-dialogue">
          <p className="prompt">{fmt(node.prompt, state)}</p>
          <div className="options">
            {node.options.map((o) => (
              <button key={o.id} className={`option tone-${o.tone ?? 'franchise'}`} onClick={() => tap({ type: 'choose', option: o.id })}>
                {o.tone && <span className="tone">{TONE_LABEL[o.tone]}</span>}
                <span className="label">{fmt(o.label, state)}</span>
              </button>
            ))}
          </div>
        </div>
      );

    case 'navigation':
      return node.type === 'explore' ? <Navigation node={node} state={state} tap={tap} sendFx={sendFx} /> : null;

    case 'telephone':
      return node.type === 'sms' ? <HeroinePhone node={node} state={state} story={story} tap={tap} send={send} /> : null;

    case 'digicode':
      return node.type === 'keypad' ? <Keypad node={node} state={state} tap={tap} sendFx={sendFx} /> : null;

    case 'action':
      return node.type === 'qte' ? <Qte node={node} state={state} send={send} sendFx={sendFx} serverOffset={serverOffset} /> : null;

    case 'viseur':
      return node.type === 'viewfinder' ? <Viewfinder node={node} send={send} sendFx={sendFx} /> : null;

    case 'flirt':
      return node.type === 'flirt' ? <FlirtPhone node={node} state={state} tap={tap} /> : null;

    case 'moniteur':
      return node.type === 'heartbeat' ? <Monitor node={node} state={state} send={send} sendFx={sendFx} /> : null;

    case 'miroir':
      return node.type === 'mirror' ? <Mirror node={node} send={send} sendFx={sendFx} /> : null;

    case 'saisie':
      return node.type === 'input' ? <TextInput prompt={node.prompt} suggestions={node.suggestions} onSubmit={(text) => tap({ type: 'input-submit', text })} /> : null;

    case 'fin':
      return (
        <div className="m-fin">
          <EndSummary story={story} state={state} compact />
          <button className="big-btn" onClick={() => tap({ type: 'restart' })}>
            Rejouer l’épisode
          </button>
        </div>
      );
  }
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" />
      <span>{label}</span>
    </label>
  );
}

// ───────────────────────────── Navigation
function Navigation({
  node,
  state,
  tap,
  sendFx,
}: {
  node: Extract<ReturnType<typeof currentNode>, { type: 'explore' }>;
  state: GameState;
  tap: (i: Input) => void;
  sendFx: (fx: Fx) => void;
}) {
  const spots = availableSpots(node, state);
  const current = spots[state.nav.cursor] ?? spots[0];
  return (
    <div className="m-nav">
      <p className="prompt">{node.prompt}</p>
      <div className="dpad">
        <button className="dpad-arrow left" onClick={() => tap({ type: 'nav-move', dir: -1 })} aria-label="Point précédent">
          ‹
        </button>
        <button className="dpad-center" onClick={() => tap({ type: 'nav-select' })}>
          <small>{current?.exit ? 'Aller' : 'Examiner'}</small>
          <strong>{current?.label}</strong>
        </button>
        <button className="dpad-arrow right" onClick={() => tap({ type: 'nav-move', dir: 1 })} aria-label="Point suivant">
          ›
        </button>
      </div>
      <ul className="spot-list">
        {spots.map((sp, i) => {
          const seen = state.visited.includes(`${node.id}:${sp.id}`);
          return (
            <li key={sp.id}>
              <button
                className={`spot ${i === state.nav.cursor ? 'current' : ''} ${sp.exit ? 'exit' : ''}`}
                onPointerEnter={() => sendFx({ kind: 'nav-hover', spot: sp.id })}
                onPointerLeave={() => sendFx({ kind: 'nav-hover', spot: null })}
                onClick={() => tap({ type: 'nav-select', spot: sp.id })}
              >
                <span className="spot-icon">{sp.exit ? '→' : sp.icon === 'personne' ? '◉' : sp.icon === 'objet' ? '◆' : '◎'}</span>
                <span>{sp.label}</span>
                {seen && !sp.exit && <span className="seen">vu</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ───────────────────────────── Téléphone de l'héroïne
function HeroinePhone({
  node,
  state,
  story,
  tap,
  send,
}: {
  node: Extract<ReturnType<typeof currentNode>, { type: 'sms' }>;
  state: GameState;
  story: Story;
  tap: (i: Input) => void;
  send: (i: Input) => void;
}) {
  const thread = state.sms[node.thread];
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [thread?.messages.length, state.phone.opened]);
  const hour = node.thread === 'anonyme' ? '00:14' : '17:32';

  if (!state.phone.opened) {
    const last = thread.messages[thread.messages.length - 1];
    return (
      <div className="hp hp-lock" onClick={() => tap({ type: 'sms-open' })}>
        <div className="hp-clock">{hour}</div>
        <div className="hp-date">{node.thread === 'anonyme' ? 'dimanche 15 juin' : 'samedi 14 juin'}</div>
        <button className="hp-notif">
          <span className="hp-notif-app">MESSAGES · maintenant</span>
          <strong>{node.contact}</strong>
          <span>{last?.photo ? '📷 Photo' : last?.text}</span>
        </button>
        <p className="hp-unlock">Touchez pour ouvrir</p>
      </div>
    );
  }

  if (state.phone.photo) {
    return (
      <div className="hp-photo" onClick={() => send({ type: 'photo', photo: null })}>
        <Photo id={state.phone.photo} />
        <p>{story.photos[state.phone.photo]?.caption}</p>
        <p className="small">Affichée aussi sur l’écran. Touchez pour fermer.</p>
      </div>
    );
  }

  return (
    <div className="hp hp-open">
      <div className="hp-bar">
        <span>{hour}</span>
        <strong>{node.contact}</strong>
        <span>●●●</span>
      </div>
      <div className="hp-thread">
        {thread.messages.map((m, i) => (
          <div key={i} className={`bubble ${m.from}`}>
            {m.photo ? (
              <button className="bubble-photo" onClick={() => tap({ type: 'photo', photo: m.photo! })} aria-label="Ouvrir la photo">
                <Photo id={m.photo} />
              </button>
            ) : (
              m.text
            )}
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="hp-replies">
        {node.replies.map((r) => (
          <button key={r.id} className="hp-reply" onClick={() => tap({ type: 'sms-reply', reply: r.id })}>
            {fmt(r.text, state)}
          </button>
        ))}
        {node.dismiss && (
          <button className="hp-dismiss" onClick={() => tap({ type: 'sms-dismiss' })}>
            {node.dismiss.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────── Digicode
function Keypad({
  node,
  state,
  tap,
  sendFx,
}: {
  node: Extract<ReturnType<typeof currentNode>, { type: 'keypad' }>;
  state: GameState;
  tap: (i: Input) => void;
  sendFx: (fx: Fx) => void;
}) {
  const [entry, setEntry] = useState('');
  const len = node.code.length;
  const lastAttempts = useRef(state.keypad.attempts);
  useEffect(() => {
    if (state.keypad.attempts !== lastAttempts.current) {
      lastAttempts.current = state.keypad.attempts;
      cue('erreur');
      setEntry('');
      sendFx({ kind: 'keypad-entry', value: '' });
    }
  }, [state.keypad.attempts, sendFx]);

  const update = (v: string) => {
    setEntry(v);
    sendFx({ kind: 'keypad-entry', value: v });
  };
  const press = (k: string) => {
    if (k === 'C') return update('');
    if (k === 'OK') {
      if (entry.length === len) tap({ type: 'keypad-submit', code: entry });
      return;
    }
    if (entry.length < len) {
      cue('tap');
      update(entry + k);
    }
  };
  const hints = node.hints.filter((h) => state.keypad.attempts >= h.after);
  return (
    <div className="m-keypad">
      <p className="prompt">{node.prompt}</p>
      <div className={`kp-screen ${state.keypad.error && entry === '' ? 'err' : ''}`}>
        {Array.from({ length: len }, (_, i) => (
          <span key={i}>{entry[i] ?? '–'}</span>
        ))}
      </div>
      <div className="kp-grid">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((k) => (
          <button key={k} className={`kp-key ${k === 'OK' ? 'ok' : k === 'C' ? 'clear' : ''}`} onClick={() => press(k)} disabled={k === 'OK' && entry.length !== len}>
            {k === 'C' ? '⌫' : k === 'OK' ? '✓' : k}
          </button>
        ))}
      </div>
      {state.keypad.attempts > 0 && <p className="kp-attempts">Essais infructueux : {state.keypad.attempts}</p>}
      {hints.map((h, i) => (
        <p key={i} className="kp-hint">
          {h.text}
        </p>
      ))}
      {hints.length === 0 && <p className="small">Les indices recueillis sont dans le dossier.</p>}
    </div>
  );
}

// ───────────────────────────── QTE
function Qte({
  node,
  state,
  send,
  sendFx,
  serverOffset,
}: {
  node: Extract<ReturnType<typeof currentNode>, { type: 'qte' }>;
  state: GameState;
  send: (i: Input) => void;
  sendFx: (fx: Fx) => void;
  serverOffset: number;
}) {
  const [progress, setProgress] = useState(0);
  const [held, setHeld] = useState(false);
  const [remaining, setRemaining] = useState(1);
  const prog = useRef(0);
  const holding = useRef(false);
  const done = useRef(false);

  useEffect(() => {
    let raf = 0;
    let lastFx = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = t - last;
      last = t;
      // Relâcher fait redescendre doucement la jauge : pas de punition sèche.
      const delta = holding.current ? dt / node.hold : -dt / (node.hold * 3);
      prog.current = Math.max(0, Math.min(1, prog.current + delta));
      setProgress(prog.current);
      if (prog.current >= 1 && !done.current) {
        done.current = true;
        cue('succes');
        send({ type: 'qte-success' });
      }
      if (t - lastFx > 100) {
        lastFx = t;
        sendFx({ kind: 'qte-progress', value: prog.current });
      }
      if (state.qte) {
        const total = state.qte.deadline - state.qte.startedAt;
        setRemaining(Math.max(0, (state.qte.deadline - (Date.now() + serverOffset)) / total));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [node.hold, send, sendFx, state.qte, serverOffset]);

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    holding.current = true;
    setHeld(true);
    try {
      navigator.vibrate?.(20);
    } catch {
      /* pas de vibration */
    }
  };
  const stop = () => {
    holding.current = false;
    setHeld(false);
  };

  return (
    <div className="m-qte">
      <p className="qte-title">{node.prompt}</p>
      <p className="qte-instr">{node.instruction}</p>
      <div className="qte-timer">
        <div style={{ transform: `scaleX(${remaining})` }} />
      </div>
      <button
        className={`qte-btn ${held ? 'held' : ''}`}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerCancel={stop}
        onPointerLeave={stop}
        onContextMenu={(e) => e.preventDefault()}
        style={{ ['--p' as string]: progress }}
      >
        <span>Maintenir</span>
      </button>
      {state.settings.extendedTime && <p className="small">Temps élargi activé.</p>}
    </div>
  );
}

// ───────────────────────────── Viseur (voyeurisme)
function Viewfinder({ node, send, sendFx }: { node: ViewfinderNode; send: (i: Input) => void; sendFx: (fx: Fx) => void }) {
  const cam = useRef({ x: 50, y: 50, zoom: 1 });
  const focusRef = useRef(0);
  const [view, setView] = useState<ViewfinderView>(VIEW_DEFAULT);
  const [parts, setParts] = useState({ aim: 0, zoom: 0, steady: 0 });
  const [flash, setFlash] = useState(false);
  const shot = useRef(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [tx, ty] = node.target.at;
  const r = node.target.radius;

  const place = (x: number, y: number, zoom: number) => {
    const half = 50 / zoom;
    cam.current = { zoom, x: Math.max(half, Math.min(100 - half, x)), y: Math.max(half, Math.min(100 - half, y)) };
  };

  useEffect(() => {
    let raf = 0;
    let last = { x: 50, y: 50, t: performance.now() };
    let speed = 0;
    let lastFx = 0;
    const loop = (t: number) => {
      const c = cam.current;
      const dt = Math.max(1, t - last.t);
      speed += ((Math.hypot(c.x - last.x, c.y - last.y) / dt) * 1000 - speed) * 0.25;
      last = { x: c.x, y: c.y, t };
      const dist = Math.hypot(c.x - tx, c.y - ty);
      const aim = dist <= r ? 1 : Math.max(0, 1 - (dist - r) / r);
      const zoom = Math.max(0, Math.min(1, (c.zoom - 1) / (node.minZoom - 1)));
      const steady = Math.max(0, Math.min(1, 1 - speed / 25));
      focusRef.current += (aim * zoom * steady - focusRef.current) * 0.2;
      setView({ ...c, focus: focusRef.current });
      setParts({ aim, zoom, steady });
      if (t - lastFx > 100) {
        lastFx = t;
        sendFx({ kind: 'viewfinder', x: c.x, y: c.y, zoom: c.zoom, focus: focusRef.current });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [node.minZoom, r, tx, ty, sendFx]);

  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !box.current) return;
    const { clientWidth: w, clientHeight: h } = box.current;
    const c = cam.current;
    // « Saisir » l'image : le doigt qui glisse à droite décale le cadre vers la gauche.
    place(c.x - ((e.clientX - drag.current.x) / w) * (100 / c.zoom), c.y - ((e.clientY - drag.current.y) / h) * (100 / c.zoom), c.zoom);
    drag.current = { x: e.clientX, y: e.clientY };
  };

  const fire = (forced?: 'rate') => {
    if (shot.current) return;
    shot.current = true;
    const f = focusRef.current;
    const quality = forced ?? (f >= 0.7 ? 'nette' : f >= 0.3 ? 'floue' : 'rate');
    setFlash(true);
    cue(quality === 'rate' ? 'erreur' : 'succes');
    setTimeout(() => send({ type: 'vf-shot', quality }), 220);
  };

  const hint =
    parts.zoom < 1
      ? 'Zoomez pour rapprocher la scène.'
      : parts.aim < 1
        ? 'Glissez pour viser les deux silhouettes.'
        : parts.steady < 0.8
          ? 'Ne bougez plus…'
          : 'Net. Déclenchez.';

  return (
    <div className="m-vf">
      <p className="prompt">{node.prompt}</p>
      <div
        ref={box}
        className="vf-touch"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerMove={onMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <ViewfinderWorld view={view} />
        {flash && <div className="vf-flash" />}
      </div>
      <div className="vf-focus" aria-label="Netteté">
        <div style={{ width: `${view.focus * 100}%`, background: focusColor(view.focus) }} />
      </div>
      <p className="vf-hint">{hint}</p>
      <label className="vf-zoom">
        <span>Zoom</span>
        <input type="range" min={1} max={3} step={0.05} value={view.zoom} onChange={(e) => place(cam.current.x, cam.current.y, Number(e.target.value))} aria-label="Zoom" />
      </label>
      <button className="vf-shutter" onClick={() => fire()} aria-label="Déclencher" />
      <button className="vf-lower" onClick={() => fire('rate')}>
        Baisser le téléphone
      </button>
    </div>
  );
}

// ───────────────────────────── Moniteur cardiaque (réveil)
function Monitor({ node, state, send, sendFx }: { node: HeartbeatNode; state: GameState; send: (i: Input) => void; sendFx: (fx: Fx) => void }) {
  const hits = state.heart?.hits ?? 0;
  // Le cœur s'accélère à mesure qu'elle remonte.
  const bpm = node.bpm + hits * 2;
  const period = 60000 / bpm;
  const tolerance = state.settings.extendedTime ? 300 : 190;
  const lastBeat = useRef(performance.now());
  const lastSent = useRef(0);
  const [beat, setBeat] = useState(0);
  const [judge, setJudge] = useState<{ ok: boolean; n: number } | null>(null);

  useEffect(() => {
    let id = 0;
    const schedule = () => {
      const wait = Math.max(0, lastBeat.current + period - performance.now());
      id = window.setTimeout(() => {
        lastBeat.current = performance.now();
        cue('bip');
        sendFx({ kind: 'pulse' });
        setBeat((b) => b + 1);
        schedule();
      }, wait);
    };
    schedule();
    return () => clearTimeout(id);
  }, [period, sendFx]);

  const onTap = (e: React.PointerEvent) => {
    e.preventDefault();
    const t = performance.now();
    const d = Math.min(t - lastBeat.current, lastBeat.current + period - t);
    const ok = d <= tolerance && t - lastSent.current > 450;
    if (ok) {
      lastSent.current = t;
      send({ type: 'hb-beat' });
    }
    setJudge((j) => ({ ok, n: (j?.n ?? 0) + 1 }));
  };

  return (
    <div className="m-monitor" onPointerDown={onTap} role="button" aria-label="Toucher au rythme du cœur">
      <p className="prompt">{node.prompt}</p>
      <div className="mon-screen">
        <div className="mon-vals">
          <span className="mon-bpm">
            {bpm}
            <small>bpm</small>
          </span>
          <span className="mon-spo">
            SpO₂ <b>{91 + Math.min(7, hits)}</b>%
          </span>
        </div>
        <svg className="mon-trace" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60 L300 60" className="mon-flat" />
          <path key={beat} d="M0 60 L90 60 L100 54 L110 60 L125 60 L132 70 L142 10 L152 88 L160 60 L190 60 L205 48 L222 60 L300 60" className="mon-wave" />
        </svg>
        <div key={`h${beat}`} className="mon-heart">♥</div>
      </div>
      <div className="mon-dots" aria-label={`${hits} battements sur ${node.beats}`}>
        {Array.from({ length: node.beats }, (_, i) => (
          <i key={i} className={i < hits ? 'on' : ''} />
        ))}
      </div>
      <p className={`mon-judge ${judge ? (judge.ok ? 'ok' : 'ko') : ''}`} key={judge?.n}>
        {judge ? (judge.ok ? 'Oui… encore.' : 'Pas encore. Écoutez le bip.') : node.instruction}
      </p>
      {state.settings.extendedTime && <p className="small">Temps élargi activé.</p>}
    </div>
  );
}

// ───────────────────────────── Miroir (le nouveau visage)
const MIRROR_CLEAR = 0.55;

function Mirror({ node, send, sendFx }: { node: MirrorNode; send: (i: Input) => void; sendFx: (fx: Fx) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const lastCheck = useRef(0);
  const [clear, setClear] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = c.clientWidth * dpr;
    c.height = c.clientHeight * dpr;
    ctx.fillStyle = 'rgba(222, 230, 234, 0.96)';
    ctx.fillRect(0, 0, c.width, c.height);
    // Quelques traînées plus denses, pour que la buée ait de la matière.
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(245, 248, 250, ${0.15 + Math.random() * 0.25})`;
      ctx.beginPath();
      ctx.arc(Math.random() * c.width, Math.random() * c.height, (10 + Math.random() * 40) * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
    const t = setTimeout(() => setHelp(true), 10000);
    return () => clearTimeout(t);
  }, []);

  const reveal = () => {
    if (clear) return;
    setClear(true);
    cue('succes');
    sendFx({ kind: 'mirror-wipe', value: 1 });
  };

  const measure = () => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let wiped = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 16) {
      total++;
      if (data[i] < 60) wiped++;
    }
    const v = wiped / total;
    sendFx({ kind: 'mirror-wipe', value: Math.min(1, v / MIRROR_CLEAR) });
    if (v >= MIRROR_CLEAR) reveal();
  };

  const wipe = (e: React.PointerEvent) => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx || clear) return;
    const r = c.getBoundingClientRect();
    const k = c.width / r.width;
    const p = { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineWidth = 54 * k;
    ctx.beginPath();
    ctx.moveTo(last.current?.x ?? p.x, last.current?.y ?? p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    const t = performance.now();
    if (t - lastCheck.current > 200) {
      lastCheck.current = t;
      measure();
    }
  };

  return (
    <div className="m-mirror">
      <p className="prompt">{node.prompt}</p>
      <div className={`mirror-frame ${clear ? 'clear' : ''}`}>
        <svg className="mirror-face" viewBox="40 120 320 440" preserveAspectRatio="xMidYMid slice" aria-label={clear ? 'Votre nouveau visage' : 'Un miroir couvert de buée'}>
          <PortraitArt id="alice" mood="neutre" />
        </svg>
        <canvas
          ref={canvas}
          className="mirror-fog"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            last.current = null;
            wipe(e);
          }}
          onPointerMove={(e) => e.buttons && wipe(e)}
          onPointerUp={() => (last.current = null)}
        />
      </div>
      {clear ? (
        <>
          <p className="mirror-text">C’est vous.</p>
          <button className="big-btn" onClick={() => send({ type: 'mirror-done' })}>
            Continuer
          </button>
        </>
      ) : (
        <>
          <p className="mirror-text">{node.instruction}</p>
          {help && (
            <button className="vf-lower" onClick={reveal}>
              Essuyer la buée d’un geste
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ───────────────────────────── Flirt (séduction)
const TONES: { id: FlirtTone; label: string }[] = [
  { id: 'froid', label: 'Froide' },
  { id: 'neutre', label: 'Neutre' },
  { id: 'joueuse', label: 'Joueuse' },
];

function FlirtPhone({ node, state, tap }: { node: FlirtNode; state: GameState; tap: (i: Input) => void }) {
  const f = state.flirt!;
  const thread = state.sms[node.thread];
  const total = thread.messages.length;
  const [tone, setTone] = useState(1);
  const [shown, setShown] = useState(total);
  const end = useRef<HTMLDivElement>(null);

  // Le message de l'autre n'arrive qu'après un petit délai (« écrit… »).
  useEffect(() => {
    if (total <= shown) {
      if (total < shown) setShown(total);
      return;
    }
    const last = thread.messages[total - 1];
    if (last.from === 'eux' && total - shown >= 2) {
      setShown(total - 1);
      const t = setTimeout(() => {
        setShown(total);
        cue('message');
      }, 1500);
      return () => clearTimeout(t);
    }
    setShown(total);
  }, [total]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [shown, state.phone.opened]);

  const typing = shown < total;
  const pct = f.tension;
  const level = pct >= FLIRT_HIGH ? 'haute' : pct <= 25 ? 'basse' : 'moyenne';
  const selected = TONES[tone].id;
  const preview = f.done ? '' : fmt(node.rounds[f.round].replies[selected], state);

  if (!state.phone.opened) {
    return (
      <div className="hp hp-lock" onClick={() => tap({ type: 'sms-open' })}>
        <div className="hp-clock">00:12</div>
        <div className="hp-date">dimanche 15 juin</div>
        <button className="hp-notif">
          <span className="hp-notif-app">MESSAGES · maintenant</span>
          <strong>{node.contact}</strong>
          <span>{thread.messages[0]?.text}</span>
        </button>
        <p className="hp-unlock">Touchez pour ouvrir</p>
      </div>
    );
  }

  return (
    <div className="hp hp-open hp-flirt">
      <div className="hp-bar">
        <span>00:12</span>
        <strong>{node.contact}</strong>
        <span>♡</span>
      </div>
      <div className={`tension tension-${level}`} aria-label={`Tension ${pct} sur 100`}>
        <span>Tension</span>
        <div>
          <i style={{ width: `${pct}%` }} />
        </div>
        <em>{level}</em>
      </div>
      <div className="hp-thread">
        {thread.messages.slice(0, shown).map((m, i) => (
          <div key={i} className={`bubble ${m.from}`}>
            {m.text}
          </div>
        ))}
        {typing && (
          <div className="bubble eux typing" aria-label="Il écrit">
            <i /> <i /> <i />
          </div>
        )}
        <div ref={end} />
      </div>
      <div className="hp-replies">
        {f.done ? (
          <button className="hp-reply done" disabled={typing} onClick={() => tap({ type: 'flirt-end' })}>
            Ranger le téléphone
          </button>
        ) : (
          <>
            <div className="tone-slider" role="radiogroup" aria-label="Ton de la réponse">
              <input type="range" min={0} max={2} step={1} value={tone} onChange={(e) => setTone(Number(e.target.value))} aria-label="Ton" />
              <div>
                {TONES.map((t, i) => (
                  <span key={t.id} className={i === tone ? 'on' : ''} onClick={() => setTone(i)}>
                    {t.label}
                    <small>{FLIRT_DELTA[t.id] > 0 ? '↑' : FLIRT_DELTA[t.id] < 0 ? '↓' : '·'}</small>
                  </span>
                ))}
              </div>
            </div>
            <p className="reply-preview">{preview}</p>
            <button
              className="hp-reply send"
              disabled={typing}
              onClick={() => {
                tap({ type: 'flirt-send', tone: selected });
                setTone(1);
              }}
            >
              Envoyer
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────── Saisie
function TextInput({ prompt, suggestions, onSubmit }: { prompt: string; suggestions: string[]; onSubmit: (t: string) => void }) {
  const [text, setText] = useState(suggestions[0] ?? '');
  return (
    <form
      className="m-input"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim().length >= 2) onSubmit(text);
      }}
    >
      <p className="prompt">{prompt}</p>
      <div className="terminal">
        <span className="caret">›</span>
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={24} autoComplete="off" autoCapitalize="words" spellCheck={false} aria-label={prompt} />
      </div>
      <div className="chips">
        {suggestions.map((s) => (
          <button type="button" key={s} className="chip" onClick={() => setText(s)}>
            {s}
          </button>
        ))}
      </div>
      <button className="big-btn" type="submit" disabled={text.trim().length < 2}>
        Valider
      </button>
    </form>
  );
}

// ───────────────────────────── Dossier
function Dossier({ story, state, send }: { story: Story; state: GameState; send: (i: Input) => void }) {
  const [tab, setTab] = useState<'indices' | 'messages' | 'reglages'>('indices');
  const [mute, setMute] = useState(false);
  return (
    <div className="m-dossier">
      <div className="tabs" role="tablist">
        {(['indices', 'messages', 'reglages'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t === 'indices' ? 'Indices' : t === 'messages' ? 'Messages' : 'Réglages'}
          </button>
        ))}
      </div>
      {tab === 'indices' &&
        (state.clues.length ? (
          <ul className="clues">
            {state.clues.map((c) => (
              <li key={c}>
                <strong>{story.clues[c].title}</strong>
                <span>{story.clues[c].text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="small">Aucun indice pour l’instant.</p>
        ))}
      {tab === 'messages' &&
        (Object.keys(state.sms).length ? (
          Object.entries(state.sms).map(([id, th]) => (
            <div key={id} className="dossier-thread">
              <strong>{th.contact}</strong>
              {th.messages.map((m, i) => (
                <p key={i} className={m.from}>
                  {m.photo ? `📷 ${story.photos[m.photo]?.caption}` : m.text}
                </p>
              ))}
            </div>
          ))
        ) : (
          <p className="small">Aucun message.</p>
        ))}
      {tab === 'reglages' && (
        <div className="settings">
          <Toggle label="Temps élargi pour les actions" checked={state.settings.extendedTime} onChange={(v) => send({ type: 'settings', extendedTime: v })} />
          <Toggle
            label="Couper les sons du téléphone"
            checked={mute}
            onChange={(v) => {
              setMute(v);
              setMuted(v);
            }}
          />
        </div>
      )}
    </div>
  );
}
