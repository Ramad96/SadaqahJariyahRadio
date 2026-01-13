import { useState, useEffect, useRef, useMemo } from 'react';
import Balcony from './components/Balcony';
import SurahLibrary from './components/SurahLibrary';
import VersesDisplay from './components/VersesDisplay';
import { surahs as baseSurahs } from './data/surahs';
import { getClipsForSurah } from './data/clipsManifest';
import { incrementGlobalListeningTime } from './utils/supabase';

const VERSION = '2.21.0';

// Shuffle array function (Fisher-Yates algorithm)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function App() {
  const [currentSurah, setCurrentSurah] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isReplayEnabled, setIsReplayEnabled] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(() => {
    // Load from localStorage or default to "Default" for all surahs
    const saved = localStorage.getItem('selectedAudio');
    return saved ? JSON.parse(saved) : {};
  });
  const [totalListeningTime, setTotalListeningTime] = useState(() => {
    // Load accumulated listening time from localStorage (in seconds)
    const saved = localStorage.getItem('totalListeningTime');
    return saved ? parseFloat(saved) : 0;
  });
  
  // Always use clips mode
  const surahs = useMemo(() => {
    return baseSurahs.map(surah => {
      const clips = getClipsForSurah(surah.number, surah.folderName);
      // Randomize the order of audio options for each surah
      const randomizedClips = shuffleArray(clips);
      return {
        ...surah,
        audioOptions: randomizedClips,
        audioUrl: randomizedClips.length > 0 ? randomizedClips[0].url : null
      };
    });
  }, []);
  
  const audioRef = useRef(null);
  const currentSurahRef = useRef(null);
  const autoPlayNextRef = useRef(false);
  const isReplayEnabledRef = useRef(false);
  const listeningTimeIntervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(null);
  const accumulatedGlobalTimeRef = useRef(0); // Accumulate before sending to Supabase
  
  // Save selected audio to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedAudio', JSON.stringify(selectedAudio));
  }, [selectedAudio]);

  // Save total listening time to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('totalListeningTime', totalListeningTime.toString());
  }, [totalListeningTime]);

  // Track listening time when audio is playing
  useEffect(() => {
    if (isPlaying) {
      // Start tracking time
      lastUpdateTimeRef.current = Date.now();
      listeningTimeIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - lastUpdateTimeRef.current) / 1000; // Convert to seconds
        lastUpdateTimeRef.current = now;
        
        setTotalListeningTime(prev => {
          const newTotal = prev + elapsed;
          // Save to localStorage immediately for persistence
          localStorage.setItem('totalListeningTime', newTotal.toString());
          return newTotal;
        });
        
        // Accumulate for global stats (batch updates every 10 seconds to reduce API calls)
        accumulatedGlobalTimeRef.current += elapsed;
        if (accumulatedGlobalTimeRef.current >= 10) {
          const timeToSend = accumulatedGlobalTimeRef.current;
          accumulatedGlobalTimeRef.current = 0;
          // Send to Supabase asynchronously (don't wait for response)
          incrementGlobalListeningTime(timeToSend).catch(err => {
            console.error('Failed to update global listening time:', err);
            // Re-accumulate if it failed (will retry next interval)
            accumulatedGlobalTimeRef.current += timeToSend;
          });
        }
      }, 1000); // Update every second
    } else {
      // Stop tracking time
      if (listeningTimeIntervalRef.current) {
        clearInterval(listeningTimeIntervalRef.current);
        listeningTimeIntervalRef.current = null;
      }
      // Save any remaining time
      if (lastUpdateTimeRef.current) {
        const now = Date.now();
        const elapsed = (now - lastUpdateTimeRef.current) / 1000;
        if (elapsed > 0) {
          setTotalListeningTime(prev => {
            const newTotal = prev + elapsed;
            localStorage.setItem('totalListeningTime', newTotal.toString());
            return newTotal;
          });
          
          // Send remaining accumulated time to global stats
          accumulatedGlobalTimeRef.current += elapsed;
          if (accumulatedGlobalTimeRef.current > 0) {
            const timeToSend = accumulatedGlobalTimeRef.current;
            accumulatedGlobalTimeRef.current = 0;
            incrementGlobalListeningTime(timeToSend).catch(err => {
              console.error('Failed to update global listening time:', err);
            });
          }
        }
        lastUpdateTimeRef.current = null;
      } else if (accumulatedGlobalTimeRef.current > 0) {
        // Send any remaining accumulated time when stopping
        const timeToSend = accumulatedGlobalTimeRef.current;
        accumulatedGlobalTimeRef.current = 0;
        incrementGlobalListeningTime(timeToSend).catch(err => {
          console.error('Failed to update global listening time:', err);
        });
      }
    }

    return () => {
      if (listeningTimeIntervalRef.current) {
        clearInterval(listeningTimeIntervalRef.current);
        listeningTimeIntervalRef.current = null;
      }
    };
  }, [isPlaying]);
  
  
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
    isReplayEnabledRef.current = isReplayEnabled;
  }, [isReplayEnabled]);

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
        // If replay is enabled, the audio will loop automatically
        // Only handle ended event if replay is not enabled
        if (!isReplayEnabledRef.current) {
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
        
        // Set initial loop state
        audioRef.current.loop = isReplayEnabled;
        
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSurah, selectedAudio]);

  // Update loop property when replay is toggled, without reloading the audio
  useEffect(() => {
    if (audioRef.current && currentSurah) {
      audioRef.current.loop = isReplayEnabled;
    }
  }, [isReplayEnabled, currentSurah]);

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

  const handleReplayToggle = () => {
    if (!audioRef.current) return;
    const newReplayState = !isReplayEnabled;
    setIsReplayEnabled(newReplayState);
    audioRef.current.loop = newReplayState;
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
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        progress={progress}
        duration={duration}
        version={VERSION}
        onShowAbout={() => setShowAbout(true)}
        isReplayEnabled={isReplayEnabled}
        onReplayToggle={handleReplayToggle}
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
        totalListeningTime={totalListeningTime}
        isReplayEnabled={isReplayEnabled}
        onReplayToggle={handleReplayToggle}
      />
      
      <VersesDisplay
        currentSurah={currentSurah}
        currentAudioOption={currentAudioOption}
      />
      
      <footer className="w-full py-6 mt-8 border-t border-slate-800 pb-[400px] md:pb-[400px]">
        <div className="text-center text-slate-400 text-sm">
          Created by <span className="text-slate-300 font-semibold">AmanahDigital1447</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
