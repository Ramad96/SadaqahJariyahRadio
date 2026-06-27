import { X, Settings } from 'lucide-react';

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * @param {{
 *   onClose: () => void,
 *   scriptType: string,
 *   onScriptTypeChange: (type: string) => void,
 *   showTranslation: boolean,
 *   onShowTranslationChange: (show: boolean) => void,
 *   theme: string,
 *   onThemeChange: (theme: string) => void,
 *   playbackSpeed: number,
 *   onSpeedChange: (speed: number) => void,
 *   volume: number,
 *   onVolumeChange: (vol: number) => void,
 *   sleepTimerMinutes: number|null,
 *   sleepTimerRemaining: number|null,
 *   onSleepTimerSet: (minutes: number|null) => void,
 * }} props
 */
export default function SettingsModal({
  onClose,
  scriptType, onScriptTypeChange,
  showTranslation, onShowTranslationChange,
  theme, onThemeChange,
  playbackSpeed, onSpeedChange,
  volume, onVolumeChange,
  sleepTimerMinutes, sleepTimerRemaining, onSleepTimerSet,
}) {
  const scriptOptions = [
    { id: 'uthmani', label: 'Uthmani', sub: 'Madani Mushaf' },
    { id: 'indopak', label: 'IndoPak', sub: 'Nastaleeq Style' },
  ];

  const themeOptions = [
    { id: 'dark', label: 'Dark', icon: '🌙' },
    { id: 'system', label: 'System', icon: '⚙️' },
    { id: 'light', label: 'Light', icon: '☀️' },
  ];

  const speedOptions = [0.75, 1, 1.25, 1.5];
  const timerOptions = [15, 30, 60];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="bg-brand-surface rounded-3xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto"
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
          {/* Playback Speed */}
          <div>
            <p className="text-[10px] font-brand-mono font-medium uppercase mb-2.5" style={{ color: 'var(--text-faint)', letterSpacing: '1.5px' }}>Playback Speed</p>
            <div className="grid grid-cols-4 gap-2">
              {speedOptions.map((speed) => {
                const active = playbackSpeed === speed;
                return (
                  <button
                    key={speed}
                    onClick={() => onSpeedChange(speed)}
                    className={`px-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? 'text-brand-void' : 'bg-brand-elevated text-brand-text'}`}
                    style={active ? { background: 'var(--gold-gradient)' } : { border: '1px solid var(--border-subtle)' }}
                  >
                    {speed}x
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--border-subtle)' }} />

          {/* Volume */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-brand-mono font-medium uppercase" style={{ color: 'var(--text-faint)', letterSpacing: '1.5px' }}>Volume</p>
              <span className="text-[11px] font-brand-mono" style={{ color: 'var(--text-muted)' }}>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: 'var(--gold)' }}
              aria-label="Volume"
            />
          </div>

          <div className="h-px" style={{ background: 'var(--border-subtle)' }} />

          {/* Sleep Timer */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-brand-mono font-medium uppercase" style={{ color: 'var(--text-faint)', letterSpacing: '1.5px' }}>Sleep Timer</p>
              {sleepTimerRemaining !== null && sleepTimerRemaining > 0 && (
                <span className="text-[11px] font-brand-mono" style={{ color: 'var(--gold)' }}>
                  Stops in {formatCountdown(sleepTimerRemaining)}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => onSleepTimerSet(null)}
                className={`px-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${!sleepTimerMinutes ? 'text-brand-void' : 'bg-brand-elevated text-brand-text'}`}
                style={!sleepTimerMinutes ? { background: 'var(--gold-gradient)' } : { border: '1px solid var(--border-subtle)' }}
              >
                Off
              </button>
              {timerOptions.map((min) => {
                const active = sleepTimerMinutes === min;
                return (
                  <button
                    key={min}
                    onClick={() => onSleepTimerSet(min)}
                    className={`px-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? 'text-brand-void' : 'bg-brand-elevated text-brand-text'}`}
                    style={active ? { background: 'var(--gold-gradient)' } : { border: '1px solid var(--border-subtle)' }}
                  >
                    {min}m
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px" style={{ background: 'var(--border-subtle)' }} />

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
