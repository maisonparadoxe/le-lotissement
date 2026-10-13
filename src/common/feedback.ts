// Retours sonores et haptiques discrets (Web Audio + vibration).

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

/** À appeler sur un geste utilisateur pour débloquer l'audio (iOS). */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* audio indisponible */
  }
}

function tone(freq: number, start: number, dur: number, gain = 0.06, type: OscillatorType = 'sine') {
  if (!ctx || muted) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = ctx.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export type Cue = 'tap' | 'mode' | 'message' | 'erreur' | 'succes' | 'alerte';

export function cue(c: Cue) {
  const vib = (p: number | number[]) => {
    try {
      navigator.vibrate?.(p);
    } catch {
      /* pas de vibration */
    }
  };
  switch (c) {
    case 'tap':
      vib(8);
      tone(880, 0, 0.05, 0.025);
      break;
    case 'mode':
      vib([20, 40, 20]);
      tone(523, 0, 0.18);
      tone(784, 0.09, 0.25);
      break;
    case 'message':
      vib([60, 80, 60]);
      tone(1046, 0, 0.12, 0.05);
      tone(1318, 0.12, 0.2, 0.05);
      break;
    case 'erreur':
      vib([80, 50, 80]);
      tone(196, 0, 0.18, 0.06, 'square');
      tone(165, 0.16, 0.22, 0.06, 'square');
      break;
    case 'succes':
      vib(30);
      tone(659, 0, 0.12);
      tone(988, 0.1, 0.3);
      break;
    case 'alerte':
      vib([150, 80, 150]);
      tone(311, 0, 0.3, 0.05, 'triangle');
      break;
  }
}
