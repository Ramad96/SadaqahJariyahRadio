import { useState, useEffect, useRef } from 'react';

/**
 * @typedef {Object} AudioOption
 * @property {string} name
 * @property {string} url
 * @property {string} [reciter]
 * @property {string} [range]
 * @property {boolean} [isClip]
 */

/**
 * @typedef {Object} Surah
 * @property {string} id
 * @property {number} number
 * @property {string} name
 * @property {string} [nameArabic]
 * @property {string} folderName
 * @property {number} totalAyahs
 * @property {AudioOption[]} audioOptions
 * @property {string|null} audioUrl
 */

/**
 * Manages all audio playback state, refs, and handlers.
 * @param {Surah[]} surahs - Full enriched list with audioOptions
 */
export function useAudioPlayer(surahs) {
  const [currentSurah, setCurrentSurah] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReplayEnabled, setIsReplayEnabled] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(() => {
    const saved = localStorage.getItem('selectedAudio');
    return saved ? JSON.parse(saved) : {};
  });
  const [totalListeningTime, setTotalListeningTime] = useState(() => {
    const saved = localStorage.getItem('totalListeningTime');
    return saved ? parseFloat(saved) : 0;
  });

  const audioRef = useRef(null);
  const surahsRef = useRef(surahs);
  const currentSurahRef = useRef(null);
  const autoPlayNextRef = useRef(false);
  const isReplayEnabledRef = useRef(false);
  const isPlayingRef = useRef(false);
  const selectedAudioRef = useRef(selectedAudio);
  const filteredSurahsRef = useRef([]);
  const listeningTimeIntervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(null);

  useEffect(() => { surahsRef.current = surahs; }, [surahs]);
  useEffect(() => { currentSurahRef.current = currentSurah; }, [currentSurah]);
  useEffect(() => { autoPlayNextRef.current = autoPlayNext; }, [autoPlayNext]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isReplayEnabledRef.current = isReplayEnabled; }, [isReplayEnabled]);

  useEffect(() => {
    selectedAudioRef.current = selectedAudio;
    localStorage.setItem('selectedAudio', JSON.stringify(selectedAudio));
  }, [selectedAudio]);

  useEffect(() => {
    localStorage.setItem('totalListeningTime', totalListeningTime.toString());
  }, [totalListeningTime]);

  // Initialize a random clip selection for surahs that have no saved preference
  useEffect(() => {
    const saved = localStorage.getItem('selectedAudio');
    const savedSelections = saved ? JSON.parse(saved) : {};
    const needsInit = surahs.some(s => s.audioOptions?.length > 0 && !savedSelections[s.id]);
    if (needsInit) {
      const next = { ...savedSelections };
      surahs.forEach(s => {
        if (s.audioOptions?.length > 0 && !next[s.id]) {
          next[s.id] = s.audioOptions[Math.floor(Math.random() * s.audioOptions.length)].name;
        }
      });
      setSelectedAudio(next);
      localStorage.setItem('selectedAudio', JSON.stringify(next));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear current surah if its audio is no longer available
  useEffect(() => {
    if (currentSurah) {
      const surah = surahs.find(s => s.id === currentSurah.id);
      if (!surah?.audioOptions?.length) {
        setCurrentSurah(null);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      }
    }
  }, [surahs, currentSurah]);

  /**
   * Returns the audio URL for a surah based on the current selection.
   * Uses the ref so it is safe to call inside stale closures (event handlers, effects with [] deps).
   * @param {Surah} surah
   * @returns {string|null}
   */
  const getSurahAudioUrl = (surah) => {
    if (!surah?.audioOptions?.length) return null;
    const selectedOptionName = selectedAudioRef.current[surah.id];
    const selected = selectedOptionName
      ? surah.audioOptions.find(opt => opt.name === selectedOptionName)
      : null;
    return (selected || surah.audioOptions[0])?.url || null;
  };

  // Track local listening time while audio is playing
  useEffect(() => {
    if (isPlaying) {
      lastUpdateTimeRef.current = Date.now();
      listeningTimeIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - lastUpdateTimeRef.current) / 1000;
        lastUpdateTimeRef.current = now;
        setTotalListeningTime(prev => {
          const next = prev + elapsed;
          localStorage.setItem('totalListeningTime', next.toString());
          return next;
        });
      }, 1000);
    } else {
      if (listeningTimeIntervalRef.current) {
        clearInterval(listeningTimeIntervalRef.current);
        listeningTimeIntervalRef.current = null;
      }
      if (lastUpdateTimeRef.current) {
        const elapsed = (Date.now() - lastUpdateTimeRef.current) / 1000;
        if (elapsed > 0) {
          setTotalListeningTime(prev => {
            const next = prev + elapsed;
            localStorage.setItem('totalListeningTime', next.toString());
            return next;
          });
        }
        lastUpdateTimeRef.current = null;
      }
    }
    return () => {
      if (listeningTimeIntervalRef.current) {
        clearInterval(listeningTimeIntervalRef.current);
        listeningTimeIntervalRef.current = null;
      }
    };
  }, [isPlaying]);

  // Create the Audio element once and attach all event listeners
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();

      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
        setAudioError(null);
      });

      audioRef.current.addEventListener('timeupdate', () => {
        setProgress(audioRef.current.currentTime);
      });

      audioRef.current.addEventListener('ended', () => {
        if (isReplayEnabledRef.current) return;
        setIsPlaying(false);
        setProgress(0);
        if (!autoPlayNextRef.current || !currentSurahRef.current) return;

        const currentSurahId = currentSurahRef.current.id;
        const filtered = filteredSurahsRef.current;
        const currentSurahData = filtered.find(s => s.id === currentSurahId);

        // Try next clip within the same surah first
        if (currentSurahData?.audioOptions?.length > 1) {
          const clips = currentSurahData.audioOptions;
          const currentClipName = selectedAudioRef.current[currentSurahId];
          const currentClipIndex = clips.findIndex(c => c.name === currentClipName);
          if (currentClipIndex >= 0 && currentClipIndex < clips.length - 1) {
            setSelectedAudio(prev => ({ ...prev, [currentSurahId]: clips[currentClipIndex + 1].name }));
            return;
          }
        }

        // Move to the next surah in the filtered list
        const currentIndex = filtered.findIndex(s => s.id === currentSurahId);
        const list = currentIndex >= 0 ? filtered : surahsRef.current;
        const baseIndex = currentIndex >= 0 ? currentIndex : surahsRef.current.findIndex(s => s.id === currentSurahId);
        let nextIndex = (baseIndex + 1) % list.length;
        let attempts = 0;
        while (!list[nextIndex].audioUrl && attempts < list.length) {
          nextIndex = (nextIndex + 1) % list.length;
          attempts++;
        }
        if (list[nextIndex].audioUrl) {
          const nextFiltered = list[nextIndex];
          if (nextFiltered.audioOptions?.length > 0) {
            setSelectedAudio(prev => ({ ...prev, [nextFiltered.id]: nextFiltered.audioOptions[0].name }));
          }
          const next = surahsRef.current.find(s => s.id === nextFiltered.id) || nextFiltered;
          setCurrentSurah(next);
        }
      });

      audioRef.current.addEventListener('error', () => {
        setIsPlaying(false);
        setAudioError('Failed to load audio — please try another reciter.');
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Load and play when the current surah or selection changes
  useEffect(() => {
    if (currentSurah && audioRef.current) {
      const audioUrl = getSurahAudioUrl(currentSurah);
      if (audioUrl) {
        setAudioError(null);
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        setProgress(0);
        audioRef.current.loop = isReplayEnabled;
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSurah, selectedAudio]);

  // Sync the loop property when replay is toggled without reloading
  useEffect(() => {
    if (audioRef.current && currentSurah) {
      audioRef.current.loop = isReplayEnabled;
    }
  }, [isReplayEnabled, currentSurah]);

  // Global keyboard shortcuts — stable handler via refs, registered once
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ([' ', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      if (!currentSurahRef.current) return;

      const allSurahs = surahsRef.current;

      switch (e.key) {
        case ' ':
          if (audioRef.current) {
            if (isPlayingRef.current) {
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
          const idx = allSurahs.findIndex(s => s.id === currentSurahRef.current.id);
          let nextIndex = (idx + 1) % allSurahs.length;
          let attempts = 0;
          while (!getSurahAudioUrl(allSurahs[nextIndex]) && attempts < allSurahs.length) {
            nextIndex = (nextIndex + 1) % allSurahs.length;
            attempts++;
          }
          if (getSurahAudioUrl(allSurahs[nextIndex])) setCurrentSurah(allSurahs[nextIndex]);
          break;
        }
        case 'ArrowLeft': {
          const idx = allSurahs.findIndex(s => s.id === currentSurahRef.current.id);
          let prevIndex = idx === 0 ? allSurahs.length - 1 : idx - 1;
          let attempts = 0;
          while (!getSurahAudioUrl(allSurahs[prevIndex]) && attempts < allSurahs.length) {
            prevIndex = prevIndex === 0 ? allSurahs.length - 1 : prevIndex - 1;
            attempts++;
          }
          if (getSurahAudioUrl(allSurahs[prevIndex])) setCurrentSurah(allSurahs[prevIndex]);
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // --- Public handlers ---

  /** @param {Surah[]} filtered */
  const handleFilteredSurahsChange = (filtered) => {
    filteredSurahsRef.current = filtered;
  };

  /** @param {Surah} surah */
  const handleSurahSelect = (surah) => {
    if (getSurahAudioUrl(surah)) setCurrentSurah(surah);
  };

  /**
   * @param {string} surahId
   * @param {string} audioName
   */
  const handleAudioSelect = (surahId, audioName) => {
    setSelectedAudio(prev => ({ ...prev, [surahId]: audioName }));
    const surah = surahsRef.current.find(s => s.id === surahId);
    if (surah) setCurrentSurah(surah);
  };

  const handlePlayRandom = () => {
    const withAudio = surahsRef.current.filter(s => s.audioOptions?.length > 0);
    if (!withAudio.length) return;
    const randomSurah = withAudio[Math.floor(Math.random() * withAudio.length)];
    const randomOption = randomSurah.audioOptions[Math.floor(Math.random() * randomSurah.audioOptions.length)];
    setSelectedAudio(prev => ({ ...prev, [randomSurah.id]: randomOption.name }));
    setCurrentSurah(randomSurah);
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !currentSurah) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleReplayToggle = () => {
    if (!audioRef.current) return;
    const next = !isReplayEnabled;
    setIsReplayEnabled(next);
    audioRef.current.loop = next;
  };

  const handleNext = () => {
    if (!currentSurah) return;
    const allSurahs = surahsRef.current;
    const idx = allSurahs.findIndex(s => s.id === currentSurah.id);
    let nextIndex = (idx + 1) % allSurahs.length;
    let attempts = 0;
    while (!getSurahAudioUrl(allSurahs[nextIndex]) && attempts < allSurahs.length) {
      nextIndex = (nextIndex + 1) % allSurahs.length;
      attempts++;
    }
    if (getSurahAudioUrl(allSurahs[nextIndex])) setCurrentSurah(allSurahs[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentSurah) return;
    const allSurahs = surahsRef.current;
    const idx = allSurahs.findIndex(s => s.id === currentSurah.id);
    let prevIndex = idx === 0 ? allSurahs.length - 1 : idx - 1;
    let attempts = 0;
    while (!getSurahAudioUrl(allSurahs[prevIndex]) && attempts < allSurahs.length) {
      prevIndex = prevIndex === 0 ? allSurahs.length - 1 : prevIndex - 1;
      attempts++;
    }
    if (getSurahAudioUrl(allSurahs[prevIndex])) setCurrentSurah(allSurahs[prevIndex]);
  };

  const currentAudioOption = currentSurah
    ? (currentSurah.audioOptions?.find(opt => opt.name === selectedAudio[currentSurah.id]) || currentSurah.audioOptions?.[0] || null)
    : null;

  return {
    currentSurah,
    isPlaying,
    audioError,
    progress,
    duration,
    isReplayEnabled,
    autoPlayNext,
    selectedAudio,
    totalListeningTime,
    currentAudioOption,
    setAutoPlayNext,
    setSelectedAudio,
    getSurahAudioUrl,
    handleFilteredSurahsChange,
    handleSurahSelect,
    handleAudioSelect,
    handlePlayRandom,
    handlePlayPause,
    handleReplayToggle,
    handleNext,
    handlePrevious,
  };
}
