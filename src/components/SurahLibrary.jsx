import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Search, X, ChevronDown, Radio, Info, HelpCircle, Repeat, Filter } from 'lucide-react';
import { getReciterDescription } from '../data/reciterDescriptions';
import { getRangeDisplay } from '../utils/clipParser';
import { getGlobalListeningStats } from '../utils/supabase';

// Format listening time in seconds to a human-readable string
function formatListeningTime(seconds) {
  if (!seconds || seconds < 1) {
    return '0 seconds';
  }
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }
  if (secs > 0 && hours === 0) {
    // Only show seconds if less than an hour
    parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);
  }
  
  return parts.join(', ') || '0 seconds';
}

export default function SurahLibrary({ surahs, currentSurah, onSurahSelect, autoPlayNext, onAutoPlayNextChange, isPlaying, onPlayPause, showAbout, onCloseAbout, selectedAudio, onAudioSelect, getSurahAudioUrl, totalListeningTime, isReplayEnabled, onReplayToggle }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyWithAudio, setShowOnlyWithAudio] = useState(true);
  const [expandedSurah, setExpandedSurah] = useState(null);
  const [aboutSection, setAboutSection] = useState('mission');
  const [contentHeight, setContentHeight] = useState(0);
  const [showReciterInfo, setShowReciterInfo] = useState(null); // { reciterName, description }
  const [showHelp, setShowHelp] = useState(false);
  const [globalListeningTime, setGlobalListeningTime] = useState(null); // null = loading, number = seconds
  const [feedbackForm, setFeedbackForm] = useState({ subject: '', message: '' });
  const [selectedReciterFilter, setSelectedReciterFilter] = useState('all'); // 'all' or reciter name
  const [showReciterFilter, setShowReciterFilter] = useState(false);
  const missionRef = useRef(null);
  const duaRef = useRef(null);
  const uploadRef = useRef(null);
  const statsRef = useRef(null);
  const feedbackRef = useRef(null);
  const contentContainerRef = useRef(null);
  
  // Calculate the maximum height of all content sections
  useEffect(() => {
    if (showAbout && contentContainerRef.current) {
      // Temporarily show all sections to measure them
      const missionHeight = missionRef.current?.scrollHeight || 0;
      const duaHeight = duaRef.current?.scrollHeight || 0;
      const uploadHeight = uploadRef.current?.scrollHeight || 0;
      const statsHeight = statsRef.current?.scrollHeight || 0;
      const feedbackHeight = feedbackRef.current?.scrollHeight || 0;
      const maxHeight = Math.max(missionHeight, duaHeight, uploadHeight, statsHeight, feedbackHeight);
      if (maxHeight > 0) {
        setContentHeight(maxHeight);
      }
    }
  }, [showAbout, totalListeningTime, feedbackForm]);

  // Fetch global listening stats on component mount and periodically
  useEffect(() => {
    // Fetch global stats immediately
    getGlobalListeningStats().then(stats => {
      if (stats) {
        setGlobalListeningTime(stats.totalSeconds);
      } else {
        setGlobalListeningTime(null);
      }
    });
    
    // Refresh global stats every 10 seconds
    const interval = setInterval(() => {
      getGlobalListeningStats().then(stats => {
        if (stats) {
          setGlobalListeningTime(stats.totalSeconds);
        }
      });
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Extract all unique reciter names from all surahs
  const allReciters = useMemo(() => {
    const reciterSet = new Set();
    surahs.forEach(surah => {
      if (surah.audioOptions) {
        surah.audioOptions.forEach(option => {
          const reciterName = option.reciter || option.name;
          if (reciterName) {
            reciterSet.add(reciterName);
          }
        });
      }
    });
    return Array.from(reciterSet).sort();
  }, [surahs]);

  // Filter surahs and their audio options based on selected reciter
  const filteredSurahs = useMemo(() => {
    return surahs.map(surah => {
      // Filter audio options if a reciter is selected
      let filteredAudioOptions = surah.audioOptions || [];
      if (selectedReciterFilter !== 'all') {
        filteredAudioOptions = (surah.audioOptions || []).filter(option => {
          const reciterName = option.reciter || option.name;
          return reciterName === selectedReciterFilter;
        });
      }

      // Get audio URL from filtered options or use original getSurahAudioUrl if all reciters
      let audioUrl = null;
      if (filteredAudioOptions.length > 0) {
        const selectedOptionName = selectedAudio[surah.id];
        const selectedOption = selectedOptionName 
          ? filteredAudioOptions.find(opt => opt.name === selectedOptionName) 
          : null;
        const option = selectedOption || filteredAudioOptions[0];
        audioUrl = option?.url || null;
      } else if (selectedReciterFilter === 'all') {
        audioUrl = getSurahAudioUrl(surah);
      }

      return {
        ...surah,
        audioOptions: filteredAudioOptions,
        audioUrl: audioUrl
      };
    }).filter((surah) => {
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
  }, [surahs, selectedReciterFilter, showOnlyWithAudio, searchQuery, selectedAudio, getSurahAudioUrl]);

  return (
    <main className="pt-20 pb-[400px] md:pb-[400px] px-4 min-h-screen bg-slate-950">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-1">
          <h1 className="text-2xl font-black text-white italic tracking-tighter mb-0.5 flex items-center justify-center gap-2">
            Sadaqah Jariyah Radio <Radio size={24} className="text-white" />
          </h1>
          <p className="text-slate-500 text-xs flex items-center justify-center gap-1">
            Select a Surah to begin listening
            <button
              onClick={() => setShowHelp(true)}
              className="text-slate-400 hover:text-slate-300 transition-colors"
              aria-label="Show help"
            >
              <HelpCircle size={14} />
            </button>
          </p>
        </div>
        
        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowHelp(false)}>
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">How to Use</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="text-slate-300 text-sm leading-relaxed space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">Selecting a Reciter:</h3>
                  <p>Click on a surah to see available reciters. Then click on "Reciter: [name]" to expand the list and choose from different reciters or audio clips with specific verse ranges.</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">About Clips:</h3>
                  <p>This app features audio clips - specific verse ranges or segments of surahs. Each clip shows the verse range (e.g., 1-7) so you know which verses are included.</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Replay Button:</h3>
                  <p>The replay button (🔄) appears next to the play/pause button when a recitation is selected. Click it to enable repeat mode, which will continuously loop the current recitation. Click again to disable repeat mode. When replay is enabled, the button will be highlighted.</p>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Tips:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Use the search bar to find surahs quickly</li>
                    <li>Enable "With audio only" to filter surahs that have available recordings</li>
                    <li>Enable "Auto play next" to automatically continue to the next surah</li>
                    <li>Use the replay button to listen to a recitation on repeat</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Reciter Info Modal */}
        {showReciterInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowReciterInfo(null)}>
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{showReciterInfo.reciterName}</h2>
                <button
                  onClick={() => setShowReciterInfo(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="text-slate-300 text-sm leading-relaxed">
                <p>{showReciterInfo.description}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* About Us Modal */}
        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onCloseAbout}>
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full max-h-[90vh] p-6 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center relative mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-white">About Us</h2>
                <button
                  onClick={onCloseAbout}
                  className="absolute right-0 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Clickable Sections */}
              <div className="flex gap-2 mb-4 border-b border-slate-700 flex-shrink-0">
                <button
                  onClick={() => setAboutSection('mission')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
                    aboutSection === 'mission'
                      ? 'text-white border-b-2 border-indigo-500'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Mission
                </button>
                <button
                  onClick={() => setAboutSection('dua')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
                    aboutSection === 'dua'
                      ? 'text-white border-b-2 border-indigo-500'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Dua
                </button>
                <button
                  onClick={() => setAboutSection('upload')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
                    aboutSection === 'upload'
                      ? 'text-white border-b-2 border-indigo-500'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setAboutSection('stats')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
                    aboutSection === 'stats'
                      ? 'text-white border-b-2 border-indigo-500'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Stats
                </button>
                <button
                  onClick={() => setAboutSection('feedback')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
                    aboutSection === 'feedback'
                      ? 'text-white border-b-2 border-indigo-500'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Feedback
                </button>
              </div>
              
              {/* Section Content */}
              <div 
                ref={contentContainerRef}
                className="text-slate-300 text-sm leading-relaxed space-y-3 overflow-y-auto relative"
                style={{ minHeight: contentHeight > 0 ? `${contentHeight}px` : 'auto' }}
              >
                {/* Hidden sections for measurement */}
                <div ref={missionRef} className="absolute opacity-0 pointer-events-none invisible">
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
                
                <div ref={duaRef} className="absolute opacity-0 pointer-events-none invisible">
                  <p>
                    May Allah accept the good deeds of all those who have passed away, and forgive the their shortcomings. May Allah bless all those who listen to the recitation on this website and bless the reciters with hasant. Ameen
                  </p>
                </div>
                
                <div ref={uploadRef} className="absolute opacity-0 pointer-events-none invisible">
                  <p>
                    If you have a recording of a person who has passed away and would like to include it on this website please contact <span className="font-bold text-white">amanahdigital1447@gmail.com</span>
                  </p>
                </div>
                
                <div ref={statsRef} className="absolute opacity-0 pointer-events-none invisible">
                  <div>
                    <h3 className="text-white font-semibold mb-3">Listening Statistics</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="mb-1">
                          <span className="font-semibold text-white">Your Listening Time:</span>
                        </p>
                        <p className="text-slate-300">
                          {formatListeningTime(totalListeningTime)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Your personal listening time (saved locally)
                        </p>
                      </div>
                      <div className="border-t border-slate-700 pt-3">
                        <p className="mb-1">
                          <span className="font-semibold text-white">Global Listening Time:</span>
                        </p>
                        <p className="text-slate-300">
                          {formatListeningTime(0)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Combined listening time from all users worldwide
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div ref={feedbackRef} className="absolute opacity-0 pointer-events-none invisible">
                  <div>
                    <h3 className="text-white font-semibold mb-3">Feedback</h3>
                    <p className="mb-4 text-slate-300">
                      If you encounter any issues with the website or have feedback, please fill out the form below. This will open your email client to send a message to us.
                    </p>
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="feedback-subject" className="block text-sm font-medium text-white mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          id="feedback-subject"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Brief description of the issue"
                        />
                      </div>
                      <div>
                        <label htmlFor="feedback-message" className="block text-sm font-medium text-white mb-2">
                          Message
                        </label>
                        <textarea
                          id="feedback-message"
                          rows={5}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          placeholder="Please describe the issue or provide your feedback..."
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all"
                      >
                        Send Feedback
                      </button>
                    </form>
                  </div>
                </div>
                
                {/* Visible content based on selected section */}
                {aboutSection === 'mission' && (
                  <>
                    <p>
                      The purpose of this website is to listen to Quran recitation of those who have returned to our Creator, and insha'allah this will be sadaqah jariya for them. May Allah accept their ibadah.
                    </p>
                    <p className="text-center font-semibold text-white mt-4">
                      May Allah accept this as reward for my parents.
                    </p>
                    <p className="text-center font-semibold text-white">
                      In memory of Shiekh Magdi Osman.
                    </p>
                  </>
                )}
                
                {aboutSection === 'dua' && (
                  <p>
                    May Allah accept the good deeds of all those who have passed away, and forgive the their shortcomings. May Allah bless all those who listen to the recitation on this website and bless the reciters with hasant. Ameen
                  </p>
                )}
                
                {aboutSection === 'upload' && (
                  <p>
                    If you have a recording of a person who has passed away and would like to include it on this website please contact <span className="font-bold text-white">amanahdigital1447@gmail.com</span>
                  </p>
                )}
                
                {aboutSection === 'stats' && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Listening Statistics</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="mb-1">
                          <span className="font-semibold text-white">Your Listening Time:</span>
                        </p>
                        <p className="text-slate-300">
                          {formatListeningTime(totalListeningTime)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Your personal listening time (saved locally)
                        </p>
                      </div>
                      <div className="border-t border-slate-700 pt-3">
                        <p className="mb-1">
                          <span className="font-semibold text-white">Global Listening Time:</span>
                        </p>
                        {globalListeningTime !== null ? (
                          <>
                            <p className="text-slate-300">
                              {formatListeningTime(globalListeningTime)}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Combined listening time from all users worldwide
                            </p>
                          </>
                        ) : (
                          <p className="text-slate-400 text-sm">
                            Loading...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {aboutSection === 'feedback' && (
                  <div>
                    <h3 className="text-white font-semibold mb-3">Feedback</h3>
                    <p className="mb-4 text-slate-300">
                      If you encounter any issues with the website or have feedback, please fill out the form below. This will open your email client to send a message to us.
                    </p>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const subject = encodeURIComponent(feedbackForm.subject || 'Website Feedback');
                        const body = encodeURIComponent(
                          `Subject: ${feedbackForm.subject || 'Website Feedback'}\n\n` +
                          `Message:\n${feedbackForm.message}`
                        );
                        const email = 'amanahdigital1447@gmail.com';
                        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="feedback-subject" className="block text-sm font-medium text-white mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          id="feedback-subject"
                          value={feedbackForm.subject}
                          onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Brief description of the issue"
                        />
                      </div>
                      <div>
                        <label htmlFor="feedback-message" className="block text-sm font-medium text-white mb-2">
                          Message
                        </label>
                        <textarea
                          id="feedback-message"
                          rows={5}
                          value={feedbackForm.message}
                          onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          placeholder="Please describe the issue or provide your feedback..."
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all"
                      >
                        Send Feedback
                      </button>
                    </form>
                  </div>
                )}
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
          
          {/* Reciter Filter */}
          <div className="mb-4 relative">
            <button
              onClick={() => setShowReciterFilter(!showReciterFilter)}
              className={`
                w-full px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2
                ${selectedReciterFilter !== 'all'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <Filter size={14} />
                {selectedReciterFilter === 'all' ? 'All Reciters' : selectedReciterFilter}
              </span>
              <ChevronDown size={14} className={showReciterFilter ? 'rotate-180' : ''} />
            </button>
            
            {showReciterFilter && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowReciterFilter(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setSelectedReciterFilter('all');
                        setShowReciterFilter(false);
                      }}
                      className={`
                        w-full px-3 py-2 rounded-lg text-sm text-left transition-all
                        ${selectedReciterFilter === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }
                      `}
                    >
                      All Reciters
                    </button>
                    {allReciters.map((reciter) => (
                      <button
                        key={reciter}
                        onClick={() => {
                          setSelectedReciterFilter(reciter);
                          setShowReciterFilter(false);
                        }}
                        className={`
                          w-full px-3 py-2 rounded-lg text-sm text-left transition-all
                          ${selectedReciterFilter === reciter
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }
                        `}
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
            const audioUrl = surah.audioUrl;
            const hasAudio = audioUrl !== null;
            // Get selected audio option name, defaulting to first available option
            const selectedAudioKey = selectedAudio[surah.id];
            const selectedOption = surah.audioOptions?.find(opt => opt.name === selectedAudioKey) || surah.audioOptions?.[0];
            const selectedAudioName = selectedOption?.name || (surah.audioOptions?.length > 0 ? surah.audioOptions[0].name : 'Default');
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
                    {surah.name}{surah.nameArabic ? ` | ${surah.nameArabic}` : ''}
                  </div>
                  {hasAudio && selectedOption && (
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
                      Reciter: {selectedOption.isClip ? (selectedOption.reciter || selectedAudioName) : selectedAudioName}
                      {selectedOption.range && ` (${getRangeDisplay(selectedOption.range, surah.totalAyahs)})`}
                      {surah.audioOptions && surah.audioOptions.length > 0 && (
                        <ChevronDown size={10} className={isExpanded ? 'rotate-180' : ''} />
                      )}
                    </button>
                  )}
                </button>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReplayToggle();
                      }}
                      className={`
                        p-2 rounded-xl transition-all
                        ${isReplayEnabled
                          ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                        }
                      `}
                      aria-label={isReplayEnabled ? 'Disable replay' : 'Enable replay'}
                    >
                      <Repeat size={16} />
                    </button>
                  )}
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
                      p-2 rounded-xl transition-all
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
                </div>
                {isExpanded && surah.audioOptions && surah.audioOptions.length > 0 && (
                  <div className="px-4 pb-4 border-t border-slate-700/50 mt-2">
                    <div className="pt-3 space-y-1">
                      <div className="text-[10px] text-slate-400 mb-2 uppercase tracking-wider">Select Reciter:</div>
                      {surah.audioOptions.map((option) => {
                        const reciterName = option.reciter || option.name;
                        const description = getReciterDescription(reciterName);
                        return (
                          <div
                            key={option.name}
                            className={`
                              w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all
                              ${selectedAudioName === option.name
                                ? 'bg-indigo-500 text-white'
                                : isActive
                                  ? 'bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }
                            `}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAudioSelect(surah.id, option.name);
                                setExpandedSurah(null);
                                onSurahSelect(surah);
                              }}
                              className="flex-1 text-left"
                            >
                              {reciterName}
                              {option.range && ` (${getRangeDisplay(option.range, surah.totalAyahs)})`}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowReciterInfo({ reciterName, description });
                              }}
                              className="p-1 rounded hover:bg-white/20 transition-all flex-shrink-0"
                              aria-label="Reciter information"
                            >
                              <Info size={16} />
                            </button>
                          </div>
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
        
        {/* Listening Statistics Section */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-4">
          <h3 className="text-white font-semibold mb-4 text-center">Listening Statistics</h3>
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-sm text-slate-400">
                <span className="font-semibold text-white">Your Listening Time:</span>
              </p>
              <p className="text-slate-300 text-lg">
                {formatListeningTime(totalListeningTime)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Your personal listening time (saved locally)
              </p>
            </div>
            <div className="border-t border-slate-700 pt-4">
              <p className="mb-1 text-sm text-slate-400">
                <span className="font-semibold text-white">Global Listening Time:</span>
              </p>
              {globalListeningTime !== null ? (
                <>
                  <p className="text-slate-300 text-lg">
                    {formatListeningTime(globalListeningTime)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Combined listening time from all users worldwide
                  </p>
                </>
              ) : (
                <p className="text-slate-400 text-sm">
                  Loading...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
