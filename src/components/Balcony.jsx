import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Menu, Info, Bookmark, Users, Settings } from 'lucide-react';
import { getRangeDisplay } from '../utils/clipParser';

export default function Balcony({
  currentSurah,
  currentAudioOption,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  progress,
  duration,
  version,
  onMenuSelect,
  isReplayEnabled,
  onReplayToggle,
  isShuffleEnabled,
  onShuffleToggle,
}) {
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Build the display text with surah name, reciter, and ayah range
  const baseText = currentSurah ? (() => {
    let text = currentSurah.name;
    if (currentAudioOption) {
      const reciterName = currentAudioOption.reciter || currentAudioOption.name;
      text += ` - ${reciterName}`;
      if (currentAudioOption.range) {
        const rangeDisplay = getRangeDisplay(currentAudioOption.range, currentSurah.totalAyahs);
        text += ` (${rangeDisplay})`;
      }
    }
    return text;
  })() : 'No surah selected';

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.offsetWidth;
      setShouldScroll(textWidth > containerWidth);
    }
  }, [currentSurah, currentAudioOption]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-brand-surface shadow-lg"
      style={{ borderBottom: '1px solid var(--border-gold)' }}
      role="banner"
    >
      {/* Version number in corner */}
      <div className="absolute top-0.5 right-1 z-10">
        <span className="font-brand-mono font-normal text-[10px]" style={{ color: 'var(--text-faint)' }}>v{version}</span>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center justify-between relative">
          {/* Left: Surah Name */}
          <div ref={containerRef} className="flex-shrink-0 max-w-[calc(50%-80px)] overflow-hidden">
            <div
              ref={textRef}
              className={`text-brand-text font-medium text-[15px] whitespace-nowrap ${shouldScroll ? 'animate-scroll' : ''}`}
              style={{ opacity: 0.85 }}
            >
              {shouldScroll
                ? `${baseText} ••• ${baseText} ••• ${baseText} ••• ${baseText} •••`
                : baseText}
            </div>
          </div>

          {/* Center: Controls */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1.5">
            <button
              onClick={onPrevious}
              className="p-2 rounded-full btn-icon text-brand-text disabled:opacity-40 transition-all active:scale-95"
              aria-label="Previous"
              disabled={!currentSurah}
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={onShuffleToggle}
              className={`p-2 rounded-full transition-all active:scale-95 ${
                isShuffleEnabled
                  ? 'bg-brand-gold text-brand-void hover:bg-brand-gold-mid'
                  : 'btn-icon text-brand-text'
              } disabled:opacity-40`}
              aria-label={isShuffleEnabled ? 'Disable shuffle' : 'Enable shuffle'}
              disabled={!currentSurah}
            >
              <Shuffle size={16} />
            </button>

            <button
              onClick={onPlayPause}
              className="p-2.5 rounded-full bg-brand-gold hover:bg-brand-gold-mid text-brand-void disabled:opacity-40 transition-all shadow-lg active:scale-95"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={!currentSurah}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>

            <button
              onClick={onReplayToggle}
              className={`p-2 rounded-full transition-all active:scale-95 ${
                isReplayEnabled
                  ? 'bg-brand-gold text-brand-void hover:bg-brand-gold-mid'
                  : 'btn-icon text-brand-text'
              } disabled:opacity-40`}
              aria-label={isReplayEnabled ? 'Disable replay' : 'Enable replay'}
              disabled={!currentSurah}
            >
              <Repeat size={16} />
            </button>

            <button
              onClick={onNext}
              className="p-2 rounded-full btn-icon text-brand-text disabled:opacity-40 transition-all active:scale-95"
              aria-label="Next"
              disabled={!currentSurah}
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Right: Hamburger Menu */}
          <div className="flex-shrink-0 relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg transition-all active:scale-95 hover:text-brand-gold text-brand-text"
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div
                  className="absolute right-0 top-full mt-2 bg-brand-surface rounded-2xl shadow-2xl z-50 overflow-hidden min-w-[190px]"
                  style={{ border: '1px solid var(--border-mid)' }}
                >
                  {[
                    { key: 'about', label: 'About Us', icon: Info },
                    { key: 'bookmark', label: 'Bookmark', icon: Bookmark },
                    { key: 'community', label: 'Community', icon: Users },
                    { key: 'settings', label: 'Settings', icon: Settings },
                  ].map(({ key, label, icon: Icon }, i, arr) => (
                    <div key={key}>
                      <button
                        onClick={() => { onMenuSelect(key); setShowMenu(false); }}
                        className="w-full px-4 py-3 text-left text-sm text-brand-text hover:bg-brand-elevated transition-all flex items-center gap-3 group"
                      >
                        <Icon size={15} className="opacity-50 group-hover:opacity-80 transition-opacity flex-shrink-0" />
                        <span>{label}</span>
                      </button>
                      {i < arr.length - 1 && <div className="h-px mx-3" style={{ background: 'var(--border-subtle)' }} />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
