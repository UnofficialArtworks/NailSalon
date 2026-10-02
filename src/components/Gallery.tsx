import { useState } from 'react';
import type { GalleryEntry } from '../game/types';
import { Hand } from './Hand';
export function Gallery({
  entries,
  onDelete,
  onOpen,
  onExport,
}: {
  entries: GalleryEntry[];
  onDelete: (id: string) => void;
  onOpen: (entry: GalleryEntry) => void;
  onExport: (entry: GalleryEntry) => void;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);
  return (
    <>
      <p className="modal-intro">
        Your tiny masterpieces, all in one place. {entries.length}/50 saved.
      </p>
      {entries.length === 0 ? (
        <div className="empty-gallery">
          <span>♡</span>
          <h3>Your gallery is waiting</h3>
          <p>Finish a manicure and choose “Save to gallery”.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {entries.map((entry, i) => (
            <article key={entry.id} className="gallery-card">
              <Hand manicure={entry.manicure} small />
              <h3>Little masterpiece {entries.length - i}</h3>
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
                    aria-label={`Delete masterpiece ${entries.length - i}`}
                    onClick={() => setDeleting(entry.id)}
                  >
                    ×
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      <p className="little-note">
        Designs stay in this browser on this device. Save pictures to keep a copy elsewhere.
      </p>
    </>
  );
}
