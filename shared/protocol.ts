// Messages échangés entre le serveur, l'écran principal (« host ») et le
// téléphone (« manette ») sur la WebSocket /ws.

import type { GameState, Input } from './engine.ts';

/** Effets éphémères relayés tels quels de la manette vers l'écran (non persistés). */
export type Fx =
  | { kind: 'keypad-entry'; value: string }
  | { kind: 'qte-progress'; value: number }
  | { kind: 'nav-hover'; spot: string | null }
  | { kind: 'ping' };

export type ClientMsg =
  | { t: 'host-hello'; sessionId?: string; hostKey?: string }
  | { t: 'host-new-pairing' }
  | { t: 'ctrl-hello'; pairToken: string }
  | { t: 'ctrl-resume'; sessionId: string; deviceKey: string }
  | { t: 'input'; input: Input }
  | { t: 'fx'; fx: Fx };

export type ControllerStatus = 'aucune' | 'connectee' | 'deconnectee';

export type ErrorCode = 'jeton-invalide' | 'jeton-expire' | 'session-introuvable' | 'trop-de-tentatives' | 'revoquee' | 'message-invalide';

export type ServerMsg =
  | {
      t: 'host-session';
      sessionId: string;
      hostKey: string;
      pairToken: string | null;
      pairExpiresAt: number | null;
      lanAddresses: string[];
      port: number;
    }
  | { t: 'paired'; sessionId: string; deviceKey: string }
  | { t: 'state'; state: GameState; serverTime: number }
  | { t: 'controller'; status: ControllerStatus }
  | { t: 'fx'; fx: Fx }
  | { t: 'error'; code: ErrorCode; message: string };
