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
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(() => {
    const saved = localStorage.getItem('selectedAudio');
    return saved ? JSON.parse(saved) : {};
  });
  const [totalListeningTime, setTotalListeningTime] = useState(() => {
    const saved = localStorage.getItem('totalListeningTime');
    return saved ? parseFloat(saved) : 0;
  });
  const [playbackSpeed, setPlaybackSpeed] = useState(() => {
    const saved = localStorage.getItem('playbackSpeed');
    return saved ? parseFloat(saved) : 1;
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('volume');
    return saved ? parseFloat(saved) : 1;
  });
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    const saved = localStorage.getItem('recentlyPlayed');
    return saved ? JSON.parse(saved) : [];
  });

  const audioRef = useRef(null);
  const surahsRef = useRef(surahs);
  const currentSurahRef = useRef(null);
  const autoPlayNextRef = useRef(false);
  const isReplayEnabledRef = useRef(false);
  const isShuffleEnabledRef = useRef(false);
  const isPlayingRef = useRef(false);
  const selectedAudioRef = useRef(selectedAudio);
  const filteredSurahsRef = useRef([]);
  const listeningTimeIntervalRef = useRef(null);
  const lastUpdateTimeRef = useRef(null);
  const playbackSpeedRef = useRef(playbackSpeed);
  const volumeRef = useRef(volume);
  const lastPosSaveRef = useRef(0);
  const sleepTimerRef = useRef(null);
  const sleepTimerIntervalRef = useRef(null);

  useEffect(() => { surahsRef.current = surahs; }, [surahs]);
  useEffect(() => {
    currentSurahRef.current = currentSurah;
    if (currentSurah) {
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(id => id !== currentSurah.id);
        const next = [currentSurah.id, ...filtered].slice(0, 10);
        localStorage.setItem('recentlyPlayed', JSON.stringify(next));
        return next;
      });
    }
  }, [currentSurah]);
  useEffect(() => { autoPlayNextRef.current = autoPlayNext; }, [autoPlayNext]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { isReplayEnabledRef.current = isReplayEnabled; }, [isReplayEnabled]);
  useEffect(() => { isShuffleEnabledRef.current = isShuffleEnabled; }, [isShuffleEnabled]);

  useEffect(() => {
    selectedAudioRef.current = selectedAudio;
    localStorage.setItem('selectedAudio', JSON.stringify(selectedAudio));
  }, [selectedAudio]);

  useEffect(() => {
    localStorage.setItem('totalListeningTime', totalListeningTime.toString());
  }, [totalListeningTime]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
    localStorage.setItem('playbackSpeed', playbackSpeed.toString());
  }, [playbackSpeed]);

  useEffect(() => {
    volumeRef.current = volume;
    if (audioRef.current) audioRef.current.volume = volume;
    localStorage.setItem('volume', volume.toString());
  }, [volume]);

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
      audioRef.current.playbackRate = playbackSpeedRef.current;
      audioRef.current.volume = volumeRef.current;

      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
        setAudioError(null);
        // Restore saved playback position
        const surah = currentSurahRef.current;
        if (surah) {
          const savedPos = parseFloat(localStorage.getItem(`pos_${surah.id}`) || '0');
          if (savedPos > 0 && savedPos < audioRef.current.duration - 5) {
            audioRef.current.currentTime = savedPos;
          }
        }
      });

      audioRef.current.addEventListener('timeupdate', () => {
        const time = audioRef.current.currentTime;
        setProgress(time);
        // Save position every 5 seconds
        const now = Date.now();
        if (now - lastPosSaveRef.current > 5000 && currentSurahRef.current && time > 0) {
          lastPosSaveRef.current = now;
          localStorage.setItem(`pos_${currentSurahRef.current.id}`, time.toString());
        }
      });

      audioRef.current.addEventListener('ended', () => {
        // Clear saved position for completed surah
        if (currentSurahRef.current) {
          localStorage.removeItem(`pos_${currentSurahRef.current.id}`);
        }

        if (isReplayEnabledRef.current) return;
        setIsPlaying(false);
        setProgress(0);
        if (!autoPlayNextRef.current || !currentSurahRef.current) return;

        const currentSurahId = currentSurahRef.current.id;
        const filtered = filteredSurahsRef.current;

        // Try next clip within the same surah first
        if (!isShuffleEnabledRef.current) {
          const currentSurahData = filtered.find(s => s.id === currentSurahId);
          if (currentSurahData?.audioOptions?.length > 1) {
            const clips = currentSurahData.audioOptions;
            const currentClipName = selectedAudioRef.current[currentSurahId];
            const currentClipIndex = clips.findIndex(c => c.name === currentClipName);
            if (currentClipIndex >= 0 && currentClipIndex < clips.length - 1) {
              setSelectedAudio(prev => ({ ...prev, [currentSurahId]: clips[currentClipIndex + 1].name }));
              return;
            }
          }
        }

        // Shuffle: pick a random surah from the pool
        if (isShuffleEnabledRef.current) {
          const pool = (filtered.length ? filtered : surahsRef.current).filter(s => s.audioUrl);
          if (pool.length > 1) {
            const others = pool.filter(s => s.id !== currentSurahId);
            const pick = others[Math.floor(Math.random() * others.length)];
            const full = surahsRef.current.find(s => s.id === pick.id) || pick;
            if (pick.audioOptions?.length > 0) {
              setSelectedAudio(prev => ({ ...prev, [pick.id]: pick.audioOptions[0].name }));
            }
            setCurrentSurah(full);
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
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);
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

  const handleShuffleToggle = () => {
    setIsShuffleEnabled(prev => !prev);
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

  /** @param {number} speed */
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  /** @param {number} vol - 0 to 1 */
  const handleVolumeChange = (vol) => {
    setVolume(vol);
  };

  /** @param {number|null} minutes - null to cancel */
  const handleSleepTimerSet = (minutes) => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (sleepTimerIntervalRef.current) clearInterval(sleepTimerIntervalRef.current);

    if (!minutes) {
      setSleepTimerMinutes(null);
      setSleepTimerRemaining(null);
      return;
    }

    const totalSeconds = minutes * 60;
    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(totalSeconds);

    sleepTimerIntervalRef.current = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (prev <= 1) {
          clearInterval(sleepTimerIntervalRef.current);
          sleepTimerIntervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    sleepTimerRef.current = setTimeout(() => {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      setSleepTimerMinutes(null);
      setSleepTimerRemaining(null);
      if (sleepTimerIntervalRef.current) {
        clearInterval(sleepTimerIntervalRef.current);
        sleepTimerIntervalRef.current = null;
      }
    }, totalSeconds * 1000);
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
    isShuffleEnabled,
    autoPlayNext,
    selectedAudio,
    totalListeningTime,
    currentAudioOption,
    playbackSpeed,
    volume,
    sleepTimerMinutes,
    sleepTimerRemaining,
    recentlyPlayed,
    setAutoPlayNext,
    setSelectedAudio,
    getSurahAudioUrl,
    handleFilteredSurahsChange,
    handleSurahSelect,
    handleAudioSelect,
    handlePlayRandom,
    handlePlayPause,
    handleReplayToggle,
    handleShuffleToggle,
    handleNext,
    handlePrevious,
    handleSpeedChange,
    handleVolumeChange,
    handleSleepTimerSet,
  };
}
