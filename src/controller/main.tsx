import { StrictMode, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { GameState, Input } from '../../shared/engine.ts';
import type { Fx, ServerMsg } from '../../shared/protocol.ts';
import { episode1 } from '../../shared/story/episode1.ts';
import { unlockAudio } from '../common/feedback.ts';
import { storage, useLink, type Link } from '../common/net.ts';
import { ControllerView } from './ControllerView.tsx';
import '../styles/controller.css';

const KEY = 'lotissement.manette';

// Le jeton d'appairage arrive dans le fragment de l'URL (#…) : il n'est
// jamais envoyé au serveur HTTP ni journalisé. On l'efface aussitôt lu.
const pairToken = location.hash.slice(1) || null;
if (pairToken) history.replaceState(null, '', location.pathname);

function readSaved(): { sessionId: string; deviceKey: string } | null {
  try {
    return JSON.parse(storage.get(KEY) ?? 'null');
  } catch {
    return null;
  }
}

function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const pending = useRef(pairToken);

  const onOpen = useCallback((l: Link) => {
    const saved = readSaved();
    if (pending.current) l.send({ t: 'ctrl-hello', pairToken: pending.current });
    else if (saved) l.send({ t: 'ctrl-resume', ...saved });
    else setError('Scannez le QR code affiché sur l’écran de l’ordinateur pour relier ce téléphone.');
  }, []);

  const onMessage = useCallback((m: ServerMsg) => {
    switch (m.t) {
      case 'paired':
        pending.current = null;
        storage.set(KEY, JSON.stringify({ sessionId: m.sessionId, deviceKey: m.deviceKey }));
        setError(null);
        break;
      case 'state':
        setState(m.state);
        setOffset(m.serverTime - Date.now());
        break;
      case 'error':
        if (m.code !== 'message-invalide') {
          pending.current = null;
          if (m.code === 'revoquee' || m.code === 'session-introuvable') storage.del(KEY);
          setState(null);
        }
        setError(m.message);
        break;
    }
  }, []);

  const [link, status] = useLink(onOpen, onMessage);

  // Garder l'écran du téléphone allumé pendant la partie (si le navigateur le permet).
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const req = async () => {
      try {
        lock = (await navigator.wakeLock?.request('screen')) ?? null;
      } catch {
        /* indisponible hors HTTPS */
      }
    };
    void req();
    const onVis = () => document.visibilityState === 'visible' && void req();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      void lock?.release();
    };
  }, []);

  const send = useCallback((input: Input) => link?.send({ t: 'input', input }), [link]);
  const sendFx = useCallback((fx: Fx) => link?.send({ t: 'fx', fx }), [link]);

  return (
    <div className="ctrl-shell" onPointerDown={unlockAudio}>
      {state && !error ? (
        <ControllerView story={episode1} state={state} send={send} sendFx={sendFx} connection={status} serverOffset={offset} />
      ) : (
        <div className="ctrl-message">
          <h1 className="brand">Le Lotissement</h1>
          <p>{error ?? (status === 'connecte' ? 'Connexion à la partie…' : 'Connexion au serveur…')}</p>
        </div>
      )}
      {state && status === 'reconnexion' && <div className="ctrl-offline">Réseau perdu — reconnexion…</div>}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
