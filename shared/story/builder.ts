// Petit DSL pour écrire les scènes de façon lisible : une séquence est une
// liste de « beats » enchaînés automatiquement ; les beats à embranchement
// (choix, exploration, QTE…) désignent eux-mêmes leurs suites.

import type {
  CastMember,
  CharId,
  ChoiceOption,
  Cond,
  Effects,
  FlirtRound,
  FlirtVariants,
  Mood,
  SmsMessage,
  SmsReply,
  Spot,
  Stage,
  StoryNode,
  ViewfinderOutcome,
} from '../types.ts';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type NodeDraft = DistributiveOmit<StoryNode, 'id' | 'stage' | 'next'> & { next?: string };

export type Beat =
  | { kind: 'stage'; patch: Partial<Stage> | ((s: Stage) => Partial<Stage>) }
  | { kind: 'node'; draft: NodeDraft; id?: string; terminal: boolean };

const node = (draft: NodeDraft, terminal = false): Beat => ({ kind: 'node', draft, terminal });

export const stage = (patch: Partial<Stage> | ((s: Stage) => Partial<Stage>)): Beat => ({ kind: 'stage', patch });

/** Change l'expression d'un personnage déjà en scène. */
export const mood = (id: CharId, m: Mood): Beat =>
  stage((s) => ({ cast: s.cast.map((c) => (c.id === id ? { ...c, mood: m } : c)) }));

export const enter = (c: CastMember): Beat =>
  stage((s) => ({ cast: [...s.cast.filter((x) => x.id !== c.id), c] }));

export const leave = (id: CharId): Beat => stage((s) => ({ cast: s.cast.filter((x) => x.id !== id) }));

export const title = (kicker: string, t: string): Beat => node({ type: 'title', kicker, title: t });
export const narr = (text: string): Beat => node({ type: 'line', text });
export const memory = (text: string): Beat => node({ type: 'line', text, memory: true });
export const me = (text: string): Beat => node({ type: 'line', speaker: 'heroine', text });
export const say = (speaker: CharId, text: string, m?: Mood, effects?: Effects): Beat[] => {
  const line = node({ type: 'line', speaker, text, effects });
  return m ? [mood(speaker, m), line] : [line];
};

export const fx = (effects: Effects): Beat => node({ type: 'goto', effects });

export const choice = (prompt: string, options: ChoiceOption[]): Beat =>
  node({ type: 'choice', prompt, options }, true);

export const explore = (id: string, prompt: string, spots: Spot[]): Beat => ({
  ...(node({ type: 'explore', prompt, spots }, true) as Extract<Beat, { kind: 'node' }>),
  id,
});

export const sms = (o: {
  thread: string;
  contact: string;
  incoming: SmsMessage[];
  replies?: SmsReply[];
  dismiss?: { label: string; effects?: Effects; next?: string };
}): Beat =>
  node(
    { type: 'sms', thread: o.thread, contact: o.contact, incoming: o.incoming, replies: o.replies ?? [], dismiss: o.dismiss as never },
    (o.replies?.length ?? 0) > 0 && (!o.dismiss || !!o.dismiss.next),
  );

export const keypad = (prompt: string, code: string, hints: { after: number; text: string }[]): Beat =>
  node({ type: 'keypad', prompt, code, hints });

export const qte = (o: {
  prompt: string;
  instruction: string;
  hold: number;
  window: number;
  extendedWindow: number;
  success: string;
  fail: string;
}): Beat => node({ type: 'qte', ...o }, true);

export const input = (prompt: string, suggestions: string[]): Beat => node({ type: 'input', prompt, suggestions });

export const goto = (next: string, effects?: Effects): Beat => node({ type: 'goto', next, effects }, true);

export const branch = (cond: Cond, then: string, otherwise: string): Beat =>
  node({ type: 'branch', cond, then, else: otherwise }, true);

export const viewfinder = (o: {
  prompt: string;
  target: { at: [number, number]; radius: number };
  minZoom: number;
  nette: ViewfinderOutcome;
  floue: ViewfinderOutcome;
  rate: ViewfinderOutcome;
}): Beat => node({ type: 'viewfinder', ...o }, true);

export const flirt = (o: {
  thread: string;
  contact: string;
  rounds: FlirtRound[];
  outro: FlirtVariants;
  outcome: { high: Effects; mid: Effects; low: Effects };
}): Beat => node({ type: 'flirt', ...o });

export const heartbeat = (o: { prompt: string; instruction: string; beats: number; bpm: number }): Beat =>
  node({ type: 'heartbeat', ...o });

export const mirror = (o: { prompt: string; instruction: string; photo: string }): Beat => node({ type: 'mirror', ...o });

export const end = (t: string): Beat => node({ type: 'end', title: t }, true);

/** Ne joue le beat que si la condition est remplie (sinon il est sauté). */
export function iff(cond: Cond, beats: Beat | Beat[]): Beat[] {
  return ([] as Beat[]).concat(beats).map((b) => (b.kind === 'node' ? { ...b, draft: { ...b.draft, when: cond } } : b));
}

/** Ajoute des effets au beat (appliqués à l'entrée du nœud). */
export function withFx(effects: Effects, b: Beat): Beat {
  if (b.kind !== 'node') throw new Error('withFx attend un nœud');
  return { ...b, draft: { ...b.draft, effects } };
}

/**
 * Compile une séquence de beats en nœuds. Le premier nœud reçoit l'id de la
 * séquence, les suivants `${id}.${n}`. Le dernier beat non terminal enchaîne
 * vers `next`.
 */
export function seq(
  id: string,
  initial: Stage,
  beats: (Beat | Beat[])[],
  next?: string,
): Record<string, StoryNode> {
  const flat = beats.flat();
  const out: Record<string, StoryNode> = {};
  let current: Stage = initial;
  const pending: { id: string; draft: NodeDraft; stage: Stage; terminal: boolean }[] = [];
  let n = 0;
  for (const b of flat) {
    if (b.kind === 'stage') {
      const patch = typeof b.patch === 'function' ? b.patch(current) : b.patch;
      current = { ...current, ...patch };
      continue;
    }
    const nodeId = b.id ?? (n === 0 ? id : `${id}.${n}`);
    n++;
    pending.push({ id: nodeId, draft: b.draft, stage: current, terminal: b.terminal });
  }
  pending.forEach((p, i) => {
    const following = pending[i + 1]?.id ?? next;
    const draft = { ...p.draft } as NodeDraft;
    if (!p.terminal && !draft.next) {
      if (!following) throw new Error(`Séquence ${id} : le nœud ${p.id} n'a pas de suite`);
      draft.next = following;
    }
    if (draft.type === 'sms' && draft.dismiss && !draft.dismiss.next) {
      if (!following) throw new Error(`Séquence ${id} : sms ${p.id} sans suite`);
      draft.dismiss = { ...draft.dismiss, next: following };
    }
    out[p.id] = { ...draft, id: p.id, stage: p.stage } as StoryNode;
  });
  return out;
}
