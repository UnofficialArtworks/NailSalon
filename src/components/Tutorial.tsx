import { Icon, Bottle } from './Icon';
export function Tutorial({ onDone }: { onDone: () => void }) {
  return (
    <>
      <p className="modal-intro">Welcome to your little salon. Let’s make something lovely!</p>
      <div className="tutorial-steps">
        <div>
          <span className="step-art">◌</span>
          <h3>1. A fresh start</h3>
          <p>Tap a nail, then swipe to clean it. Choose any nail shape.</p>
        </div>
        <div>
          <Bottle color="#f597b7" size={60} />
          <h3>2. Paint it your way</h3>
          <p>Brush on a color, or use Fill. Undo always helps you try again.</p>
        </div>
        <div>
          <Icon id="sticker-2" size={60} />
          <h3>3. Add a little magic</h3>
          <p>Tap to place stickers and gems. Patterns make a whole nail pretty!</p>
        </div>
        <div>
          <Icon id="star" size={60} />
          <h3>4. Make someone smile</h3>
          <p>Customers show two wishes. Every finished manicure earns a star.</p>
        </div>
      </div>
      <p className="little-note">No timers. No mistakes. Just your imagination.</p>
      <button className="primary full-width" onClick={onDone}>
        Let’s create!
      </button>
    </>
  );
}
