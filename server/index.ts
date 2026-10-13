// Serveur unique : sert l'écran principal (/), la manette (/m) et la
// synchronisation temps réel (WebSocket /ws). En développement, Vite est
// branché en middleware ; en production, on sert le dossier dist/.

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { networkInterfaces } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';
import { WebSocketServer, type WebSocket } from 'ws';
import type { Input } from '../shared/engine.ts';
import type { ClientMsg } from '../shared/protocol.ts';
import { PlaytestLog, RateLimiter, safeEqual, send, Session } from './sessions.ts';

const PORT = Number(process.env.PORT ?? 3000);
const PROD = process.env.NODE_ENV === 'production';
const ROOT = resolve(import.meta.dirname, '..');
const log = process.env.PLAYTEST_LOG === '1' ? new PlaytestLog() : null;

const sessions = new Map<string, Session>();
const byPairToken = new Map<string, Session>();
const limiter = new RateLimiter();

function lanAddresses(): string[] {
  return Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i!.address);
}

function indexPairToken(s: Session): void {
  for (const [t, sess] of byPairToken) if (sess === s) byPairToken.delete(t);
  if (s.pairToken) byPairToken.set(s.pairToken, s);
}

// ───────────────────────────── HTTP
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

function serveStatic(req: IncomingMessage, res: ServerResponse): void {
  const dist = join(ROOT, 'dist');
  const url = new URL(req.url ?? '/', 'http://x');
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  if (path === '/' || path === '') path = '/index.html';
  const file = join(dist, path);
  if (!file.startsWith(dist) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404).end('Introuvable');
    return;
  }
  const headers: Record<string, string> = { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' };
  if (path.startsWith('/assets/')) headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  res.writeHead(200, headers);
  createReadStream(file).pipe(res);
}

const vite = PROD
  ? null
  : await (await import('vite')).createServer({ root: ROOT, server: { middlewareMode: true, hmr: { port: PORT + 1 } }, appType: 'mpa' });

const server = createServer((req, res) => {
  // /m → page de la manette (l'URL courte encodée dans le QR code)
  if (req.url === '/m' || req.url?.startsWith('/m?') || req.url?.startsWith('/m#')) req.url = '/controller.html';
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
    return;
  }
  if (vite) vite.middlewares(req, res, () => res.writeHead(404).end('Introuvable'));
  else serveStatic(req, res);
});

// ───────────────────────────── WebSocket
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 16 * 1024 });

wss.on('connection', (ws: WebSocket, req) => {
  const ip = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() || req.socket.remoteAddress || '?';
  let session: Session | null = null;
  let role: 'ecran' | 'manette' | null = null;
  let alive = true;
  ws.on('pong', () => (alive = true));
  const heartbeat = setInterval(() => {
    if (!alive) return ws.terminate();
    alive = false;
    ws.ping();
  }, 15_000);

  const fail = (code: Parameters<typeof send>[1] & { t: 'error' }) => send(ws, code);

  ws.on('message', (raw) => {
    let msg: ClientMsg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return fail({ t: 'error', code: 'message-invalide', message: 'Message illisible.' });
    }

    switch (msg.t) {
      case 'host-hello': {
        let s = msg.sessionId ? sessions.get(msg.sessionId) : undefined;
        if (s && !(msg.hostKey && safeEqual(msg.hostKey, s.hostKey))) s = undefined;
        if (!s) {
          s = new Session(log);
          sessions.set(s.id, s);
        }
        session = s;
        role = 'ecran';
        s.hosts.add(ws);
        if (s.pairToken && s.pairExpiresAt && s.pairExpiresAt < Date.now()) s.newPairing();
        indexPairToken(s);
        send(ws, s.hostInfo(lanAddresses(), PORT));
        send(ws, s.stateMsg());
        send(ws, { t: 'controller', status: s.controllerStatus() });
        return;
      }

      case 'host-new-pairing': {
        if (role !== 'ecran' || !session) return;
        session.revokeController();
        indexPairToken(session);
        session.toHosts(session.hostInfo(lanAddresses(), PORT));
        session.toHosts({ t: 'controller', status: session.controllerStatus() });
        return;
      }

      case 'ctrl-hello': {
        if (limiter.blocked(ip)) return fail({ t: 'error', code: 'trop-de-tentatives', message: 'Trop de tentatives. Réessayez dans une minute.' });
        const s = typeof msg.pairToken === 'string' ? byPairToken.get(msg.pairToken) : undefined;
        if (!s) {
          limiter.fail(ip);
          return fail({ t: 'error', code: 'jeton-invalide', message: 'Ce QR code n’est plus valide. Scannez celui affiché à l’écran.' });
        }
        if (!s.pairExpiresAt || s.pairExpiresAt < Date.now()) {
          byPairToken.delete(msg.pairToken);
          return fail({ t: 'error', code: 'jeton-expire', message: 'Ce QR code a expiré. Un nouveau code va s’afficher à l’écran.' });
        }
        byPairToken.delete(msg.pairToken);
        const deviceKey = s.pair(ws);
        session = s;
        role = 'manette';
        send(ws, { t: 'paired', sessionId: s.id, deviceKey });
        send(ws, s.stateMsg());
        s.toHosts({ t: 'controller', status: 'connectee' });
        s.toHosts(s.hostInfo(lanAddresses(), PORT));
        return;
      }

      case 'ctrl-resume': {
        if (limiter.blocked(ip)) return fail({ t: 'error', code: 'trop-de-tentatives', message: 'Trop de tentatives. Réessayez dans une minute.' });
        const s = typeof msg.sessionId === 'string' ? sessions.get(msg.sessionId) : undefined;
        if (!s || !s.deviceKey || typeof msg.deviceKey !== 'string' || !safeEqual(msg.deviceKey, s.deviceKey)) {
          limiter.fail(ip);
          return fail({ t: 'error', code: 'session-introuvable', message: 'Partie introuvable. Scannez à nouveau le QR code affiché à l’écran.' });
        }
        if (s.controller && s.controller !== ws) s.controller.close(4002, 'remplacee');
        s.controller = ws;
        session = s;
        role = 'manette';
        s.lastActivity = Date.now();
        send(ws, { t: 'paired', sessionId: s.id, deviceKey: s.deviceKey });
        send(ws, s.stateMsg());
        s.toHosts({ t: 'controller', status: 'connectee' });
        return;
      }

      case 'input': {
        if (!session || !role || !msg.input || typeof msg.input !== 'object') return;
        session.handleInput(msg.input as Input, role);
        return;
      }

      case 'fx': {
        if (role !== 'manette' || !session || !msg.fx) return;
        session.toHosts({ t: 'fx', fx: msg.fx });
        return;
      }
    }
  });

  ws.on('close', () => {
    clearInterval(heartbeat);
    if (!session) return;
    if (role === 'ecran') session.hosts.delete(ws);
    if (role === 'manette' && session.controller === ws) {
      session.controller = null;
      session.toHosts({ t: 'controller', status: session.controllerStatus() });
    }
    session.lastActivity = Date.now();
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (s.expired(now)) {
      s.dispose();
      sessions.delete(id);
      if (s.pairToken) byPairToken.delete(s.pairToken);
    } else if (s.pairToken && s.pairExpiresAt && s.pairExpiresAt < now && s.controllerStatus() === 'aucune') {
      // QR code expiré sans appairage : on en génère un nouveau pour l'écran.
      s.newPairing();
      indexPairToken(s);
      s.toHosts(s.hostInfo(lanAddresses(), PORT));
    }
  }
  limiter.sweep(now);
}, 10_000);

server.listen(PORT, () => {
  const lan = lanAddresses();
  console.log(`\n  Le Lotissement — ${PROD ? 'production' : 'développement'}`);
  console.log(`  Écran principal : http://localhost:${PORT}`);
  for (const a of lan) console.log(`  Sur le réseau   : http://${a}:${PORT}`);
  console.log('  Le téléphone doit être sur le même réseau Wi-Fi que l’ordinateur.\n');
});
