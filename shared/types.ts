// Modèle de données de la narration : scènes et embranchements sont décrits
// comme des données, indépendamment de l'interface (écran ou téléphone).

export type CharId = 'beatrice' | 'paul' | 'monica' | 'alban';
export type DecorId = 'allee' | 'salon' | 'pavillon';
export type TimeOfDay = 'jour' | 'soir' | 'nuit' | 'interieur';
export type Mood = 'neutre' | 'sourire' | 'froid' | 'trouble';
export type Tone = 'franchise' | 'esquive' | 'mensonge' | 'retourner' | 'action';

export interface CastMember {
  id: CharId;
  pos: 'gauche' | 'centre' | 'droite';
  mood?: Mood;
}

export interface Stage {
  decor: DecorId;
  time: TimeOfDay;
  cast: CastMember[];
  /** Photo affichée en grand sur l'écran principal. */
  photo?: string;
}

/** Condition évaluée sur l'état de partie. */
export type Cond =
  | { flag: string; is?: boolean }
  | { clue: string; has?: boolean }
  | { rel: CharId; gte?: number; lte?: number }
  | { all: Cond[] }
  | { any: Cond[] }
  | { not: Cond };

export interface Effects {
  rel?: Partial<Record<CharId, number>>;
  flags?: Record<string, boolean>;
  clues?: string[];
  /** Risque d'être reconnue (0 à 5). */
  exposure?: number;
  /** Trace d'un choix marquant, reprise dans le bilan de fin. */
  log?: string;
  ending?: string;
}

interface BaseNode {
  id: string;
  stage: Stage;
  when?: Cond;
  effects?: Effects;
}

export interface TitleNode extends BaseNode {
  type: 'title';
  kicker: string;
  title: string;
  next: string;
}

export interface LineNode extends BaseNode {
  type: 'line';
  /** Absent = narration ; 'heroine' = l'héroïne parle. */
  speaker?: CharId | 'heroine';
  text: string;
  /** Souvenir fragmentaire : rendu différemment, jamais présenté comme une preuve. */
  memory?: boolean;
  next: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  tone?: Tone;
  when?: Cond;
  effects?: Effects;
  next: string;
}

export interface ChoiceNode extends BaseNode {
  type: 'choice';
  prompt: string;
  options: ChoiceOption[];
}

export interface Spot {
  id: string;
  label: string;
  /** Position du point d'intérêt sur le décor, en % (x, y). */
  at: [number, number];
  icon?: 'regarder' | 'personne' | 'porte' | 'objet';
  next: string;
  /** Sortie de la zone d'exploration. */
  exit?: boolean;
  requires?: string[];
}

export interface ExploreNode extends BaseNode {
  type: 'explore';
  prompt: string;
  spots: Spot[];
}

export interface SmsMessage {
  text?: string;
  photo?: string;
  when?: Cond;
}

export interface SmsReply {
  id: string;
  text: string;
  effects?: Effects;
  next: string;
}

export interface SmsNode extends BaseNode {
  type: 'sms';
  thread: string;
  contact: string;
  incoming: SmsMessage[];
  replies: SmsReply[];
  /** Libellé pour ne pas répondre / ranger le téléphone. */
  dismiss?: { label: string; effects?: Effects; next: string };
}

export interface KeypadNode extends BaseNode {
  type: 'keypad';
  prompt: string;
  code: string;
  hints: { after: number; text: string }[];
  next: string;
}

export interface QteNode extends BaseNode {
  type: 'qte';
  prompt: string;
  /** Consigne affichée sur le téléphone. */
  instruction: string;
  /** Durée de maintien nécessaire, en ms. */
  hold: number;
  /** Fenêtre de réaction normale / élargie, en ms. */
  window: number;
  extendedWindow: number;
  success: string;
  fail: string;
}

export interface InputNode extends BaseNode {
  type: 'input';
  prompt: string;
  suggestions: string[];
  next: string;
}

export type FlirtTone = 'froid' | 'neutre' | 'joueuse';

/** Texte qui dépend de la tension du moment (basse, moyenne, haute). */
export interface FlirtVariants {
  low: string;
  mid: string;
  high: string;
}

export interface FlirtRound {
  /** Message reçu au début du tour. */
  incoming: string | FlirtVariants;
  /** Ce qui part selon le ton choisi au curseur. */
  replies: Record<FlirtTone, string>;
}

/** Échange de SMS de séduction : un curseur de ton fait monter ou baisser la tension. */
export interface FlirtNode extends BaseNode {
  type: 'flirt';
  thread: string;
  contact: string;
  rounds: FlirtRound[];
  /** Dernier message reçu après la dernière réponse. */
  outro: FlirtVariants;
  outcome: { high: Effects; mid: Effects; low: Effects };
  next: string;
}

export interface ViewfinderOutcome {
  effects?: Effects;
  next: string;
}

/** Le téléphone devient un viseur : cadrer, zoomer, rester immobile, déclencher. */
export interface ViewfinderNode extends BaseNode {
  type: 'viewfinder';
  prompt: string;
  /** Position de la cible en % de l'image (x, y) et rayon de tolérance. */
  target: { at: [number, number]; radius: number };
  /** Zoom nécessaire pour une image nette. */
  minZoom: number;
  nette: ViewfinderOutcome;
  floue: ViewfinderOutcome;
  rate: ViewfinderOutcome;
}

export interface EndNode extends BaseNode {
  type: 'end';
  title: string;
}

/** Nœud invisible : applique des effets puis enchaîne. */
export interface GotoNode extends BaseNode {
  type: 'goto';
  next: string;
}

export interface BranchNode extends BaseNode {
  type: 'branch';
  cond: Cond;
  then: string;
  else: string;
}

export type StoryNode =
  | GotoNode
  | BranchNode
  | TitleNode
  | LineNode
  | ChoiceNode
  | ExploreNode
  | SmsNode
  | KeypadNode
  | QteNode
  | InputNode
  | FlirtNode
  | ViewfinderNode
  | EndNode;

export interface Clue {
  id: string;
  title: string;
  text: string;
}

export interface Story {
  id: string;
  title: string;
  start: string;
  nodes: Record<string, StoryNode>;
  clues: Record<string, Clue>;
  characters: Record<CharId, { name: string; role: string }>;
  photos: Record<string, { title: string; caption: string }>;
  endings: Record<string, string>;
}
