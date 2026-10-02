import { useState } from 'react';
import type { GalleryEntry } from '../game/types';
import { PhotoPreview } from './PhotoStudio';
import { designName } from '../game/photo';
export function Gallery({
  entries,
  onDelete,
  onOpen,
  onExport,
  onUpdate,
}: {
  entries: GalleryEntry[];
  onDelete: (id: string) => void;
  onOpen: (entry: GalleryEntry) => void;
  onExport: (entry: GalleryEntry) => void;
  onUpdate: (id: string, changes: Pick<GalleryEntry, 'name' | 'favorite'>) => void;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const visible = entries.filter((e) => !favoritesOnly || e.favorite);
  return (
    <>
      <p className="modal-intro">
        Your tiny masterpieces, all in one place. {entries.length}/50 saved.
      </p>
      <div className="scrapbook-tabs" aria-label="Scrapbook filter">
        <button aria-pressed={!favoritesOnly} onClick={() => setFavoritesOnly(false)}>
          ▧ All designs
        </button>
        <button
          aria-label="Favorites"
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly(true)}
        >
          ♥ Favorites
        </button>
      </div>
      {entries.length === 0 ? (
        <div className="empty-gallery">
          <span>♡</span>
          <h3>Your gallery is waiting</h3>
          <p>Finish a manicure and choose “Save to gallery”.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {visible.length === 0 && <p>No favorites yet. Tap a heart on a design you love.</p>}
          {visible.map((entry) => {
            const title =
              entry.name || `Little masterpiece ${entries.length - entries.indexOf(entry)}`;
            return (
              <article key={entry.id} className="gallery-card">
                <PhotoPreview manicure={entry.manicure} />
                <button
                  className="favorite-button"
                  aria-label={`Favorite ${title}`}
                  aria-pressed={!!entry.favorite}
                  onClick={() => onUpdate(entry.id, { favorite: !entry.favorite })}
                >
                  {entry.favorite ? '♥' : '♡'}
                </button>
                <h3>{title}</h3>
                {renaming === entry.id ? (
                  <form
                    className="rename-design"
                    onSubmit={(e) => {
                      e.preventDefault();
                      onUpdate(entry.id, { name: designName(draft) });
                      setRenaming(null);
                    }}
                  >
                    <label>
                      Name your design
                      <input
                        autoFocus
                        maxLength={40}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                      />
                    </label>
                    <button type="submit">Keep name</button>
                    <button type="button" onClick={() => setRenaming(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    className="rename-button"
                    onClick={() => {
                      setRenaming(entry.id);
                      setDraft(entry.name ?? '');
                    }}
                  >
                    Name design
                  </button>
                )}
                <p>{new Date(entry.createdAt).toLocaleDateString()}</p>
                {deleting === entry.id ? (
                  <div className="delete-confirm">
                    <p>Remove this design from the gallery?</p>
                    <button
                      onClick={() => {
                        onDelete(entry.id);
                        setDeleting(null);
                      }}
                    >
                      Yes, remove
                    </button>
                    <button onClick={() => setDeleting(null)}>Keep it</button>
                  </div>
                ) : (
                  <div className="gallery-actions">
                    <button onClick={() => onOpen(entry)}>Edit a copy</button>
                    <button onClick={() => onExport(entry)}>Save picture</button>
                    <button
                      aria-label={`Delete masterpiece ${entries.length - entries.indexOf(entry)}`}
                      onClick={() => setDeleting(entry.id)}
                    >
                      ×
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      <p className="little-note">
        Designs stay in this browser on this device. Save pictures to keep a copy elsewhere.
      </p>
    </>
  );
}
