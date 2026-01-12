import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Radio, Repeat } from 'lucide-react';
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
  onShowAbout,
  isReplayEnabled,
  onReplayToggle
}) {
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

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

          {/* Right: About Us */}
          <div className="flex-shrink-0">
            <button
              onClick={onShowAbout}
              className="text-white font-bold text-base hover:text-white/80 transition-all"
              aria-label="About Us"
            >
              About Us
            </button>
            <span className="text-white/80 font-normal text-xs ml-2">v{version}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
