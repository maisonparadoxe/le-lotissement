// Bilan de fin d'épisode : relations, exposition, indices, choix marquants.

import { exposureLabel, relationLabel, type GameState } from '../../shared/engine.ts';
import type { CharId, Story } from '../../shared/types.ts';
import { Portrait } from './art/Portrait.tsx';

export function EndSummary({ story, state, compact = false }: { story: Story; state: GameState; compact?: boolean }) {
  const ids = Object.keys(story.characters) as CharId[];
  const total = Object.keys(story.clues).length;
  return (
    <div className={`summary ${compact ? 'compact' : ''}`}>
      <p className="summary-kicker">Fin de l’épisode 1</p>
      <h2>{state.ending ? story.endings[state.ending] : story.title}</h2>
      <div className="summary-rel">
        {ids.map((id) => (
          <div key={id} className={`rel rel-${Math.sign(state.rel[id])}`}>
            {!compact && (
              <div className="rel-portrait">
                <Portrait id={id} mood={state.rel[id] > 0 ? 'sourire' : state.rel[id] < 0 ? 'froid' : 'neutre'} />
              </div>
            )}
            <strong>{story.characters[id].name.split(' ')[0]}</strong>
            <span>{relationLabel(state.rel[id])}</span>
          </div>
        ))}
      </div>
      <div className="summary-line">
        <span>Votre couverture</span>
        <div className="gauge" aria-label={`Exposition ${state.exposure} sur 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <i key={i} className={i < state.exposure ? 'on' : ''} />
          ))}
        </div>
        <em>{exposureLabel(state.exposure)}</em>
      </div>
      <div className="summary-line">
        <span>Indices</span>
        <em>
          {state.clues.length} / {total}
        </em>
      </div>
      {!compact && state.log.length > 0 && (
        <ul className="summary-log">
          {state.log
            .filter((l) => !l.startsWith('«'))
            .map((l, i) => (
              <li key={i}>{l}</li>
            ))}
        </ul>
      )}
    </div>
  );
}
