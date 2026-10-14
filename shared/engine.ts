// Moteur narratif pur : (histoire, état, entrée) → nouvel état.
// Il tourne côté serveur, qui fait autorité ; l'écran principal et le
// téléphone ne sont que deux vues du même état de partie.

import type { CharId, Cond, Effects, ExploreNode, FlirtTone, FlirtVariants, Spot, Story, StoryNode } from './types.ts';

export type PhoneMode =
  | 'attente'
  | 'telecommande'
  | 'dialogue'
  | 'navigation'
  | 'telephone'
  | 'digicode'
  | 'action'
  | 'saisie'
  | 'viseur'
  | 'flirt'
  | 'fin';

export const PHONE_MODE_LABEL: Record<PhoneMode, string> = {
  attente: 'En attente',
  telecommande: 'Télécommande',
  dialogue: 'Choix de répliques',
  navigation: 'Manette de navigation',
  telephone: 'Téléphone de l’héroïne',
  digicode: 'Digicode',
  action: 'Action',
  saisie: 'Terminal de saisie',
  viseur: 'Viseur photo',
  flirt: 'Messages · tension',
  fin: 'Bilan',
};

export interface SmsEntry {
  from: 'eux' | 'moi';
  text?: string;
  photo?: string;
}

export interface GameState {
  storyId: string;
  started: boolean;
  nodeId: string;
  enteredAt: number;
  alias: string;
  flags: Record<string, boolean>;
  rel: Record<CharId, number>;
  exposure: number;
  clues: string[];
  visited: string[];
  log: string[];
  ending?: string;
  sms: Record<string, { contact: string; messages: SmsEntry[] }>;
  /** Interface du téléphone de l'héroïne, reflétée sur l'écran principal. */
  phone: { opened: boolean; photo?: string };
  nav: { cursor: number };
  keypad: { attempts: number; error: boolean };
  qte?: { startedAt: number; deadline: number };
  /** Échange de séduction en cours : tour, tension (0-100), terminé ?, dernier envoi. */
  flirt?: { round: number; tension: number; done: boolean; at: number };
  settings: { extendedTime: boolean };
}

export type Input =
  | { type: 'start' }
  | { type: 'restart' }
  | { type: 'menu' }
  | { type: 'settings'; extendedTime: boolean }
  | { type: 'advance' }
  | { type: 'choose'; option: string }
  | { type: 'nav-move'; dir: -1 | 1 }
  | { type: 'nav-select'; spot?: string }
  | { type: 'sms-open' }
  | { type: 'photo'; photo: string | null }
  | { type: 'sms-reply'; reply: string }
  | { type: 'sms-dismiss' }
  | { type: 'keypad-submit'; code: string }
  | { type: 'qte-success' }
  | { type: 'input-submit'; text: string }
  | { type: 'vf-shot'; quality: 'nette' | 'floue' | 'rate' }
  | { type: 'flirt-send'; tone: FlirtTone }
  | { type: 'flirt-end' };

const ADVANCE_DEBOUNCE_MS = 250;
const FLIRT_SEND_DEBOUNCE_MS = 700;
export const FLIRT_START = 30;
export const FLIRT_DELTA: Record<FlirtTone, number> = { froid: -20, neutre: 5, joueuse: 20 };
export const FLIRT_HIGH = 65;
export const FLIRT_LOW = 25;
const FLIRT_TONES = Object.keys(FLIRT_DELTA);

export function flirtLevel(tension: number): 'high' | 'mid' | 'low' {
  return tension >= FLIRT_HIGH ? 'high' : tension <= FLIRT_LOW ? 'low' : 'mid';
}

function flirtText(v: string | FlirtVariants, tension: number): string {
  if (typeof v === 'string') return v;
  return v[flirtLevel(tension)];
}
const QTE_GRACE_MS = 500;
export const ALIAS_MAX = 24;

export function initialState(story: Story, now: number, settings = { extendedTime: false }): GameState {
  const s: GameState = {
    storyId: story.id,
    started: false,
    nodeId: story.start,
    enteredAt: now,
    alias: 'Natasha Lusky',
    flags: {},
    rel: { beatrice: 0, paul: 0, monica: 0, alban: 0 },
    exposure: 0,
    clues: [],
    visited: [],
    log: [],
    sms: {},
    phone: { opened: false },
    nav: { cursor: 0 },
    keypad: { attempts: 0, error: false },
    settings: { ...settings },
  };
  enterNode(story, s, story.start, now);
  return s;
}

export function currentNode(story: Story, s: GameState): StoryNode {
  const n = story.nodes[s.nodeId];
  if (!n) throw new Error(`Nœud inconnu : ${s.nodeId}`);
  return n;
}

export function phoneMode(story: Story, s: GameState): PhoneMode {
  if (!s.started) return 'attente';
  switch (currentNode(story, s).type) {
    case 'choice':
      return 'dialogue';
    case 'explore':
      return 'navigation';
    case 'sms':
      return 'telephone';
    case 'keypad':
      return 'digicode';
    case 'qte':
      return 'action';
    case 'input':
      return 'saisie';
    case 'viewfinder':
      return 'viseur';
    case 'flirt':
      return 'flirt';
    case 'end':
      return 'fin';
    default:
      return 'telecommande';
  }
}

export function evalCond(c: Cond | undefined, s: GameState): boolean {
  if (!c) return true;
  if ('all' in c) return c.all.every((x) => evalCond(x, s));
  if ('any' in c) return c.any.some((x) => evalCond(x, s));
  if ('not' in c) return !evalCond(c.not, s);
  if ('flag' in c) return !!s.flags[c.flag] === (c.is ?? true);
  if ('clue' in c) return s.clues.includes(c.clue) === (c.has ?? true);
  if ('rel' in c) {
    const v = s.rel[c.rel];
    return (c.gte === undefined || v >= c.gte) && (c.lte === undefined || v <= c.lte);
  }
  return true;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function applyEffects(s: GameState, e: Effects | undefined): void {
  if (!e) return;
  for (const [k, v] of Object.entries(e.rel ?? {})) {
    const id = k as CharId;
    s.rel[id] = clamp(s.rel[id] + (v ?? 0), -3, 3);
  }
  Object.assign(s.flags, e.flags ?? {});
  for (const c of e.clues ?? []) if (!s.clues.includes(c)) s.clues.push(c);
  if (e.exposure) s.exposure = clamp(s.exposure + e.exposure, 0, 5);
  if (e.log) s.log.push(e.log);
  if (e.ending) s.ending = e.ending;
}

/** Remplace les variables du texte ({alias}). */
export function fmt(text: string, s: Pick<GameState, 'alias'>): string {
  return text.replaceAll('{alias}', s.alias);
}

export function availableSpots(node: ExploreNode, s: GameState): Spot[] {
  return node.spots.filter((sp) => (sp.requires ?? []).every((r) => s.visited.includes(`${node.id}:${r}`)));
}

function enterNode(story: Story, s: GameState, id: string, now: number): void {
  for (let guard = 0; guard < 500; guard++) {
    const node = story.nodes[id];
    if (!node) throw new Error(`Nœud inconnu : ${id}`);
    if (!evalCond(node.when, s)) {
      if (!('next' in node)) throw new Error(`Nœud conditionnel sans suite : ${id}`);
      id = node.next;
      continue;
    }
    applyEffects(s, node.effects);
    if (node.type === 'goto') {
      id = node.next;
      continue;
    }
    if (node.type === 'branch') {
      id = evalCond(node.cond, s) ? node.then : node.else;
      continue;
    }
    s.nodeId = id;
    s.enteredAt = now;
    s.nav.cursor = 0;
    s.keypad = { attempts: 0, error: false };
    s.qte = undefined;
    s.flirt = undefined;
    s.phone = { opened: false };
    if (node.type === 'sms') {
      const thread = (s.sms[node.thread] ??= { contact: node.contact, messages: [] });
      for (const m of node.incoming) {
        if (evalCond(m.when, s)) thread.messages.push({ from: 'eux', text: m.text && fmt(m.text, s), photo: m.photo });
      }
    }
    if (node.type === 'flirt') {
      const thread = (s.sms[node.thread] ??= { contact: node.contact, messages: [] });
      s.flirt = { round: 0, tension: FLIRT_START, done: false, at: now };
      thread.messages.push({ from: 'eux', text: fmt(flirtText(node.rounds[0].incoming, FLIRT_START), s) });
    }
    if (node.type === 'qte') {
      const win = s.settings.extendedTime ? node.extendedWindow : node.window;
      s.qte = { startedAt: now, deadline: now + win };
    }
    return;
  }
  throw new Error('Boucle infinie dans l’histoire');
}

/** Nettoie un nom saisi au téléphone : lettres, espaces, tirets, apostrophes. */
export function sanitizeAlias(text: string): string | null {
  const t = text
    .normalize('NFC')
    .replace(/[^\p{L}\s'’-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, ALIAS_MAX);
  return t.length >= 2 ? t : null;
}

/**
 * Applique une entrée du joueur. Renvoie le nouvel état, ou null si l'entrée
 * n'est pas valide dans la situation courante (elle est alors ignorée).
 */
export function applyInput(story: Story, prev: GameState, input: Input, now: number): GameState | null {
  if (input.type === 'restart') {
    const s = initialState(story, now, prev.settings);
    s.started = true;
    return s;
  }
  if (input.type === 'menu') return initialState(story, now, prev.settings);
  if (input.type === 'settings') {
    const s = structuredClone(prev);
    s.settings.extendedTime = !!input.extendedTime;
    return s;
  }
  if (!prev.started) {
    if (input.type !== 'start') return null;
    const s = structuredClone(prev);
    s.started = true;
    s.enteredAt = now;
    return s;
  }

  const node = currentNode(story, prev);
  const s = structuredClone(prev);

  switch (node.type) {
    case 'title':
    case 'line':
      if (input.type !== 'advance' || now - prev.enteredAt < ADVANCE_DEBOUNCE_MS) return null;
      enterNode(story, s, node.next, now);
      return s;

    case 'choice': {
      if (input.type !== 'choose') return null;
      const opt = node.options.find((o) => o.id === input.option && evalCond(o.when, s));
      if (!opt) return null;
      s.log.push(`« ${fmt(opt.label, s)} »`);
      applyEffects(s, opt.effects);
      enterNode(story, s, opt.next, now);
      return s;
    }

    case 'explore': {
      const spots = availableSpots(node, s);
      if (input.type === 'nav-move') {
        s.nav.cursor = (s.nav.cursor + input.dir + spots.length) % spots.length;
        return s;
      }
      if (input.type !== 'nav-select') return null;
      const spot = input.spot ? spots.find((sp) => sp.id === input.spot) : spots[s.nav.cursor];
      if (!spot) return null;
      const key = `${node.id}:${spot.id}`;
      if (!s.visited.includes(key)) s.visited.push(key);
      enterNode(story, s, spot.next, now);
      return s;
    }

    case 'sms': {
      if (input.type === 'sms-open') {
        s.phone.opened = true;
        return s;
      }
      if (input.type === 'photo') {
        if (input.photo !== null && !Object.hasOwn(story.photos, input.photo)) return null;
        s.phone.photo = input.photo ?? undefined;
        return s;
      }
      if (input.type === 'sms-reply') {
        const r = node.replies.find((x) => x.id === input.reply);
        if (!r) return null;
        s.sms[node.thread].messages.push({ from: 'moi', text: fmt(r.text, s) });
        applyEffects(s, r.effects);
        enterNode(story, s, r.next, now);
        return s;
      }
      if (input.type === 'sms-dismiss' && node.dismiss) {
        applyEffects(s, node.dismiss.effects);
        enterNode(story, s, node.dismiss.next, now);
        return s;
      }
      return null;
    }

    case 'keypad': {
      if (input.type !== 'keypad-submit' || !/^\d{1,8}$/.test(input.code)) return null;
      if (input.code === node.code) {
        enterNode(story, s, node.next, now);
      } else {
        s.keypad.attempts++;
        s.keypad.error = true;
      }
      return s;
    }

    case 'qte': {
      if (input.type !== 'qte-success' || !s.qte || now > s.qte.deadline + QTE_GRACE_MS) return null;
      enterNode(story, s, node.success, now);
      return s;
    }

    case 'input': {
      if (input.type !== 'input-submit') return null;
      const alias = sanitizeAlias(input.text);
      if (!alias) return null;
      s.alias = alias;
      enterNode(story, s, node.next, now);
      return s;
    }

    case 'viewfinder': {
      if (input.type !== 'vf-shot') return null;
      const outcome = (['nette', 'floue', 'rate'] as const).includes(input.quality) ? node[input.quality] : null;
      if (!outcome) return null;
      applyEffects(s, outcome.effects);
      enterNode(story, s, outcome.next, now);
      return s;
    }

    case 'flirt': {
      const f = s.flirt;
      if (!f) return null;
      if (input.type === 'sms-open') {
        s.phone.opened = true;
        return s;
      }
      const thread = s.sms[node.thread];
      if (input.type === 'flirt-send') {
        if (f.done || !FLIRT_TONES.includes(input.tone) || now - f.at < FLIRT_SEND_DEBOUNCE_MS) return null;
        thread.messages.push({ from: 'moi', text: fmt(node.rounds[f.round].replies[input.tone], s) });
        f.tension = clamp(f.tension + FLIRT_DELTA[input.tone], 0, 100);
        f.round++;
        f.at = now;
        if (f.round < node.rounds.length) {
          thread.messages.push({ from: 'eux', text: fmt(flirtText(node.rounds[f.round].incoming, f.tension), s) });
        } else {
          thread.messages.push({ from: 'eux', text: fmt(flirtText(node.outro, f.tension), s) });
          f.done = true;
        }
        return s;
      }
      if (input.type === 'flirt-end') {
        if (!f.done) return null;
        applyEffects(s, node.outcome[flirtLevel(f.tension)]);
        enterNode(story, s, node.next, now);
        return s;
      }
      return null;
    }

    case 'end':
      return null;
  }
  return null;
}

/** Résout un QTE expiré. Renvoie null si rien à faire. */
export function tick(story: Story, prev: GameState, now: number): GameState | null {
  const node = currentNode(story, prev);
  if (node.type !== 'qte' || !prev.qte || now <= prev.qte.deadline + QTE_GRACE_MS) return null;
  const s = structuredClone(prev);
  enterNode(story, s, node.fail, now);
  return s;
}

export function relationLabel(v: number): string {
  if (v <= -2) return 'Hostile';
  if (v === -1) return 'Méfiant·e';
  if (v === 0) return 'Neutre';
  if (v === 1) return 'Bienveillant·e';
  return 'Proche';
}

export function exposureLabel(v: number): string {
  return ['Insoupçonnée', 'Quelques regards', 'Des questions', 'Des doutes sérieux', 'Presque démasquée', 'Démasquée'][v];
}

/** Liste tous les identifiants de nœuds référencés, pour valider l'histoire. */
export function validateStory(story: Story): string[] {
  const errors: string[] = [];
  const has = (id: string, from: string) => {
    if (!story.nodes[id]) errors.push(`${from} → ${id} (inexistant)`);
  };
  if (!story.nodes[story.start]) errors.push(`départ ${story.start} inexistant`);
  for (const n of Object.values(story.nodes)) {
    switch (n.type) {
      case 'choice':
        n.options.forEach((o) => has(o.next, n.id));
        break;
      case 'explore':
        n.spots.forEach((sp) => has(sp.next, n.id));
        if (!n.spots.some((sp) => sp.exit)) errors.push(`${n.id} : exploration sans sortie`);
        break;
      case 'sms':
        n.replies.forEach((r) => has(r.next, n.id));
        if (n.dismiss) has(n.dismiss.next, n.id);
        if (!n.replies.length && !n.dismiss) errors.push(`${n.id} : sms sans issue`);
        n.incoming.forEach((m) => m.photo && !story.photos[m.photo] && errors.push(`${n.id} : photo ${m.photo} inconnue`));
        break;
      case 'qte':
        has(n.success, n.id);
        has(n.fail, n.id);
        break;
      case 'viewfinder':
        for (const o of [n.nette, n.floue, n.rate]) {
          has(o.next, n.id);
          for (const c of o.effects?.clues ?? []) if (!story.clues[c]) errors.push(`${n.id} : indice ${c} inconnu`);
        }
        break;
      case 'flirt':
        has(n.next, n.id);
        if (!n.rounds.length) errors.push(`${n.id} : flirt sans tour`);
        for (const e of Object.values(n.outcome))
          for (const c of e.clues ?? []) if (!story.clues[c]) errors.push(`${n.id} : indice ${c} inconnu`);
        break;
      case 'branch':
        has(n.then, n.id);
        has(n.else, n.id);
        break;
      case 'end':
        break;
      default:
        has(n.next, n.id);
    }
    for (const c of [...(n.effects?.clues ?? [])]) if (!story.clues[c]) errors.push(`${n.id} : indice ${c} inconnu`);
    if (n.stage.photo && !story.photos[n.stage.photo]) errors.push(`${n.id} : photo ${n.stage.photo} inconnue`);
  }
  return errors;
}
