import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { after, before, test } from 'node:test';
import { WebSocket } from 'ws';
import type { ClientMsg, ServerMsg } from '../shared/protocol.ts';

const PORT = 3900 + Math.floor(Math.random() * 90);
let server: ChildProcess;

before(async () => {
  server = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], {
    env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT) },
    stdio: 'pipe',
  });
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/healthz`);
      if (r.ok) return;
    } catch {
      /* pas encore prêt */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('le serveur ne démarre pas');
});

after(() => {
  server.kill();
});

class Client {
  ws: WebSocket;
  inbox: ServerMsg[] = [];
  waiters: { pred: (m: ServerMsg) => boolean; resolve: (m: ServerMsg) => void }[] = [];
  closed: Promise<number>;
  constructor() {
    this.ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws`);
    this.closed = new Promise<number>((r) => this.ws.on('close', (code) => r(code)));
    this.ws.on('message', (raw) => {
      const m = JSON.parse(String(raw)) as ServerMsg;
      const w = this.waiters.findIndex((x) => x.pred(m));
      if (w >= 0) this.waiters.splice(w, 1)[0].resolve(m);
      else this.inbox.push(m);
    });
  }
  ready() {
    return new Promise<void>((r) => this.ws.once('open', () => r()));
  }
  send(m: ClientMsg) {
    this.ws.send(JSON.stringify(m));
  }
  next<T extends ServerMsg['t']>(t: T, pred: (m: Extract<ServerMsg, { t: T }>) => boolean = () => true): Promise<Extract<ServerMsg, { t: T }>> {
    const p = (m: ServerMsg) => m.t === t && pred(m as Extract<ServerMsg, { t: T }>);
    const i = this.inbox.findIndex(p);
    if (i >= 0) return Promise.resolve(this.inbox.splice(i, 1)[0] as Extract<ServerMsg, { t: T }>);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`attente de ${t} expirée`)), 3000);
      this.waiters.push({
        pred: p,
        resolve: (m) => {
          clearTimeout(timer);
          resolve(m as Extract<ServerMsg, { t: T }>);
        },
      });
    });
  }
}

test('appairage, partie synchronisée, reconnexion et révocation', async () => {
  const host = new Client();
  await host.ready();
  host.send({ t: 'host-hello' });
  const info = await host.next('host-session');
  assert.ok(info.pairToken && info.pairToken.length >= 22, 'jeton long et aléatoire');
  assert.equal((await host.next('state')).state.started, false);

  // mauvais jeton
  const intrus = new Client();
  await intrus.ready();
  intrus.send({ t: 'ctrl-hello', pairToken: 'ABCD' });
  assert.equal((await intrus.next('error')).code, 'jeton-invalide');

  // bon jeton
  const phone = new Client();
  await phone.ready();
  phone.send({ t: 'ctrl-hello', pairToken: info.pairToken! });
  const paired = await phone.next('paired');
  assert.equal(paired.sessionId, info.sessionId);
  await host.next('controller', (m) => m.status === 'connectee');

  // le jeton est à usage unique
  const second = new Client();
  await second.ready();
  second.send({ t: 'ctrl-hello', pairToken: info.pairToken! });
  assert.equal((await second.next('error')).code, 'jeton-invalide');

  // une entrée du téléphone met à jour l'écran
  phone.send({ t: 'input', input: { type: 'start' } });
  assert.equal((await host.next('state', (m) => m.state.started)).state.started, true);

  // effets éphémères relayés vers l'écran
  phone.send({ t: 'fx', fx: { kind: 'keypad-entry', value: '14' } });
  const fx = await host.next('fx');
  assert.deepEqual(fx.fx, { kind: 'keypad-entry', value: '14' });

  // perte réseau puis reconnexion avec la clé d'appareil
  phone.ws.close();
  await host.next('controller', (m) => m.status === 'deconnectee');
  const back = new Client();
  await back.ready();
  back.send({ t: 'ctrl-resume', sessionId: paired.sessionId, deviceKey: paired.deviceKey });
  await back.next('paired');
  assert.equal((await back.next('state')).state.started, true);
  await host.next('controller', (m) => m.status === 'connectee');

  // clé d'appareil erronée
  const faux = new Client();
  await faux.ready();
  faux.send({ t: 'ctrl-resume', sessionId: paired.sessionId, deviceKey: 'x'.repeat(43) });
  assert.equal((await faux.next('error')).code, 'session-introuvable');

  // l'écran révoque la manette et obtient un nouveau QR code
  host.send({ t: 'host-new-pairing' });
  assert.equal((await back.next('error')).code, 'revoquee');
  assert.equal(await back.closed, 4001);
  const fresh = await host.next('host-session', (m) => !!m.pairToken && m.pairToken !== info.pairToken);
  assert.ok(fresh.pairToken);

  // l'écran rechargé retrouve sa partie
  const host2 = new Client();
  await host2.ready();
  host2.send({ t: 'host-hello', sessionId: info.sessionId, hostKey: info.hostKey });
  assert.equal((await host2.next('host-session')).sessionId, info.sessionId);
  assert.equal((await host2.next('state')).state.started, true);

  // …mais pas sans la clé de l'écran
  const host3 = new Client();
  await host3.ready();
  host3.send({ t: 'host-hello', sessionId: info.sessionId, hostKey: 'faux' });
  assert.notEqual((await host3.next('host-session')).sessionId, info.sessionId);

  for (const c of [host, host2, host3, intrus, second, faux]) c.ws.close();
});

test('les tentatives répétées sont limitées', async () => {
  const c = new Client();
  await c.ready();
  let last = '';
  for (let i = 0; i < 14; i++) {
    c.send({ t: 'ctrl-hello', pairToken: `nope-${i}` });
    last = (await c.next('error')).code;
  }
  assert.equal(last, 'trop-de-tentatives');
  c.ws.close();
});
