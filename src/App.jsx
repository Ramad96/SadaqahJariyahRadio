import { useState, useEffect, useRef } from 'react';
import Balcony from './components/Balcony';
import SurahLibrary from './components/SurahLibrary';
import { surahs } from './data/surahs';

const VERSION = '1.0.5';

function App() {
  const [currentSurah, setCurrentSurah] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef(null);
  const currentSurahRef = useRef(null);
  
  useEffect(() => {
    document.title = `Sadaqah Jariyah Radio Station v${VERSION}`;
  }, []);
  
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
    if (currentSurah && audioRef.current && currentSurah.audioUrl) {
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
    if (surah.audioUrl) {
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
    while (!surahs[nextIndex].audioUrl && attempts < surahs.length) {
      nextIndex = (nextIndex + 1) % surahs.length;
      attempts++;
    }
    if (surahs[nextIndex].audioUrl) {
      setCurrentSurah(surahs[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (!currentSurah) return;
    const currentIndex = surahs.findIndex(s => s.id === currentSurah.id);
    // Find previous surah with audio
    let prevIndex = currentIndex === 0 ? surahs.length - 1 : currentIndex - 1;
    let attempts = 0;
    while (!surahs[prevIndex].audioUrl && attempts < surahs.length) {
      prevIndex = prevIndex === 0 ? surahs.length - 1 : prevIndex - 1;
      attempts++;
    }
    if (surahs[prevIndex].audioUrl) {
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
          while (!surahs[nextIndex].audioUrl && attempts < surahs.length) {
            nextIndex = (nextIndex + 1) % surahs.length;
            attempts++;
          }
          if (surahs[nextIndex].audioUrl) {
            setCurrentSurah(surahs[nextIndex]);
          }
          break;
        }
        case 'ArrowLeft': {
          const currentIndex = surahs.findIndex(s => s.id === currentSurahRef.current.id);
          // Find previous surah with audio
          let prevIndex = currentIndex === 0 ? surahs.length - 1 : currentIndex - 1;
          let attempts = 0;
          while (!surahs[prevIndex].audioUrl && attempts < surahs.length) {
            prevIndex = prevIndex === 0 ? surahs.length - 1 : prevIndex - 1;
            attempts++;
          }
          if (surahs[prevIndex].audioUrl) {
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
        version={VERSION}
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
