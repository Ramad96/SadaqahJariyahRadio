import { useState } from 'react';
import { Play, Pause, Search, X, ChevronDown, Radio } from 'lucide-react';

export default function SurahLibrary({ surahs, currentSurah, onSurahSelect, autoPlayNext, onAutoPlayNextChange, isPlaying, onPlayPause, showAbout, onCloseAbout, selectedAudio, onAudioSelect, getSurahAudioUrl }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyWithAudio, setShowOnlyWithAudio] = useState(true);
  const [expandedSurah, setExpandedSurah] = useState(null);

  const filteredSurahs = surahs.filter((surah) => {
    // Filter by audio availability if checkbox is checked
    const audioUrl = getSurahAudioUrl(surah);
    if (showOnlyWithAudio && !audioUrl) {
      return false;
    }
    
    // Filter by search query
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      surah.name.toLowerCase().includes(query) ||
      surah.number.toString().includes(query) ||
      (surah.nameArabic && surah.nameArabic.includes(query))
    );
  });

  return (
    <main className="pt-20 pb-8 px-4 min-h-screen bg-slate-950">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-1">
          <h1 className="text-2xl font-black text-white italic tracking-tighter mb-0.5 flex items-center justify-center gap-2">
            Sadaqah Jariyah Radio <Radio size={24} className="text-white" />
          </h1>
          <p className="text-slate-500 text-xs">Select a Surah to begin listening</p>
        </div>
        
        {/* About Us Modal */}
        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onCloseAbout}>
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">About Us</h2>
                <button
                  onClick={onCloseAbout}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  The purpose of this website is to listen to Quran recitation of those who have returned to our Creator, and insha'allah this will be sadaqah jariya for them. May Allah accept their ibadah.
                </p>
                <p className="text-center font-semibold text-white mt-4">
                  May Allah accept this as reward for my parents.
                </p>
                <p className="text-center font-semibold text-white">
                  In memory of Shiekh Magdi Osman.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-4">
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setShowOnlyWithAudio(!showOnlyWithAudio)}
              className={`
                flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all
                ${showOnlyWithAudio
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }
              `}
            >
              With audio only
            </button>
            <button
              onClick={() => onAutoPlayNextChange(!autoPlayNext)}
              className={`
                flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all
                ${autoPlayNext
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }
              `}
            >
              Auto play next
            </button>
          </div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search surahs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="h-[380px] overflow-y-auto">
            <div className="space-y-2">
              {filteredSurahs.map((surah) => {
            const isActive = currentSurah?.id === surah.id;
            const audioUrl = getSurahAudioUrl(surah);
            const hasAudio = audioUrl !== null;
            const selectedAudioName = selectedAudio[surah.id] || 'Default';
            const isExpanded = expandedSurah === surah.id;
            
            return (
              <div
                key={surah.id}
                className={`
                  w-full rounded-2xl border-2 transition-all
                  ${!hasAudio 
                    ? 'bg-slate-800 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed' 
                    : isActive 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                      : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                  }
                `}
              >
                <div className="flex items-center justify-between gap-3 p-4">
                <button
                  onClick={() => hasAudio && onSurahSelect(surah)}
                  disabled={!hasAudio}
                  className="flex-1 min-w-0 text-left"
                  aria-label={hasAudio ? `Select ${surah.name}` : `${surah.name} (No audio available)`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`
                      text-[10px] font-bold uppercase tracking-widest
                      ${isActive ? 'text-indigo-200' : 'text-slate-500'}
                    `}>
                      #{surah.number}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest">
                        • PLAYING
                      </span>
                    )}
                  </div>
                  <div className={`
                    font-bold text-sm
                    ${!hasAudio ? 'text-slate-500' : isActive ? 'text-white' : 'text-white'}
                  `}>
                    {surah.name}
                  </div>
                  {surah.nameArabic && (
                    <div className={`
                      text-xs mt-0.5
                      ${!hasAudio ? 'text-slate-600' : isActive ? 'text-indigo-100' : 'text-slate-400'}
                    `}>
                      {surah.nameArabic}
                    </div>
                  )}
                  {hasAudio && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (surah.audioOptions && surah.audioOptions.length > 0) {
                          setExpandedSurah(isExpanded ? null : surah.id);
                        }
                      }}
                      className={`
                        text-[10px] mt-1 flex items-center gap-1 hover:underline
                        ${!hasAudio ? 'text-slate-600' : isActive ? 'text-indigo-200' : 'text-slate-500'}
                      `}
                      aria-label="Select reciter"
                    >
                      Reciter: {selectedAudioName}
                      {surah.audioOptions && surah.audioOptions.length > 0 && (
                        <ChevronDown size={10} className={isExpanded ? 'rotate-180' : ''} />
                      )}
                    </button>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasAudio) {
                      if (isActive) {
                        onPlayPause();
                      } else {
                        onSurahSelect(surah);
                      }
                    }
                  }}
                  disabled={!hasAudio}
                  className={`
                    flex-shrink-0 p-2 rounded-xl transition-all
                    ${!hasAudio 
                      ? 'bg-slate-700 cursor-not-allowed' 
                      : isActive 
                        ? 'bg-white/20 hover:bg-white/30' 
                        : 'bg-slate-800 hover:bg-slate-700'
                    }
                  `}
                  aria-label={hasAudio ? (isActive && isPlaying ? 'Pause' : 'Play') : 'No audio available'}
                >
                  {isActive && isPlaying ? (
                    <Pause 
                      size={16} 
                      className="text-white"
                      fill="currentColor"
                    />
                  ) : (
                    <Play 
                      size={16} 
                      className={!hasAudio ? 'text-slate-600' : isActive ? 'text-white' : 'text-slate-400'}
                      fill={!hasAudio ? 'none' : isActive ? 'currentColor' : 'none'}
                    />
                  )}
                </button>
                </div>
                {isExpanded && surah.audioOptions && surah.audioOptions.length > 0 && (
                  <div className="px-4 pb-4 border-t border-slate-700/50 mt-2">
                    <div className="pt-3 space-y-1">
                      <div className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider">Select Reciter:</div>
                      {surah.audioOptions.map((option) => (
                        <button
                          key={option.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAudioSelect(surah.id, option.name);
                            setExpandedSurah(null);
                          }}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                            ${selectedAudioName === option.name
                              ? 'bg-indigo-500 text-white'
                              : isActive
                                ? 'bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }
                          `}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
