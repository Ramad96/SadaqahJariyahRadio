import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Search, X, ChevronDown, Radio, HelpCircle, Repeat, Filter, Shuffle } from 'lucide-react';
import { getRangeDisplay } from '../utils/clipParser';
import VersesDisplay from './VersesDisplay';
import HelpModal from './modals/HelpModal';
import AboutModal from './modals/AboutModal';
import BookmarkModal from './modals/BookmarkModal';
import CommunityModal from './modals/CommunityModal';
import SettingsModal from './modals/SettingsModal';

function normalizeArabic(text) {
  return text
    .replace(/[ً-ٟؐ-ؚۖ-ۜ۟-۪ۨ-ۯ]/g, '')
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه');
}

function SurahLibrary({
  surahs, currentSurah, onSurahSelect, onFilteredSurahsChange,
  autoPlayNext, onAutoPlayNextChange, isPlaying, onPlayPause,
  menuSection, onCloseMenu, selectedAudio, onAudioSelect, getSurahAudioUrl,
  isReplayEnabled, onReplayToggle, currentAudioOption, onPlayRandom,
  scriptType, onScriptTypeChange, showTranslation, onShowTranslationChange,
  theme, onThemeChange,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyWithAudio, setShowOnlyWithAudio] = useState(true);
  const [expandedSurah, setExpandedSurah] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedReciterFilter, setSelectedReciterFilter] = useState('all');
  const [showReciterFilter, setShowReciterFilter] = useState(false);
  const reciterFilterRef = useRef(null);

  const allReciters = useMemo(() => {
    const reciterSet = new Set();
    surahs.forEach(surah => {
      surah.audioOptions?.forEach(option => {
        const name = option.reciter || option.name;
        if (name) reciterSet.add(name);
      });
    });
    return Array.from(reciterSet).sort();
  }, [surahs]);

  const filteredSurahs = useMemo(() => {
    return surahs.map(surah => {
      let filteredAudioOptions = surah.audioOptions || [];
      if (selectedReciterFilter !== 'all') {
        filteredAudioOptions = filteredAudioOptions.filter(opt => (opt.reciter || opt.name) === selectedReciterFilter);
      }

      let audioUrl = null;
      if (filteredAudioOptions.length > 0) {
        const selectedOptionName = selectedAudio[surah.id];
        const selected = selectedOptionName ? filteredAudioOptions.find(opt => opt.name === selectedOptionName) : null;
        audioUrl = (selected || filteredAudioOptions[0])?.url || null;
      } else if (selectedReciterFilter === 'all') {
        audioUrl = getSurahAudioUrl(surah);
      }

      return { ...surah, audioOptions: filteredAudioOptions, audioUrl };
    }).filter(surah => {
      if (showOnlyWithAudio && !surah.audioUrl) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const normalizedQuery = normalizeArabic(query);
      return (
        surah.name.toLowerCase().includes(query) ||
        surah.number.toString().includes(query) ||
        (surah.nameArabic && normalizeArabic(surah.nameArabic).includes(normalizedQuery))
      );
    });
  }, [surahs, selectedReciterFilter, showOnlyWithAudio, searchQuery, selectedAudio, getSurahAudioUrl]);

  useEffect(() => {
    onFilteredSurahsChange(filteredSurahs);
  }, [filteredSurahs, onFilteredSurahsChange]);

  return (
    <main className="pt-20 pb-4 px-4 flex-1 bg-brand-void">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-1">
          <h1 className="font-display text-2xl font-semibold text-brand-gold italic tracking-tight mb-0.5 flex items-center justify-center gap-2">
            Sadaqah Jariyah Radio <Radio size={22} className="text-brand-gold" style={{ opacity: 0.7 }} />
          </h1>
          <p className="text-xs flex items-center justify-center gap-1 font-brand-mono" style={{ color: 'var(--text-faint)' }}>
            Select a Surah to begin listening
            <button
              onClick={() => setShowHelp(true)}
              className="hover:text-brand-gold transition-colors"
              style={{ color: 'var(--text-faint)' }}
              aria-label="Show help"
            >
              <HelpCircle size={14} />
            </button>
          </p>
        </div>

        {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
        {menuSection === 'about' && <AboutModal onClose={onCloseMenu} />}
        {menuSection === 'bookmark' && <BookmarkModal onClose={onCloseMenu} />}
        {menuSection === 'community' && <CommunityModal onClose={onCloseMenu} />}
        {menuSection === 'settings' && (
          <SettingsModal
            onClose={onCloseMenu}
            scriptType={scriptType}
            onScriptTypeChange={onScriptTypeChange}
            showTranslation={showTranslation}
            onShowTranslationChange={onShowTranslationChange}
            theme={theme}
            onThemeChange={onThemeChange}
          />
        )}

        <div className="bg-brand-surface rounded-3xl shadow-2xl p-4" style={{ border: '1px solid var(--border-subtle)' }}>
          <div className="mb-4">
            <button
              onClick={onPlayRandom}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all text-brand-void shadow-lg flex items-center justify-center gap-2 mb-4 active:scale-[0.97]"
              style={{ background: 'var(--gold-gradient)' }}
            >
              <Shuffle size={18} />
              Play Random
            </button>
          </div>

          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setShowOnlyWithAudio(!showOnlyWithAudio)}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-brand-mono font-medium transition-all"
              style={{
                background: showOnlyWithAudio ? 'var(--gold-glow)' : 'var(--inactive-bg)',
                color: showOnlyWithAudio ? 'var(--gold)' : 'var(--text-muted)',
                border: showOnlyWithAudio ? '1px solid var(--active-btn-border)' : '1px solid var(--border-subtle)',
              }}
            >
              With audio only
            </button>
            <button
              onClick={() => onAutoPlayNextChange(!autoPlayNext)}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-brand-mono font-medium transition-all"
              style={{
                background: autoPlayNext ? 'var(--gold-glow)' : 'var(--inactive-bg)',
                color: autoPlayNext ? 'var(--gold)' : 'var(--text-muted)',
                border: autoPlayNext ? '1px solid var(--active-btn-border)' : '1px solid var(--border-subtle)',
              }}
            >
              Auto play next
            </button>
          </div>

          {/* Reciter Filter */}
          <div className="mb-4 relative" ref={reciterFilterRef}>
            <button
              onClick={() => setShowReciterFilter(!showReciterFilter)}
              className="w-full px-3 py-2 rounded-xl text-xs font-brand-mono font-medium transition-all flex items-center justify-between gap-2"
              style={{
                background: selectedReciterFilter !== 'all' ? 'var(--gold-glow)' : 'var(--inactive-bg)',
                color: selectedReciterFilter !== 'all' ? 'var(--gold)' : 'var(--text-muted)',
                border: selectedReciterFilter !== 'all' ? '1px solid var(--active-btn-border)' : '1px solid var(--border-subtle)',
              }}
            >
              <span className="flex items-center gap-2">
                <Filter size={14} />
                {selectedReciterFilter === 'all' ? 'All Reciters' : selectedReciterFilter}
              </span>
              <ChevronDown size={14} className={showReciterFilter ? 'rotate-180' : ''} />
            </button>

            {showReciterFilter && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowReciterFilter(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-brand-surface rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto" style={{ border: '1px solid var(--border-mid)' }}>
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => { setSelectedReciterFilter('all'); setShowReciterFilter(false); }}
                      className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all ${selectedReciterFilter === 'all' ? 'bg-brand-gold text-brand-void' : 'bg-brand-elevated text-brand-text hover:bg-brand-elevated'}`}
                    >
                      All Reciters
                    </button>
                    {allReciters.map(reciter => (
                      <button
                        key={reciter}
                        onClick={() => { setSelectedReciterFilter(reciter); setShowReciterFilter(false); }}
                        className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all ${selectedReciterFilter === reciter ? 'bg-brand-gold text-brand-void' : 'bg-brand-elevated text-brand-text hover:bg-brand-elevated'}`}
                      >
                        {reciter}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Search surahs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-elevated rounded-xl text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              style={{ border: '1px solid var(--border-subtle)' }}
            />
          </div>

          <div className="h-[380px] overflow-y-auto">
            <div className="space-y-2">
              {filteredSurahs.map((surah) => {
                const isActive = currentSurah?.id === surah.id;
                const hasAudio = surah.audioUrl !== null;
                const selectedAudioKey = selectedAudio[surah.id];
                const selectedOption = surah.audioOptions?.find(opt => opt.name === selectedAudioKey) || surah.audioOptions?.[0];
                const selectedAudioName = selectedOption?.name || (surah.audioOptions?.length > 0 ? surah.audioOptions[0].name : 'Default');
                const isExpanded = expandedSurah === surah.id;

                return (
                  <div
                    key={surah.id}
                    className="w-full rounded-2xl transition-all"
                    style={{
                      background: !hasAudio ? 'var(--bg-elevated)' : isActive ? 'var(--card-active-bg)' : 'var(--bg-void)',
                      border: !hasAudio ? '1px solid var(--border-subtle)' : isActive ? '1px solid var(--card-active-border)' : '1px solid var(--border-subtle)',
                      opacity: !hasAudio ? 0.45 : 1,
                      cursor: !hasAudio ? 'not-allowed' : 'default',
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 p-4">
                      <button
                        onClick={() => hasAudio && onSurahSelect(surah)}
                        disabled={!hasAudio}
                        className="flex-1 min-w-0 text-left"
                        aria-label={hasAudio ? `Select ${surah.name}` : `${surah.name} (No audio available)`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {isActive && (
                            <span className="text-[9px] font-brand-mono font-medium uppercase tracking-widest text-brand-gold" style={{ opacity: 0.7 }}>
                              • PLAYING
                            </span>
                          )}
                        </div>
                        <div
                          className="font-medium text-[15px] leading-snug text-brand-text"
                          style={!hasAudio ? { color: 'var(--text-faint)' } : {}}
                        >
                          {surah.name}{surah.nameArabic ? ` | ${surah.nameArabic}` : ''}
                        </div>
                        {hasAudio && selectedOption && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (surah.audioOptions?.length > 0) setExpandedSurah(isExpanded ? null : surah.id);
                            }}
                            className="text-[11px] mt-1 flex items-center gap-1 hover:underline font-brand-mono"
                            style={{ color: 'var(--text-faint)' }}
                            aria-label="Select reciter"
                          >
                            Reciter: {selectedOption.isClip ? (selectedOption.reciter || selectedAudioName) : selectedAudioName}
                            {selectedOption.range && ` (${getRangeDisplay(selectedOption.range, surah.totalAyahs)})`}
                            {surah.audioOptions?.length > 0 && (
                              <ChevronDown size={10} className={isExpanded ? 'rotate-180' : ''} />
                            )}
                          </button>
                        )}
                      </button>

                      <div className="flex-shrink-0 flex items-center gap-2">
                        {isActive && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onReplayToggle(); }}
                            className="p-2 rounded-xl transition-all"
                            style={{
                              background: isReplayEnabled ? 'var(--replay-active-bg)' : 'var(--btn-icon-bg)',
                              color: isReplayEnabled ? 'var(--gold)' : 'var(--text-faint)',
                            }}
                            aria-label={isReplayEnabled ? 'Disable replay' : 'Enable replay'}
                          >
                            <Repeat size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hasAudio) {
                              if (isActive) onPlayPause();
                              else onSurahSelect(surah);
                            }
                          }}
                          disabled={!hasAudio}
                          className="p-2 rounded-xl transition-all"
                          style={{
                            background: !hasAudio ? 'transparent' : isActive ? 'var(--replay-active-bg)' : 'var(--btn-icon-bg)',
                            cursor: !hasAudio ? 'not-allowed' : 'pointer',
                          }}
                          aria-label={hasAudio ? (isActive && isPlaying ? 'Pause' : 'Play') : 'No audio available'}
                        >
                          {isActive && isPlaying ? (
                            <Pause size={16} style={{ color: 'var(--gold)' }} fill="currentColor" />
                          ) : (
                            <Play
                              size={16}
                              style={{ color: !hasAudio ? 'var(--text-faint)' : isActive ? 'var(--gold)' : 'var(--text-muted)' }}
                              fill={isActive ? 'currentColor' : 'none'}
                            />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && surah.audioOptions?.length > 0 && (
                      <div className="px-4 pb-4 mt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <div className="pt-3 space-y-1">
                          <div className="text-[10px] font-brand-mono mb-2 uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Select Reciter:</div>
                          {surah.audioOptions.map((option) => {
                            const reciterName = option.reciter || option.name;
                            return (
                              <button
                                key={option.name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAudioSelect(surah.id, option.name);
                                  setExpandedSurah(null);
                                  onSurahSelect(surah);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                                style={{
                                  background: selectedAudioName === option.name ? 'var(--reciter-selected-bg)' : 'var(--bg-elevated)',
                                  color: selectedAudioName === option.name ? 'var(--gold)' : 'var(--text-muted)',
                                  border: selectedAudioName === option.name ? '1px solid var(--reciter-selected-border)' : '1px solid transparent',
                                }}
                              >
                                {reciterName}
                                {option.range && ` (${getRangeDisplay(option.range, surah.totalAyahs)})`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <VersesDisplay
          currentSurah={currentSurah}
          currentAudioOption={currentAudioOption}
          scriptType={scriptType}
          showTranslation={showTranslation}
        />
      </div>
    </main>
  );
}

export default SurahLibrary;
