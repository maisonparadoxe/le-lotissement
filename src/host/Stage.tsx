// La scène sur l'écran principal : décor, personnages, dialogues, et le
// reflet de ce que fait le téléphone (digicode, photo, QTE…).

import { useEffect, useState } from 'react';
import { availableSpots, currentNode, flirtLevel, fmt, type GameState } from '../../shared/engine.ts';
import type { Story } from '../../shared/types.ts';
import { Decor } from '../common/art/Decor.tsx';
import { Photo } from '../common/art/Photo.tsx';
import { Portrait } from '../common/art/Portrait.tsx';
import { EndSummary } from '../common/EndSummary.tsx';
import { ViewfinderWorld, VIEW_DEFAULT, type ViewfinderView } from '../common/ViewfinderWorld.tsx';

export interface LiveFx {
  keypadEntry: string;
  qteProgress: number;
  navHover: string | null;
  vf: ViewfinderView;
  /** Compteur de bips du moniteur, pour faire battre l'écran. */
  pulse: number;
  mirrorWipe: number;
}

export const LIVE_DEFAULT: LiveFx = { keypadEntry: '', qteProgress: 0, navHover: null, vf: VIEW_DEFAULT, pulse: 0, mirrorWipe: 0 };

export type TextSpeed = 'normale' | 'rapide' | 'instantanee';
const SPEED_MS: Record<TextSpeed, number> = { normale: 22, rapide: 8, instantanee: 0 };

function Typewriter({ text, speed = 22 }: { text: string; speed?: number }) {
  const [n, setN] = useState(speed === 0 ? text.length : 0);
  useEffect(() => {
    if (speed === 0) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = setInterval(() => setN((x) => (x >= text.length ? (clearInterval(id), x) : x + 1)), speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <>
      <span>{text.slice(0, n)}</span>
      <span className="tw-rest" aria-hidden="true">
        {text.slice(n)}
      </span>
    </>
  );
}

export function Stage({
  story,
  state,
  live,
  serverOffset,
  textSpeed = 'normale',
}: {
  story: Story;
  state: GameState;
  live: LiveFx;
  serverOffset: number;
  textSpeed?: TextSpeed;
}) {
  const node = currentNode(story, state);
  const { stage } = node;
  const speaker = node.type === 'line' ? node.speaker : undefined;
  const photo = state.phone.photo ?? stage.photo;
  // Réveil : l'image sort du noir et du flou à chaque battement juste.
  const wake = node.type === 'heartbeat' ? (state.heart?.hits ?? 0) / node.beats : null;
  const decorStyle =
    wake === null ? undefined : { filter: `brightness(${0.04 + 0.96 * wake}) blur(${(1 - wake) * 12}px)`, transition: 'filter 1.2s ease' };

  return (
    <div className={`stage time-${stage.time}`}>
      <div className="decor-layer" key={`${stage.decor}-${stage.time}`} style={decorStyle}>
        <Decor decor={stage.decor} time={stage.time} />
      </div>

      <div className="cast">
        {stage.cast.map((c) => (
          <div
            key={c.id}
            className={`actor pos-${c.pos} ${speaker && speaker !== 'heroine' ? (speaker === c.id ? 'speaking' : 'dim') : ''}`}
          >
            <Portrait id={c.id} mood={c.mood} />
          </div>
        ))}
      </div>

      {node.type === 'explore' && (
        <div className="hotspots">
          {availableSpots(node, state).map((sp, i) => {
            const active = live.navHover ? live.navHover === sp.id : i === state.nav.cursor;
            const seen = state.visited.includes(`${node.id}:${sp.id}`);
            return (
              <div key={sp.id} className={`hotspot ${active ? 'active' : ''} ${seen ? 'seen' : ''} ${sp.exit ? 'exit' : ''}`} style={{ left: `${sp.at[0]}%`, top: `${sp.at[1]}%` }}>
                <span className="hs-ring" />
                <span className="hs-label">{sp.label}</span>
              </div>
            );
          })}
          <div className="explore-banner">
            <span>Explorer</span> {node.prompt}
          </div>
        </div>
      )}

      {node.type === 'title' && (
        <div className="title-card">
          <p className="kicker">{node.kicker}</p>
          <h1>{node.title}</h1>
        </div>
      )}

      {node.type === 'line' && (
        <div className={`dialogue ${node.memory ? 'memory' : ''} ${!node.speaker && !node.memory ? 'narration' : ''}`} key={node.id}>
          {node.memory && <p className="who">Souvenir · fragmentaire</p>}
          {node.speaker && <p className="who">{node.speaker === 'heroine' ? state.alias : story.characters[node.speaker].name}</p>}
          <p className="text">
            <Typewriter text={fmt(node.text, state)} speed={SPEED_MS[textSpeed]} />
          </p>
        </div>
      )}

      {node.type === 'choice' && (
        <div className="dialogue prompt-box">
          <p className="text">{fmt(node.prompt, state)}</p>
          <p className="phone-hint">Choisissez votre réplique sur le téléphone</p>
        </div>
      )}

      {node.type === 'input' && (
        <div className="dialogue prompt-box">
          <p className="text">{node.prompt}</p>
          <p className="phone-hint">Saisissez-le sur le téléphone</p>
        </div>
      )}

      {node.type === 'viewfinder' && (
        <div className="vf-stage">
          <ViewfinderWorld view={live.vf} />
          <div className="dialogue prompt-box vf-prompt">
            <p className="text">{node.prompt}</p>
            <p className="phone-hint">Votre téléphone est devenu un viseur : glissez pour cadrer, zoomez, restez immobile</p>
          </div>
        </div>
      )}

      {node.type === 'heartbeat' && (
        <>
          {live.pulse > 0 && <div className="hb-pulse" key={live.pulse} />}
          <div className="dialogue prompt-box hb-prompt">
            <p className="text">{node.prompt}</p>
            <p className="phone-hint">Votre téléphone est devenu un moniteur cardiaque : touchez-le à chaque bip</p>
          </div>
        </>
      )}

      {node.type === 'mirror' && (
        <div className="mirror-stage">
          <div className="polaroid" style={{ opacity: 0.12 + 0.88 * live.mirrorWipe }}>
            <Photo id={node.photo} />
            <p>{story.photos[node.photo]?.caption}</p>
          </div>
          <div className="dialogue prompt-box">
            <p className="text">{node.prompt}</p>
            <p className="phone-hint">Votre téléphone est devenu un miroir : essuyez la buée</p>
          </div>
        </div>
      )}

      {node.type === 'flirt' && state.flirt && (
        <div className={`sms-notice flirt-notice tension-${flirtLevel(state.flirt.tension)}`}>
          <div className="mini-phone">
            <span />
          </div>
          <div>
            <p className="who">{state.phone.opened ? 'Vous échangez des messages' : 'Nouveau message'}</p>
            <p className="text">{node.contact}</p>
            <div className="flirt-meter" aria-label={`Tension ${state.flirt.tension} sur 100`}>
              <span>Tension</span>
              <div>
                <i style={{ width: `${state.flirt.tension}%` }} />
              </div>
            </div>
            <p className="phone-hint">{state.phone.opened ? 'Dosez votre ton sur le téléphone' : 'Regardez votre téléphone'}</p>
          </div>
        </div>
      )}

      {node.type === 'sms' && !photo && (
        <div className={`sms-notice ${state.phone.opened ? 'opened' : ''}`}>
          <div className="mini-phone">
            <span />
          </div>
          <div>
            <p className="who">{state.phone.opened ? 'Vous lisez vos messages' : 'Nouveau message'}</p>
            <p className="text">{node.contact}</p>
            <p className="phone-hint">{state.phone.opened ? 'La conversation est sur votre téléphone' : 'Regardez votre téléphone'}</p>
          </div>
        </div>
      )}

      {photo && (
        <div className="photo-overlay">
          <div className="polaroid">
            <Photo id={photo} />
            <p>{story.photos[photo]?.caption}</p>
          </div>
        </div>
      )}

      {node.type === 'keypad' && (
        <div className="keypad-closeup">
          <div className="kc-device">
            <div className={`kc-led ${state.keypad.error && !live.keypadEntry ? 'err' : ''}`} />
            <div className="kc-screen">
              {Array.from({ length: node.code.length }, (_, i) => (
                <span key={i} className={live.keypadEntry[i] ? 'on' : ''}>
                  {live.keypadEntry[i] ? '•' : ''}
                </span>
              ))}
            </div>
            <div className="kc-keys">
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
          </div>
          <div className="dialogue prompt-box">
            <p className="text">{node.prompt}</p>
            {node.hints
              .filter((h) => state.keypad.attempts >= h.after)
              .slice(-1)
              .map((h) => (
                <p key={h.after} className="hint-line">
                  {h.text}
                </p>
              ))}
            <p className="phone-hint">Votre téléphone est devenu un digicode</p>
          </div>
        </div>
      )}

      {node.type === 'qte' && <QteOverlay prompt={node.prompt} state={state} progress={live.qteProgress} serverOffset={serverOffset} />}

      {node.type === 'end' && (
        <div className="end-overlay">
          <EndSummary story={story} state={state} />
          <p className="phone-hint">Merci d’avoir joué. Vous pouvez rejouer depuis le téléphone.</p>
        </div>
      )}
    </div>
  );
}

function QteOverlay({ prompt, state, progress, serverOffset }: { prompt: string; state: GameState; progress: number; serverOffset: number }) {
  const [left, setLeft] = useState(1);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (state.qte) {
        const total = state.qte.deadline - state.qte.startedAt;
        setLeft(Math.max(0, (state.qte.deadline - (Date.now() + serverOffset)) / total));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state.qte, serverOffset]);
  return (
    <div className="qte-overlay">
      <div className="torch-beam" />
      <div className="qte-box">
        <p className="qte-prompt">{prompt}</p>
        <div className="qte-meter">
          <div style={{ transform: `scaleX(${progress})` }} />
        </div>
        <div className="qte-clock">
          <div style={{ transform: `scaleX(${left})` }} />
        </div>
        <p className="phone-hint">Maintenez le bouton du téléphone</p>
      </div>
    </div>
  );
}
