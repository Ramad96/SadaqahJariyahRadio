import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export default function Balcony({ 
  currentSurah, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious, 
  progress, 
  duration,
  version,
  onShowAbout
}) {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-orange-500 shadow-lg"
      role="banner"
    >
      <div className="px-4 py-4">
        <div className="flex items-center justify-between relative">
          {/* Left: Surah Name */}
          <div className="flex-shrink-0">
            <span className="text-white font-bold text-base">
              {currentSurah ? currentSurah.name : 'No surah selected'}
            </span>
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
