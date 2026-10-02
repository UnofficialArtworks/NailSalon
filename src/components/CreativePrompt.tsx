import { useState } from 'react';
import { CREATIVE_IDEAS } from '../game/occasions';
import { COLORS } from '../game/catalog';
import { OccasionArt } from './OccasionCard';
import { Bottle, Icon } from './Icon';

export function CreativePrompt({
  color,
  sticker,
}: {
  color: (id: string) => void;
  sticker: (id: string) => void;
}) {
  const [idea, setIdea] = useState<number | null>(null);
  if (idea === null)
    return (
      <button className="full-width" onClick={() => setIdea(0)}>
        ✧ Creative idea
      </button>
    );
  const prompt = CREATIVE_IDEAS[idea];
  return (
    <section className="creative-prompt" aria-label="Optional creative idea">
      <OccasionArt id={prompt.occasion} />
      <strong>{prompt.title}</strong>
      <p>{prompt.hint}</p>
      <div className="idea-supplies">
        {prompt.colors.map((i) => (
          <button key={i} aria-label={`Try ${COLORS[i].name}`} onClick={() => color(COLORS[i].id)}>
            <Bottle color={COLORS[i].color} size={32} />
          </button>
        ))}
        <button
          aria-label="Try the suggested sticker"
          onClick={() => sticker(`sticker-${prompt.sticker}`)}
        >
          <Icon id={`sticker-${prompt.sticker}`} size={32} />
        </button>
      </div>
      <div className="idea-actions">
        <button onClick={() => setIdea((idea + 1) % CREATIVE_IDEAS.length)}>Another idea</button>
        <button onClick={() => setIdea(null)}>Just play</button>
      </div>
      <small>Just an idea — make it your own!</small>
    </section>
  );
}
