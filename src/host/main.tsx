import { StrictMode, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import { phoneMode, PHONE_MODE_LABEL, type GameState, type Input, type PhoneMode } from '../../shared/engine.ts';
import type { ControllerStatus, Fx, ServerMsg } from '../../shared/protocol.ts';
import { episode1 } from '../../shared/story/episode1.ts';
import { Decor } from '../common/art/Decor.tsx';
import { unlockAudio } from '../common/feedback.ts';
import { useLink, type Link } from '../common/net.ts';
import { ControllerView } from '../controller/ControllerView.tsx';
import { Stage, type LiveFx } from './Stage.tsx';
import '../styles/host.css';
import '../styles/controller.css';

const story = episode1;
const KEY = 'lotissement.ecran';

interface HostSession {
  sessionId: string;
  hostKey: string;
  pairToken: string | null;
  pairExpiresAt: number | null;
  lanAddresses: string[];
  port: number;
}

function joinUrl(s: HostSession): string | null {
  if (!s.pairToken) return null;
  const local = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(location.hostname);
  const base = local && s.lanAddresses[0] ? `${location.protocol}//${s.lanAddresses[0]}:${location.port || s.port}` : location.origin;
  return `${base}/m#${s.pairToken}`;
}

function Qr({ url }: { url: string }) {
  const [svg, setSvg] = useState('');
  useEffect(() => {
    QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#1A1416', light: '#F3EDE2' } }).then(setSvg, () => setSvg(''));
  }, [url]);
  return <div className="qr" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function PairingPanel({ session, status, compact = false }: { session: HostSession; status: ControllerStatus; compact?: boolean }) {
  const url = joinUrl(session);
  if (!url) return null;
  return (
    <div className={`pairing ${compact ? 'compact' : ''}`}>
      <Qr url={url} />
      <div className="pairing-text">
        <p className="pairing-title">Scannez avec votre téléphone</p>
        <p>Il deviendra votre manette, puis le téléphone de l’héroïne, un digicode…</p>
        <p className="url">{url.replace(/#.*/, '')}</p>
        <p className="small">Téléphone et ordinateur doivent être sur le même réseau Wi-Fi. Le code expire au bout de 10 minutes.</p>
        {status === 'deconnectee' && <p className="small warn">Scanner ce code remplacera la manette actuelle.</p>}
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<HostSession | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [ctrl, setCtrl] = useState<ControllerStatus>('aucune');
  const [offset, setOffset] = useState(0);
  const [solo, setSolo] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [live, setLive] = useState<LiveFx>({ keypadEntry: '', qteProgress: 0, navHover: null });

  const applyFx = useCallback((fx: Fx) => {
    setLive((l) =>
      fx.kind === 'keypad-entry' ? { ...l, keypadEntry: fx.value } : fx.kind === 'qte-progress' ? { ...l, qteProgress: fx.value } : fx.kind === 'nav-hover' ? { ...l, navHover: fx.spot } : l,
    );
  }, []);

  const onOpen = useCallback((l: Link) => {
    let saved: { sessionId?: string; hostKey?: string } = {};
    try {
      saved = JSON.parse(sessionStorage.getItem(KEY) ?? '{}');
    } catch {
      /* nouvelle session */
    }
    l.send({ t: 'host-hello', ...saved });
  }, []);

  const onMessage = useCallback(
    (m: ServerMsg) => {
      switch (m.t) {
        case 'host-session':
          setSession(m);
          try {
            sessionStorage.setItem(KEY, JSON.stringify({ sessionId: m.sessionId, hostKey: m.hostKey }));
          } catch {
            /* rechargement = nouvelle partie */
          }
          break;
        case 'state':
          setState(m.state);
          setOffset(m.serverTime - Date.now());
          break;
        case 'controller':
          setCtrl(m.status);
          break;
        case 'fx':
          applyFx(m.fx);
          break;
      }
    },
    [applyFx],
  );

  const [link, net] = useLink(onOpen, onMessage);
  const send = useCallback((input: Input) => link?.send({ t: 'input', input }), [link]);

  // Annonce visuelle de la transformation du téléphone.
  const mode: PhoneMode | null = state ? phoneMode(story, state) : null;
  const prevMode = useRef<PhoneMode | null>(null);
  useEffect(() => {
    if (!mode) return;
    if (prevMode.current && prevMode.current !== mode && mode !== 'telecommande' && mode !== 'fin') {
      setToast(`Votre téléphone devient : ${PHONE_MODE_LABEL[mode]}`);
      const t = setTimeout(() => setToast(null), 2600);
      prevMode.current = mode;
      return () => clearTimeout(t);
    }
    prevMode.current = mode;
  }, [mode]);

  // Réinitialise les effets éphémères à chaque changement de nœud.
  useEffect(() => setLive({ keypadEntry: '', qteProgress: 0, navHover: null }), [state?.nodeId]);

  // En mode sans téléphone, le clavier fait avancer les dialogues.
  useEffect(() => {
    if (!solo) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'BUTTON') {
        e.preventDefault();
        send({ type: 'advance' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [solo, send]);

  const phoneMissing = !solo && state?.started && ctrl !== 'connectee';

  return (
    <div className={`host ${solo ? 'with-solo' : ''}`} onPointerDown={unlockAudio}>
      <div className="frame">
        {state && state.started ? (
          <Stage story={story} state={state} live={live} serverOffset={offset} />
        ) : (
          <div className="stage lobby">
            <div className="decor-layer blurred">
              <Decor decor="allee" time="nuit" />
            </div>
            <div className="lobby-content">
              <p className="kicker">Série dramatique interactive · Épisode 1</p>
              <h1 className="brand-title">Le Lotissement</h1>
              <p className="tagline">
                Un quartier tranquille. Une femme qu’on croyait morte.
                <br />
                Dix ans de silence. Une identité empruntée.
              </p>
              {session && ctrl !== 'connectee' && !solo && <PairingPanel session={session} status={ctrl} />}
              {ctrl === 'connectee' && !solo && (
                <div className="lobby-ready">
                  <p className="ok">● Téléphone connecté</p>
                  <p>Appuyez sur « Commencer » sur votre téléphone.</p>
                </div>
              )}
              <div className="lobby-actions">
                {state && (
                  <label className="toggle light">
                    <input type="checkbox" checked={state.settings.extendedTime} onChange={(e) => send({ type: 'settings', extendedTime: e.target.checked })} />
                    <span className="toggle-track" />
                    <span>Temps élargi pour les actions</span>
                  </label>
                )}
                {!solo ? (
                  <button className="ghost-btn" onClick={() => setSolo(true)}>
                    Jouer sans téléphone
                  </button>
                ) : (
                  <button className="ghost-btn" onClick={() => setSolo(false)}>
                    Utiliser un téléphone
                  </button>
                )}
              </div>
              {net !== 'connecte' && <p className="small warn">Connexion au serveur…</p>}
            </div>
          </div>
        )}

        {state?.started && (
          <div className="hud">
            <div className={`phone-pill ${solo ? 'solo' : ctrl}`}>
              <span className="dot" />
              {solo ? 'Sans téléphone' : ctrl === 'connectee' ? `Téléphone · ${mode ? PHONE_MODE_LABEL[mode] : ''}` : 'Téléphone déconnecté'}
            </div>
            <button className="menu-btn" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
              Menu
            </button>
          </div>
        )}

        {toast && !solo && (
          <div className="mode-toast" key={toast}>
            <div className="mini-phone">
              <span />
            </div>
            {toast}
          </div>
        )}

        {phoneMissing && session && (
          <div className="reconnect-banner">
            <p>
              <strong>Téléphone déconnecté.</strong> Il se reconnectera automatiquement dès qu’il retrouvera le réseau.
            </p>
            {ctrl === 'deconnectee' && !menu && (
              <button className="ghost-btn" onClick={() => setMenu(true)}>
                Afficher le QR code
              </button>
            )}
            {ctrl === 'aucune' && <PairingPanel session={session} status={ctrl} compact />}
          </div>
        )}

        {menu && session && (
          <div className="menu-panel">
            <h3>Menu</h3>
            {!solo && <PairingPanel session={session} status={ctrl} compact />}
            {!solo && ctrl !== 'aucune' && (
              <button className="ghost-btn" onClick={() => link?.send({ t: 'host-new-pairing' })}>
                Déconnecter le téléphone et générer un nouveau code
              </button>
            )}
            <button className="ghost-btn" onClick={() => setSolo((s) => !s)}>
              {solo ? 'Revenir au téléphone' : 'Continuer sans téléphone'}
            </button>
            {state && (
              <label className="toggle light">
                <input type="checkbox" checked={state.settings.extendedTime} onChange={(e) => send({ type: 'settings', extendedTime: e.target.checked })} />
                <span className="toggle-track" />
                <span>Temps élargi pour les actions</span>
              </label>
            )}
            <button
              className="ghost-btn danger"
              onClick={() => {
                if (confirm('Recommencer l’épisode depuis le début ?')) {
                  send({ type: 'restart' });
                  setMenu(false);
                }
              }}
            >
              Recommencer l’épisode
            </button>
            <button className="ghost-btn" onClick={() => setMenu(false)}>
              Fermer
            </button>
          </div>
        )}
      </div>

      {solo && state && (
        <aside className="solo-phone">
          <div className="phone-frame">
            <ControllerView story={story} state={state} send={send} sendFx={applyFx} connection="solo" serverOffset={offset} />
          </div>
        </aside>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
