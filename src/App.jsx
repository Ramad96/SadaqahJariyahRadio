import { useState, useEffect, useMemo } from 'react';
import Balcony from './components/Balcony';
import SurahLibrary from './components/SurahLibrary';
import ErrorBoundary from './components/ErrorBoundary';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { surahs as baseSurahs } from './data/surahs';
import { getClipsForSurah } from './data/audioManifest';
import { version as VERSION } from '../package.json';

function App() {
  const [menuSection, setMenuSection] = useState(null);
  const [scriptType, setScriptType] = useState(() => localStorage.getItem('scriptType') || 'uthmani');
  const [showTranslation, setShowTranslation] = useState(() => localStorage.getItem('showTranslation') !== 'false');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

  const surahs = useMemo(() => baseSurahs.map(surah => {
    const clips = getClipsForSurah(surah.number, surah.folderName);
    return { ...surah, audioOptions: clips, audioUrl: clips.length > 0 ? clips[0].url : null };
  }), []);

  const {
    currentSurah,
    isPlaying,
    audioError,
    progress,
    duration,
    isReplayEnabled,
    isShuffleEnabled,
    autoPlayNext,
    selectedAudio,
    currentAudioOption,
    playbackSpeed,
    volume,
    sleepTimerMinutes,
    sleepTimerRemaining,
    setAutoPlayNext,
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
  } = useAudioPlayer(surahs);

  useEffect(() => {
    document.title = `Sadaqah Jariyah Radio Station v${VERSION}`;
  }, []);

  useEffect(() => {
    localStorage.setItem('scriptType', scriptType);
  }, [scriptType]);

  useEffect(() => {
    localStorage.setItem('showTranslation', showTranslation.toString());
  }, [showTranslation]);

  useEffect(() => {
    const applyTheme = (pref) => {
      const resolved = pref === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : pref;
      document.documentElement.setAttribute('data-theme', resolved);
    };
    applyTheme(theme);
    localStorage.setItem('theme', theme);
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-brand-void text-brand-text flex flex-col">
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
        onMenuSelect={setMenuSection}
        isReplayEnabled={isReplayEnabled}
        onReplayToggle={handleReplayToggle}
        isShuffleEnabled={isShuffleEnabled}
        onShuffleToggle={handleShuffleToggle}
      />

      {audioError && (
        <div className="mx-4 mt-3 px-4 py-2 rounded-xl text-sm text-center" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
          {audioError}
        </div>
      )}

      <ErrorBoundary>
        <SurahLibrary
          surahs={surahs}
          currentSurah={currentSurah}
          onSurahSelect={handleSurahSelect}
          onFilteredSurahsChange={handleFilteredSurahsChange}
          autoPlayNext={autoPlayNext}
          onAutoPlayNextChange={setAutoPlayNext}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          menuSection={menuSection}
          onCloseMenu={() => setMenuSection(null)}
          selectedAudio={selectedAudio}
          onAudioSelect={handleAudioSelect}
          getSurahAudioUrl={getSurahAudioUrl}
          isReplayEnabled={isReplayEnabled}
          onReplayToggle={handleReplayToggle}
          currentAudioOption={currentAudioOption}
          onPlayRandom={handlePlayRandom}
          scriptType={scriptType}
          onScriptTypeChange={setScriptType}
          showTranslation={showTranslation}
          onShowTranslationChange={setShowTranslation}
          theme={theme}
          onThemeChange={setTheme}
          playbackSpeed={playbackSpeed}
          onSpeedChange={handleSpeedChange}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          sleepTimerMinutes={sleepTimerMinutes}
          sleepTimerRemaining={sleepTimerRemaining}
          onSleepTimerSet={handleSleepTimerSet}
        />
      </ErrorBoundary>

      <footer className="w-full py-5 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="text-center">
          <span className="text-xs font-brand-mono block mb-1" style={{ color: 'var(--text-faint)', letterSpacing: '2px' }}>POWERED BY</span>
          <a
            href="https://amanahdigital.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-lg italic text-brand-gold hover:text-brand-gold-mid transition-colors inline-flex items-center gap-1.5"
            style={{ textDecoration: 'none' }}
          >
            AmanahDigital
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.6 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
