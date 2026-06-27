import { X } from 'lucide-react';

export default function HelpModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="bg-brand-surface rounded-3xl shadow-2xl max-w-md w-full p-6"
        style={{ border: '1px solid var(--border-subtle)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="help-modal-title" className="text-xl font-semibold text-brand-text">How to Use</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-brand-elevated transition-all"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="text-sm leading-relaxed space-y-4" style={{ color: 'var(--text-muted)' }}>
          <div>
            <h3 className="text-brand-text font-semibold mb-2">About Clips:</h3>
            <p>This app features audio clips - specific verse ranges or segments of surahs. Each clip shows the verse range (e.g., 1-7) so you know which verses are included.</p>
          </div>
          <div>
            <h3 className="text-brand-text font-semibold mb-2">Selecting a Reciter:</h3>
            <p>Click on a surah to see available reciters. Then click on "Reciter: [name]" to expand the list and choose from different reciters or audio clips with specific verse ranges.</p>
          </div>
          <div>
            <h3 className="text-brand-text font-semibold mb-2">Reciter Filter:</h3>
            <p>Use the filter button (with the filter icon) above the search bar to filter all surahs by a specific reciter. This will show only surahs that have recordings from the selected reciter. Select "All Reciters" to see all available surahs again.</p>
          </div>
          <div>
            <h3 className="text-brand-text font-semibold mb-2">Verses Display:</h3>
            <p>When you select a recitation with a verse range, the verses section will appear below the surah list showing the Arabic text of those verses. You can collapse or expand this section using the chevron button. The verses are displayed with their verse numbers for easy reference.</p>
          </div>
          <div>
            <h3 className="text-brand-text font-semibold mb-2">Tips:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use the search bar to find surahs quickly</li>
              <li>Enable "With audio only" to filter surahs that have available recordings</li>
              <li>Use the reciter filter to browse surahs by a specific reciter</li>
              <li>Enable "Auto play next" to automatically continue to the next surah</li>
              <li>View the verses section to read along with the recitation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
