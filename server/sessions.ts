// Sessions de jeu : sans compte, éphémères, reliées par QR code.
//
// Sécurité minimale (bible, section 10) :
// - le QR code contient un jeton d'appairage aléatoire de 128 bits, à usage
//   unique et qui expire au bout de 10 minutes ;
// - une fois appairé, le téléphone reçoit une clé d'appareil (256 bits) qui
//   lui permet de se reconnecter s'il perd le réseau ;
// - l'écran peut révoquer la manette et générer un nouveau QR code ;
// - les tentatives d'appairage échouées sont limitées par adresse IP.

import { randomBytes, timingSafeEqual } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import type { WebSocket } from 'ws';
import { applyInput, initialState, tick, type GameState, type Input } from '../shared/engine.ts';
import type { ControllerStatus, ServerMsg } from '../shared/protocol.ts';
import { episode1 } from '../shared/story/episode1.ts';

export const PAIR_TOKEN_TTL_MS = 10 * 60_000;
export const SESSION_IDLE_TTL_MS = 30 * 60_000;
export const SESSION_MAX_AGE_MS = 12 * 3600_000;

const story = episode1;
const token = (bytes: number) => randomBytes(bytes).toString('base64url');

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export class Session {
  readonly id = token(16);
  readonly hostKey = token(32);
  readonly createdAt = Date.now();
  lastActivity = Date.now();
  pairToken: string | null = null;
  pairExpiresAt: number | null = null;
  deviceKey: string | null = null;
  hosts = new Set<WebSocket>();
  controller: WebSocket | null = null;
  state: GameState = initialState(story, Date.now());
  private qteTimer: NodeJS.Timeout | null = null;
  private lastNode = '';

  constructor(private readonly log: PlaytestLog | null) {
    this.newPairing();
  }

  newPairing(): void {
    this.pairToken = token(16);
    this.pairExpiresAt = Date.now() + PAIR_TOKEN_TTL_MS;
  }

  /** Révoque la manette actuelle et génère un nouveau QR code. */
  revokeController(): void {
    this.deviceKey = null;
    if (this.controller) {
      send(this.controller, { t: 'error', code: 'revoquee', message: 'Cette manette a été déconnectée depuis l’écran.' });
      this.controller.close(4001, 'revoquee');
      this.controller = null;
    }
    this.newPairing();
  }

  pair(ws: WebSocket): string {
    if (this.controller && this.controller !== ws) this.controller.close(4002, 'remplacee');
    this.deviceKey = token(32);
    this.pairToken = null;
    this.pairExpiresAt = null;
    this.controller = ws;
    return this.deviceKey;
  }

  controllerStatus(): ControllerStatus {
    if (this.controller) return 'connectee';
    return this.deviceKey ? 'deconnectee' : 'aucune';
  }

  hostInfo(lanAddresses: string[], port: number): ServerMsg {
    return {
      t: 'host-session',
      sessionId: this.id,
      hostKey: this.hostKey,
      pairToken: this.pairToken,
      pairExpiresAt: this.pairExpiresAt,
      lanAddresses,
      port,
    };
  }

  broadcast(msg: ServerMsg): void {
    for (const h of this.hosts) send(h, msg);
    if (this.controller) send(this.controller, msg);
  }

  toHosts(msg: ServerMsg): void {
    for (const h of this.hosts) send(h, msg);
  }

  stateMsg(): ServerMsg {
    return { t: 'state', state: this.state, serverTime: Date.now() };
  }

  handleInput(input: Input, from: 'ecran' | 'manette'): void {
    this.lastActivity = Date.now();
    const next = applyInput(story, this.state, input, Date.now());
    if (!next) return;
    this.setState(next, from, input);
  }

  private setState(next: GameState, from: string, input?: Input): void {
    this.state = next;
    this.broadcast(this.stateMsg());
    this.scheduleQte();
    if (this.log && next.nodeId !== this.lastNode) {
      this.lastNode = next.nodeId;
      void this.log.write({ session: this.id, node: next.nodeId, from, input: input?.type, ending: next.ending });
    }
  }

  private scheduleQte(): void {
    if (this.qteTimer) clearTimeout(this.qteTimer);
    this.qteTimer = null;
    const q = this.state.qte;
    if (!q) return;
    this.qteTimer = setTimeout(() => {
      const next = tick(story, this.state, Date.now());
      if (next) this.setState(next, 'minuterie');
    }, Math.max(0, q.deadline - Date.now()) + 600);
  }

  expired(now: number): boolean {
    const idle = this.hosts.size === 0 && !this.controller && now - this.lastActivity > SESSION_IDLE_TTL_MS;
    return idle || now - this.createdAt > SESSION_MAX_AGE_MS;
  }

  dispose(): void {
    if (this.qteTimer) clearTimeout(this.qteTimer);
    for (const h of this.hosts) h.close(4003, 'expiree');
    this.controller?.close(4003, 'expiree');
  }
}

export function send(ws: WebSocket, msg: ServerMsg): void {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

/** Limitation des tentatives d'appairage échouées, par IP. */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  constructor(
    private readonly max = 10,
    private readonly windowMs = 60_000,
  ) {}
  blocked(key: string, now = Date.now()): boolean {
    const list = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    this.hits.set(key, list);
    return list.length >= this.max;
  }
  fail(key: string, now = Date.now()): void {
    const list = this.hits.get(key) ?? [];
    list.push(now);
    this.hits.set(key, list);
  }
  sweep(now = Date.now()): void {
    for (const [k, v] of this.hits) if (!v.some((t) => now - t < this.windowMs)) this.hits.delete(k);
  }
}

/** Journal des parties de test (PLAYTEST_LOG=1), pour la validation publique. */
export class PlaytestLog {
  constructor(private readonly file = 'logs/playtests.jsonl') {}
  async write(entry: Record<string, unknown>): Promise<void> {
    try {
      await mkdir('logs', { recursive: true });
      await appendFile(this.file, JSON.stringify({ t: new Date().toISOString(), ...entry }) + '\n');
    } catch {
      // le journal ne doit jamais interrompre une partie
    }
  }
}
