import { X } from 'lucide-react';

export default function BookmarkModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmark-modal-title"
        className="bg-brand-surface rounded-3xl shadow-2xl max-w-md w-full p-6 flex flex-col"
        style={{ border: '1px solid var(--border-subtle)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center relative mb-4 flex-shrink-0">
          <h2 id="bookmark-modal-title" className="text-xl font-semibold text-brand-text">Bookmark</h2>
          <button
            onClick={onClose}
            className="absolute right-0 p-1 rounded-lg hover:bg-brand-elevated transition-all"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="text-sm leading-relaxed text-center" style={{ color: 'var(--text-muted)' }}>
          <h3 className="text-brand-text font-semibold mb-3">Add to iPhone Home Screen</h3>
          <ol className="space-y-2 list-decimal list-inside">
            <li>Open this website in <span className="font-semibold text-brand-text">Safari</span></li>
            <li>Tap the <span className="font-semibold text-brand-text">Share</span> button at the bottom of the screen (the square with an arrow pointing up)</li>
            <li>Scroll down and tap <span className="font-semibold text-brand-text">Add to Home Screen</span></li>
            <li>Tap <span className="font-semibold text-brand-text">Add</span> in the top right corner</li>
          </ol>
          <p className="mt-3 text-xs" style={{ color: 'var(--text-faint)' }}>The app will appear on your home screen and open in full screen, just like a native app.</p>
        </div>
      </div>
    </div>
  );
}
