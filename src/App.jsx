import { useState, useEffect, useRef } from 'react';
import Balcony from './components/Balcony';
import SurahLibrary from './components/SurahLibrary';
import { surahs } from './data/surahs';

function App() {
  const [currentSurah, setCurrentSurah] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef(null);
  const currentSurahRef = useRef(null);
  
  useEffect(() => {
    currentSurahRef.current = currentSurah;
  }, [currentSurah]);

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
        if (currentSurahRef.current) {
          const currentIndex = surahs.findIndex(s => s.id === currentSurahRef.current.id);
          const nextIndex = (currentIndex + 1) % surahs.length;
          setCurrentSurah(surahs[nextIndex]);
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
      audioRef.current.src = currentSurah.audioUrl;
      audioRef.current.load();
      setProgress(0);
      
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [currentSurah]);

  const handleSurahSelect = (surah) => {
    setCurrentSurah(surah);
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
    const nextIndex = (currentIndex + 1) % surahs.length;
    setCurrentSurah(surahs[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentSurah) return;
    const currentIndex = surahs.findIndex(s => s.id === currentSurah.id);
    const prevIndex = currentIndex === 0 ? surahs.length - 1 : currentIndex - 1;
    setCurrentSurah(surahs[prevIndex]);
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
          const nextIndex = (currentIndex + 1) % surahs.length;
          setCurrentSurah(surahs[nextIndex]);
          break;
        }
        case 'ArrowLeft': {
          const currentIndex = surahs.findIndex(s => s.id === currentSurahRef.current.id);
          const prevIndex = currentIndex === 0 ? surahs.length - 1 : currentIndex - 1;
          setCurrentSurah(surahs[prevIndex]);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Balcony
        currentSurah={currentSurah}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        progress={progress}
        duration={duration}
      />
      
      <SurahLibrary
        surahs={surahs}
        currentSurah={currentSurah}
        onSurahSelect={handleSurahSelect}
      />
    </div>
  );
}

export default App;
