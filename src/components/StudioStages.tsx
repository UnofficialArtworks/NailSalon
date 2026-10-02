import type { Tool } from '../game/types';
import { ToolPicture } from './ToolPicture';
import { Icon } from './Icon';

export function StudioStages({
  tool,
  select,
  reveal,
}: {
  tool: Tool;
  select: (tool: Tool) => void;
  reveal: () => void;
}) {
  const stage =
    tool === 'clean' ? 'clean' : ['brush', 'eraser'].includes(tool) ? 'brush' : 'sticker';
  return (
    <nav className="studio-stages" aria-label="Creative studio stages">
      {(
        [
          { id: 'clean', name: 'Prepare', detail: 'Shape & length' },
          { id: 'brush', name: 'Paint', detail: 'Color & finish' },
          { id: 'sticker', name: 'Decorate', detail: 'Patterns & gems' },
        ] as const
      ).map((s, i) => (
        <button key={s.id} aria-pressed={stage === s.id} onClick={() => select(s.id)}>
          <ToolPicture tool={s.id} />
          <span>
            <strong>
              {i + 1}. {s.name}
            </strong>
            <small>{s.detail}</small>
          </span>
        </button>
      ))}
      <button onClick={reveal}>
        <Icon id="star" size={36} />
        <span>
          <strong>4. Reveal</strong>
          <small>Show your creation</small>
        </span>
      </button>
    </nav>
  );
}
