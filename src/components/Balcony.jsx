import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Radio, Repeat, Menu } from 'lucide-react';
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
  onReplayToggle
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
      // Add ayah range in brackets if range exists
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
      className="fixed top-0 left-0 right-0 z-50 bg-orange-500 shadow-lg"
      role="banner"
    >
      {/* Version number in corner */}
      <div className="absolute top-0.5 right-1 z-10">
        <span className="text-white/60 font-normal text-[10px]">v{version}</span>
      </div>
      
      <div className="px-4 py-4">
        <div className="flex items-center justify-between relative">
          {/* Left: Surah Name */}
          <div ref={containerRef} className="flex-shrink-0 max-w-[calc(50%-80px)] overflow-hidden">
            <div 
              ref={textRef}
              className={`text-white font-bold text-base whitespace-nowrap ${shouldScroll ? 'animate-scroll' : ''}`}
            >
              {shouldScroll 
                ? `${baseText} ••• ${baseText} ••• ${baseText} ••• ${baseText} •••`
                : baseText}
            </div>
          </div>

          {/* Center: Controls */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <button
              onClick={onPrevious}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white disabled:opacity-40 transition-all active:scale-95"
              aria-label="Previous"
              disabled={!currentSurah}
            >
              <SkipBack size={18} />
            </button>
            
            <button
              onClick={onPlayPause}
              className="p-2.5 rounded-full bg-white hover:bg-white/90 text-orange-500 disabled:opacity-40 transition-all shadow-lg active:scale-95"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              disabled={!currentSurah}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            
            <button
              onClick={onReplayToggle}
              className={`p-2 rounded-full transition-all active:scale-95 ${
                isReplayEnabled
                  ? 'bg-white text-orange-500 hover:bg-white/90'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              } disabled:opacity-40`}
              aria-label={isReplayEnabled ? 'Disable replay' : 'Enable replay'}
              disabled={!currentSurah}
            >
              <Repeat size={18} />
            </button>
            
            <button
              onClick={onNext}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white disabled:opacity-40 transition-all active:scale-95"
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
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[150px]">
                  <button
                    onClick={() => { onMenuSelect('about'); setShowMenu(false); }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
                  >
                    About Us
                  </button>
                  <div className="h-px bg-slate-700" />
                  <button
                    onClick={() => { onMenuSelect('bookmark'); setShowMenu(false); }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
                  >
                    Bookmark
                  </button>
                  <div className="h-px bg-slate-700" />
                  <button
                    onClick={() => { onMenuSelect('community'); setShowMenu(false); }}
                    className="w-full px-4 py-3 text-left text-sm text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
                  >
                    Community
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
