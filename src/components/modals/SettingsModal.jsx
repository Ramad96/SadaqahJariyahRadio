import { X, Settings } from 'lucide-react';

/**
 * @param {{
 *   onClose: () => void,
 *   scriptType: string,
 *   onScriptTypeChange: (type: string) => void,
 *   showTranslation: boolean,
 *   onShowTranslationChange: (show: boolean) => void,
 *   theme: string,
 *   onThemeChange: (theme: string) => void,
 * }} props
 */
export default function SettingsModal({ onClose, scriptType, onScriptTypeChange, showTranslation, onShowTranslationChange, theme, onThemeChange }) {
  const scriptOptions = [
    { id: 'uthmani', label: 'Uthmani', sub: 'Madani Mushaf' },
    { id: 'indopak', label: 'IndoPak', sub: 'Nastaleeq Style' },
  ];

  const themeOptions = [
    { id: 'dark', label: 'Dark', icon: '🌙' },
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'light', label: 'Light', icon: '☀️' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="bg-brand-surface rounded-3xl shadow-2xl max-w-sm w-full"
        style={{ border: '1px solid var(--border-mid)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--settings-icon-bg)' }}>
              <Settings size={14} style={{ color: 'var(--gold)' }} />
            </div>
            <h2 id="settings-modal-title" className="text-base font-semibold text-brand-text">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-elevated transition-all"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Quran Script */}
          <div>
            <p className="text-[10px] font-brand-mono font-medium uppercase mb-2.5" style={{ color: 'var(--text-faint)', letterSpacing: '1.5px' }}>Quran Script</p>
            <div className="grid grid-cols-2 gap-2">
              {scriptOptions.map(({ id, label, sub }) => {
                const active = scriptType === id;
                return (
                  <button
                    key={id}
                    onClick={() => onScriptTypeChange(id)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${active ? 'text-brand-void' : 'bg-brand-elevated text-brand-text hover:bg-brand-elevated'}`}
                    style={active ? { background: 'var(--gold-gradient)' } : { border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="font-semibold">{label}</div>
                    <div className={`text-xs mt-0.5 ${active ? 'opacity-60' : 'opacity-50'}`}>{sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--border-subtle)' }} />

          {/* Appearance */}
          <div>
            <p className="text-[10px] font-brand-mono font-medium uppercase mb-2.5" style={{ color: 'var(--text-faint)', letterSpacing: '1.5px' }}>Appearance</p>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ id, label, icon }) => {
                const active = theme === id;
                return (
                  <button
                    key={id}
                    onClick={() => onThemeChange(id)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'text-brand-void' : 'bg-brand-elevated text-brand-text'}`}
                    style={active ? { background: 'var(--gold-gradient)' } : { border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="text-base mb-0.5">{icon}</div>
                    <div className="text-xs font-semibold">{label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--border-subtle)' }} />

          {/* Translation */}
          <div>
            <p className="text-[10px] font-brand-mono font-medium uppercase mb-2.5" style={{ color: 'var(--text-faint)', letterSpacing: '1.5px' }}>Translation</p>
            <button
              onClick={() => onShowTranslationChange(!showTranslation)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-brand-elevated hover:bg-brand-elevated transition-all"
              style={{ border: '1px solid var(--border-subtle)' }}
            >
              <div className="text-left">
                <div className="text-sm font-semibold text-brand-text">English Translation</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Saheeh International</div>
              </div>
              <div
                className="relative rounded-full transition-all flex-shrink-0"
                style={{
                  background: showTranslation ? 'var(--gold-gradient)' : 'var(--toggle-off-bg)',
                  border: showTranslation ? 'none' : '1px solid var(--border-mid)',
                  width: '42px',
                  height: '24px',
                }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all"
                  style={{
                    transform: showTranslation ? 'translateX(18px)' : 'translateX(2px)',
                    background: showTranslation ? 'var(--bg-void)' : 'var(--toggle-thumb-off)',
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
