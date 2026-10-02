import { Icon, Bottle } from './Icon';
import { ToolPicture } from './ToolPicture';

const tips = [
  ['Tap a nail', 'Open one of your five nails to begin.', 'Open a nail'],
  ['Clean & shape', 'Clean your nail, then pick its shape before painting.', 'Manicure tools'],
  ['Add color', 'Pick a bottle. Brush or fill your nail!', 'Show polish'],
  ['Add sparkle', 'Pick a sticker and tap your nail to place it.', 'Show stickers'],
  ['Keep your art', 'Tap All done! Then save your design to the gallery.', 'Finish design'],
];
export function TutorialCoach({
  step,
  act,
  next,
  stop,
}: {
  step: number;
  act: () => void;
  next: () => void;
  stop: () => void;
}) {
  const [title, text, action] = tips[step];
  return (
    <section className="tutorial-coach" aria-label="Play tutorial">
      <div className="coach-tip" role="status">
        {step === 2 ? (
          <Bottle color="#ff49b5" size={40} />
        ) : step === 1 ? (
          <ToolPicture tool="clean" />
        ) : (
          <Icon id={step === 3 ? 'sticker-2' : 'star'} size={40} />
        )}
        <div>
          <strong>
            {step + 1}/5 · {title}
          </strong>
          <p>{text}</p>
        </div>
      </div>
      <div className="coach-actions">
        <button onClick={act}>{action}</button>
        <button onClick={next}>Next tip</button>
        <button onClick={stop}>Skip tutorial</button>
      </div>
    </section>
  );
}
