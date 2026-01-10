import { useState, useEffect, useRef, useMemo } from 'react';
import Balcony from './components/Balcony';
import SurahLibrary from './components/SurahLibrary';
import { surahs as baseSurahs } from './data/surahs';
import { getClipsForSurah } from './data/clipsManifest';

const VERSION = '2.1.0';

function App() {
  const [currentSurah, setCurrentSurah] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [audioMode, setAudioMode] = useState(() => {
    // Load from localStorage or default to 'wholeQuran'
    const saved = localStorage.getItem('audioMode');
    return saved || 'wholeQuran';
  });
  const [selectedAudio, setSelectedAudio] = useState(() => {
    // Load from localStorage or default to "Default" for all surahs
    const saved = localStorage.getItem('selectedAudio');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Enrich surahs with clips when in clips mode
  const surahs = useMemo(() => {
    if (audioMode === 'clips') {
      return baseSurahs.map(surah => {
        const clips = getClipsForSurah(surah.number, surah.folderName);
        return {
          ...surah,
          audioOptions: clips,
          audioUrl: clips.length > 0 ? clips[0].url : null
        };
      });
    } else {
      return baseSurahs;
    }
  }, [audioMode]);
  
  const audioRef = useRef(null);
  const currentSurahRef = useRef(null);
  const autoPlayNextRef = useRef(false);
  
  // Save selected audio to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedAudio', JSON.stringify(selectedAudio));
  }, [selectedAudio]);
  
  // Save audio mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('audioMode', audioMode);
    // Clear selected audio when mode changes to avoid confusion
    setSelectedAudio({});
  }, [audioMode]);
  
  // Clear current surah if it doesn't have audio when surahs change (mode switch)
  useEffect(() => {
    if (currentSurah) {
      const surah = surahs.find(s => s.id === currentSurah.id);
      if (!surah || !surah.audioOptions || surah.audioOptions.length === 0) {
        setCurrentSurah(null);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      }
    }
  }, [surahs, currentSurah]);
  
  // Get the audio URL for a surah based on selected audio option
  const getSurahAudioUrl = (surah) => {
    if (!surah || !surah.audioOptions || surah.audioOptions.length === 0) return null;
    const selectedOptionName = selectedAudio[surah.id];
    const selectedOption = selectedOptionName 
      ? surah.audioOptions.find(opt => opt.name === selectedOptionName) 
      : null;
    const option = selectedOption || surah.audioOptions[0];
    return option?.url || null;
  };
  
  useEffect(() => {
    document.title = `Sadaqah Jariyah Radio Station v${VERSION}`;
  }, []);
  
  useEffect(() => {
    currentSurahRef.current = currentSurah;
  }, [currentSurah]);

  useEffect(() => {
    autoPlayNextRef.current = autoPlayNext;
  }, [autoPlayNext]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        setProgress(audioRef.current.currentTime);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
        // Only auto-play next if the option is enabled
        if (autoPlayNextRef.current && currentSurahRef.current) {
          const currentIndex = surahs.findIndex(s => s.id === currentSurahRef.current.id);
          // Find next surah with audio
          let nextIndex = (currentIndex + 1) % surahs.length;
          let attempts = 0;
          while (!surahs[nextIndex].audioUrl && attempts < surahs.length) {
            nextIndex = (nextIndex + 1) % surahs.length;
            attempts++;
          }
          if (surahs[nextIndex].audioUrl) {
            setCurrentSurah(surahs[nextIndex]);
          }
        }
      });
      
      audioRef.current.addEventListener('error', () => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (currentSurah && audioRef.current) {
      const audioUrl = getSurahAudioUrl(currentSurah);
      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        setProgress(0);
        
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }
  }, [currentSurah, selectedAudio]);

  const handleSurahSelect = (surah) => {
    const audioUrl = getSurahAudioUrl(surah);
    if (audioUrl) {
      setCurrentSurah(surah);
    }
  };
  
  const handleAudioSelect = (surahId, audioName) => {
    setSelectedAudio(prev => ({
      ...prev,
      [surahId]: audioName
    }));
    // Find the surah and start playing it with the selected reciter
    const surah = surahs.find(s => s.id === surahId);
    if (surah) {
      setCurrentSurah(surah);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !currentSurah) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const handleNext = () => {
    if (!currentSurah) return;
    const currentIndex = surahs.findIndex(s => s.id === currentSurah.id);
    // Find next surah with audio
    let nextIndex = (currentIndex + 1) % surahs.length;
    let attempts = 0;
    let nextAudioUrl = getSurahAudioUrl(surahs[nextIndex]);
    while (!nextAudioUrl && attempts < surahs.length) {
      nextIndex = (nextIndex + 1) % surahs.length;
      attempts++;
      nextAudioUrl = getSurahAudioUrl(surahs[nextIndex]);
    }
    if (nextAudioUrl) {
      setCurrentSurah(surahs[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (!currentSurah) return;
    const currentIndex = surahs.findIndex(s => s.id === currentSurah.id);
    // Find previous surah with audio
    let prevIndex = currentIndex === 0 ? surahs.length - 1 : currentIndex - 1;
    let attempts = 0;
    let prevAudioUrl = getSurahAudioUrl(surahs[prevIndex]);
    while (!prevAudioUrl && attempts < surahs.length) {
      prevIndex = prevIndex === 0 ? surahs.length - 1 : prevIndex - 1;
      attempts++;
      prevAudioUrl = getSurahAudioUrl(surahs[prevIndex]);
    }
    if (prevAudioUrl) {
      setCurrentSurah(surahs[prevIndex]);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if ([' ', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      if (!currentSurahRef.current) return;

      switch (e.key) {
        case ' ':
          if (audioRef.current) {
            if (isPlaying) {
              audioRef.current.pause();
              setIsPlaying(false);
            } else {
              audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            }
          }
          break;
        case 'ArrowRight': {
          const currentIndex = surahs.findIndex(s => s.id === currentSurahRef.current.id);
          // Find next surah with audio
          let nextIndex = (currentIndex + 1) % surahs.length;
          let attempts = 0;
          const nextSurah = surahs[nextIndex];
          let nextAudioUrl = getSurahAudioUrl(nextSurah);
          while (!nextAudioUrl && attempts < surahs.length) {
            nextIndex = (nextIndex + 1) % surahs.length;
            attempts++;
            nextAudioUrl = getSurahAudioUrl(surahs[nextIndex]);
          }
          if (nextAudioUrl) {
            setCurrentSurah(surahs[nextIndex]);
          }
          break;
        }
        case 'ArrowLeft': {
          const currentIndex = surahs.findIndex(s => s.id === currentSurahRef.current.id);
          // Find previous surah with audio
          let prevIndex = currentIndex === 0 ? surahs.length - 1 : currentIndex - 1;
          let attempts = 0;
          let prevAudioUrl = getSurahAudioUrl(surahs[prevIndex]);
          while (!prevAudioUrl && attempts < surahs.length) {
            prevIndex = prevIndex === 0 ? surahs.length - 1 : prevIndex - 1;
            attempts++;
            prevAudioUrl = getSurahAudioUrl(surahs[prevIndex]);
          }
          if (prevAudioUrl) {
            setCurrentSurah(surahs[prevIndex]);
          }
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  // Get the selected audio option for the current surah
  const currentAudioOption = currentSurah ? (() => {
    const selectedOptionName = selectedAudio[currentSurah.id];
    const option = selectedOptionName 
      ? currentSurah.audioOptions?.find(opt => opt.name === selectedOptionName) 
      : null;
    return option || currentSurah.audioOptions?.[0] || null;
  })() : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Balcony
        currentSurah={currentSurah}
        currentAudioOption={currentAudioOption}
        audioMode={audioMode}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        progress={progress}
        duration={duration}
        version={VERSION}
        onShowAbout={() => setShowAbout(true)}
      />
      
      <SurahLibrary
        surahs={surahs}
        currentSurah={currentSurah}
        onSurahSelect={handleSurahSelect}
        autoPlayNext={autoPlayNext}
        onAutoPlayNextChange={setAutoPlayNext}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        showAbout={showAbout}
        onCloseAbout={() => setShowAbout(false)}
        selectedAudio={selectedAudio}
        onAudioSelect={handleAudioSelect}
        getSurahAudioUrl={getSurahAudioUrl}
        audioMode={audioMode}
        onAudioModeChange={setAudioMode}
      />
      
      <footer className="w-full py-6 mt-8 border-t border-slate-800">
        <div className="text-center text-slate-400 text-sm">
          Created by <span className="text-slate-300 font-semibold">AmanahDigital1447</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
