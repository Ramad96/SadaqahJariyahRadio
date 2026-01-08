import { useState } from 'react';
import { Play, Search, X, Info } from 'lucide-react';

export default function SurahLibrary({ surahs, currentSurah, onSurahSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyWithAudio, setShowOnlyWithAudio] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const filteredSurahs = surahs.filter((surah) => {
    // Filter by audio availability if checkbox is checked
    if (showOnlyWithAudio && !surah.audioUrl) {
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
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase flex-1 text-center">
              Sadaqah Jariyah Radio
            </h1>
            <button
              onClick={() => setShowAbout(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              aria-label="About Us"
            >
              <Info size={20} />
            </button>
          </div>
          <p className="text-slate-500 text-xs text-center">Select a Surah to begin listening</p>
        </div>
        
        {/* About Us Modal */}
        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAbout(false)}>
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">About Us</h2>
                <button
                  onClick={() => setShowAbout(false)}
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
                  In memory of Shiekh Magdi Osman.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-4">
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
          <div className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="showOnlyWithAudio"
              checked={showOnlyWithAudio}
              onChange={(e) => setShowOnlyWithAudio(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="showOnlyWithAudio" className="text-sm text-slate-300 cursor-pointer select-none">
              Show only surahs with audio
            </label>
          </div>
          <div className="h-[380px] overflow-y-auto">
            <div className="space-y-2">
              {filteredSurahs.map((surah) => {
            const isActive = currentSurah?.id === surah.id;
            const hasAudio = surah.audioUrl !== null;
            
            return (
              <button
                key={surah.id}
                onClick={() => hasAudio && onSurahSelect(surah)}
                disabled={!hasAudio}
                className={`
                  w-full p-4 rounded-2xl border-2 text-left transition-all
                  ${!hasAudio 
                    ? 'bg-slate-800 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed' 
                    : isActive 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                      : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
                  }
                `}
                aria-label={hasAudio ? `Play ${surah.name}` : `${surah.name} (No audio available)`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
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
                  </div>
                  <div className={`
                    flex-shrink-0 p-2 rounded-xl
                    ${!hasAudio 
                      ? 'bg-slate-700' 
                      : isActive 
                        ? 'bg-white/20' 
                        : 'bg-slate-800'
                    }
                  `}>
                    <Play 
                      size={16} 
                      className={!hasAudio ? 'text-slate-600' : isActive ? 'text-white' : 'text-slate-400'}
                      fill={!hasAudio ? 'none' : isActive ? 'currentColor' : 'none'}
                    />
                  </div>
                </div>
              </button>
            );
          })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
