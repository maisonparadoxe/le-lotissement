import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  applyInput,
  availableSpots,
  currentNode,
  initialState,
  sanitizeAlias,
  tick,
  validateStory,
  type GameState,
  type Input,
} from '../shared/engine.ts';
import { episode1 as story } from '../shared/story/episode1.ts';

const T0 = 1_000_000;

/** Toutes les entrées qui font avancer l'histoire depuis un état donné. */
function moves(s: GameState): Input[] {
  const n = currentNode(story, s);
  switch (n.type) {
    case 'title':
    case 'line':
      return [{ type: 'advance' }];
    case 'choice':
      return n.options.map((o) => ({ type: 'choose', option: o.id }));
    case 'explore':
      return availableSpots(n, s).map((sp) => ({ type: 'nav-select', spot: sp.id }));
    case 'sms':
      return [...n.replies.map((r) => ({ type: 'sms-reply', reply: r.id }) as Input), ...(n.dismiss ? [{ type: 'sms-dismiss' } as Input] : [])];
    case 'keypad':
      return [{ type: 'keypad-submit', code: n.code }];
    case 'qte':
      return [{ type: 'qte-success' }, { type: 'qte-timeout' as never }];
    case 'input':
      return [{ type: 'input-submit', text: 'Nora Vidal' }];
    default:
      return [];
  }
}

/** Fait avancer d'un pas, une seconde après l'entrée dans le nœud courant. */
function step(s: GameState, i: Input, now = s.enteredAt + 1000): GameState {
  if ((i.type as string) === 'qte-timeout') {
    const r = tick(story, s, s.qte!.deadline + 10_000);
    assert.ok(r, 'le QTE doit échouer après le délai');
    return r;
  }
  const r = applyInput(story, s, i, now);
  assert.ok(r, `entrée refusée ${JSON.stringify(i)} sur ${s.nodeId}`);
  return r;
}

/** Avance en prenant la première option, et la sortie dans les explorations. */
function forward(s: GameState): GameState {
  const n = currentNode(story, s);
  const ms = moves(s);
  const m = n.type === 'explore' ? { type: 'nav-select' as const, spot: n.spots.find((sp) => sp.exit)!.id } : ms[0];
  return step(s, m);
}

function started(): GameState {
  return applyInput(story, initialState(story, T0), { type: 'start' }, T0)!;
}

test("le graphe de l'histoire est cohérent", () => {
  assert.deepEqual(validateStory(story), []);
});

test('tous les nœuds sont atteignables et toutes les fins le sont aussi', () => {
  const seen = new Set<string>();
  const endings = new Set<string>();
  // Exploration en largeur. Deux états sont équivalents s'ils partagent le
  // nœud et tout ce que les conditions de l'histoire peuvent tester
  // (drapeaux et indice « registre »).
  const key = (s: GameState) => `${s.nodeId}|${JSON.stringify(Object.entries(s.flags).sort())}|${s.clues.includes('registre')}`;
  const queue: GameState[] = [started()];
  const visitedStates = new Set<string>();
  while (queue.length) {
    const s = queue.shift()!;
    const k = key(s);
    if (visitedStates.has(k)) continue;
    visitedStates.add(k);
    seen.add(s.nodeId);
    const n = currentNode(story, s);
    if (n.type === 'end') {
      assert.ok(s.ending, 'une fin doit être nommée');
      endings.add(s.ending);
      continue;
    }
    const ms = moves(s);
    assert.ok(ms.length > 0, `impasse sur ${s.nodeId}`);
    for (const m of ms) queue.push(step(s, m));
    assert.ok(visitedStates.size < 200_000, 'explosion combinatoire');
  }
  const interactive = Object.values(story.nodes).filter((n) => n.type !== 'goto' && n.type !== 'branch');
  const unreached = interactive.filter((n) => !seen.has(n.id) && !n.when).map((n) => n.id);
  assert.deepEqual(unreached, [], 'nœuds jamais atteints');
  assert.deepEqual([...endings].sort(), ['alliance', 'confrontation', 'silence']);
});

test('le digicode refuse un mauvais code et donne des indices progressifs', () => {
  let s = started();
  for (let i = 0; i < 400 && currentNode(story, s).type !== 'keypad'; i++) s = forward(s);
  let now = s.enteredAt;
  assert.equal(currentNode(story, s).type, 'keypad');
  const at = s.nodeId;
  for (let i = 1; i <= 3; i++) {
    s = applyInput(story, s, { type: 'keypad-submit', code: '0000' }, (now += 1000))!;
    assert.equal(s.nodeId, at);
    assert.equal(s.keypad.attempts, i);
  }
  assert.equal(applyInput(story, s, { type: 'keypad-submit', code: 'abcd' }, now), null);
  s = applyInput(story, s, { type: 'keypad-submit', code: '1403' }, (now += 1000))!;
  assert.notEqual(s.nodeId, at);
});

test('le QTE accepte le temps élargi et échoue sans punir', () => {
  let s = initialState(story, T0, { extendedTime: true });
  s = applyInput(story, s, { type: 'start' }, T0)!;
  for (let i = 0; i < 400 && currentNode(story, s).type !== 'qte'; i++) s = forward(s);
  const now = s.enteredAt;
  const n = currentNode(story, s);
  assert.equal(n.type, 'qte');
  if (n.type !== 'qte') return;
  assert.equal(s.qte!.deadline - s.qte!.startedAt, n.extendedWindow);
  // trop tôt pour échouer
  assert.equal(tick(story, s, now + n.window), null);
  const failed = tick(story, s, now + n.extendedWindow + 1000)!;
  assert.equal(failed.nodeId, n.fail);
  // réussite tardive refusée après la fenêtre
  assert.equal(applyInput(story, s, { type: 'qte-success' }, now + n.extendedWindow + 5000), null);
});

test('les entrées hors contexte sont ignorées', () => {
  const s = started();
  assert.equal(applyInput(story, s, { type: 'choose', option: 'x' }, T0 + 1000), null);
  assert.equal(applyInput(story, s, { type: 'keypad-submit', code: '1403' }, T0 + 1000), null);
  // anti double-tap : un « continuer » trop rapproché est ignoré
  assert.equal(applyInput(story, s, { type: 'advance' }, T0 + 10), null);
  assert.equal(applyInput(story, initialState(story, T0), { type: 'advance' }, T0 + 5000), null);
});

test('le nom saisi est nettoyé', () => {
  assert.equal(sanitizeAlias('  Nora   Vidal  '), 'Nora Vidal');
  assert.equal(sanitizeAlias('<script>alert(1)</script>'), 'scriptalertscript');
  assert.equal(sanitizeAlias('Anne-Sophie d’Arcy'), 'Anne-Sophie d’Arcy');
  assert.equal(sanitizeAlias('1'), null);
  assert.equal(sanitizeAlias('x'.repeat(80))!.length, 24);
});
