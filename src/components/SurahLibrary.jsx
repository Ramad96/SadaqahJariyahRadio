import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, Search, X, ChevronDown, Radio, Info, HelpCircle, Repeat, Filter, Shuffle } from 'lucide-react';
import { getReciterDescription } from '../data/reciterDescriptions';
import { getRangeDisplay } from '../utils/clipParser';
import { getGlobalListeningStats } from '../utils/supabase';
import VersesDisplay from './VersesDisplay';

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

export default function SurahLibrary({ surahs, currentSurah, onSurahSelect, onFilteredSurahsChange, autoPlayNext, onAutoPlayNextChange, isPlaying, onPlayPause, menuSection, onCloseMenu, selectedAudio, onAudioSelect, getSurahAudioUrl, totalListeningTime, isReplayEnabled, onReplayToggle, currentAudioOption, onPlayRandom, scriptType, onScriptTypeChange, showTranslation, onShowTranslationChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyWithAudio, setShowOnlyWithAudio] = useState(true);
  const [expandedSurah, setExpandedSurah] = useState(null);
  const [aboutTab, setAboutTab] = useState('mission');
  const [communitySection, setCommunitySection] = useState('upload');
  const [contentHeight, setContentHeight] = useState(0);
  const [showReciterInfo, setShowReciterInfo] = useState(null); // { reciterName, description }
  const [showHelp, setShowHelp] = useState(false);
  const [globalListeningTime, setGlobalListeningTime] = useState(undefined); // undefined = loading, null = unavailable, number = seconds
  const [feedbackForm, setFeedbackForm] = useState({ subject: '', message: '' });
  const [selectedReciterFilter, setSelectedReciterFilter] = useState('all'); // 'all' or reciter name
  const [showReciterFilter, setShowReciterFilter] = useState(false);
  const uploadRef = useRef(null);
  const statsRef = useRef(null);
  const feedbackRef = useRef(null);
  const contentContainerRef = useRef(null);

  // Calculate the maximum height of community section tabs
  useEffect(() => {
    if (menuSection === 'community' && contentContainerRef.current) {
      const uploadHeight = uploadRef.current?.scrollHeight || 0;
      const statsHeight = statsRef.current?.scrollHeight || 0;
      const feedbackHeight = feedbackRef.current?.scrollHeight || 0;
      const maxHeight = Math.max(uploadHeight, statsHeight, feedbackHeight);
      if (maxHeight > 0) {
        setContentHeight(maxHeight);
      }
    }
  }, [menuSection, totalListeningTime, feedbackForm]);

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

  // Notify parent whenever the filtered list changes so auto-play can use it
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
        
        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowHelp(false)}>
            <div className="bg-brand-surface rounded-3xl shadow-2xl max-w-md w-full p-6" style={{ border: '1px solid var(--border-subtle)' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-brand-text">How to Use</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1 rounded-lg hover:bg-brand-elevated transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="text-sm leading-relaxed space-y-4" style={{ color: 'var(--text-muted)' }}>
                <div>
                  <h3 className="text-brand-text font-semibold mb-2">About Clips:</h3>
                  <p>This app features audio clips - specific verse ranges or segments of surahs. Each clip shows the verse range (e.g., 1-7) so you know which verses are included.</p>
                </div>
                <div>
                  <h3 className="text-brand-text font-semibold mb-2">Selecting a Reciter:</h3>
                  <p>Click on a surah to see available reciters. Then click on "Reciter: [name]" to expand the list and choose from different reciters or audio clips with specific verse ranges.</p>
                </div>
                <div>
                  <h3 className="text-brand-text font-semibold mb-2">Reciter Filter:</h3>
                  <p>Use the filter button (with the filter icon) above the search bar to filter all surahs by a specific reciter. This will show only surahs that have recordings from the selected reciter. Select "All Reciters" to see all available surahs again.</p>
                </div>
                <div>
                  <h3 className="text-brand-text font-semibold mb-2">Verses Display:</h3>
                  <p>When you select a recitation with a verse range, the verses section will appear below the surah list showing the Arabic text of those verses. You can collapse or expand this section using the chevron button. The verses are displayed with their verse numbers for easy reference.</p>
                </div>
                <div>
                  <h3 className="text-brand-text font-semibold mb-2">Tips:</h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Use the search bar to find surahs quickly</li>
                    <li>Enable "With audio only" to filter surahs that have available recordings</li>
                    <li>Use the reciter filter to browse surahs by a specific reciter</li>
                    <li>Enable "Auto play next" to automatically continue to the next surah</li>
                    <li>View the verses section to read along with the recitation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Reciter Info Modal */}
        {showReciterInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowReciterInfo(null)}>
            <div className="bg-brand-surface rounded-3xl shadow-2xl max-w-md w-full p-6" style={{ border: '1px solid var(--border-subtle)' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-brand-text">{showReciterInfo.reciterName}</h2>
                <button
                  onClick={() => setShowReciterInfo(null)}
                  className="p-1 rounded-lg hover:bg-brand-elevated transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                <p>{showReciterInfo.description}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* About Us Modal */}
        {menuSection === 'about' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onCloseMenu}>
            <div className="bg-brand-surface rounded-3xl shadow-2xl max-w-md w-full p-6 flex flex-col" style={{ border: '1px solid var(--border-subtle)' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center relative mb-4 flex-shrink-0">
                <h2 className="text-xl font-semibold text-brand-text">About Us</h2>
                <button
                  onClick={onCloseMenu}
                  className="absolute right-0 p-1 rounded-lg hover:bg-brand-elevated transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              {/* Tabs */}
              <div className="flex gap-2 mb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setAboutTab('mission')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
                    aboutTab === 'mission'
                      ? 'text-brand-text border-b-2 border-brand-gold'
                      : 'hover:text-brand-text'
                  }`}
                  style={{ color: aboutTab === 'mission' ? undefined : 'var(--text-muted)' }}
                >
                  Mission
                </button>
                <button
                  onClick={() => setAboutTab('dua')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
                    aboutTab === 'dua'
                      ? 'text-brand-text border-b-2 border-brand-gold'
                      : 'hover:text-brand-text'
                  }`}
                  style={{ color: aboutTab === 'dua' ? undefined : 'var(--text-muted)' }}
                >
                  Dua
                </button>
                <button
                  onClick={() => setAboutTab('amanahdigital')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
                    aboutTab === 'amanahdigital'
                      ? 'text-brand-text border-b-2 border-brand-gold'
                      : 'hover:text-brand-text'
                  }`}
                  style={{ color: aboutTab === 'amanahdigital' ? undefined : 'var(--text-muted)' }}
                >
                  AmanahDigital1447
                </button>
              </div>

              <div className="text-sm leading-relaxed space-y-3 overflow-y-auto text-center" style={{ color: 'var(--text-muted)' }}>
                {aboutTab === 'mission' && (
                  <>
                    <p>
                      The purpose of this website is to listen to Quran recitation of those who have returned to our Creator, and insha'allah this will be sadaqah jariya for them. May Allah accept their ibadah.
                    </p>
                    <p className="text-center font-semibold text-brand-text mt-4">
                      May Allah accept this as reward for my parents.
                    </p>
                    <p className="text-center font-semibold text-brand-text">
                      In memory of Shiekh Magdi Osman.
                    </p>
                  </>
                )}
                {aboutTab === 'dua' && (
                  <p>
                    May Allah accept the good deeds of all those who have passed away, and forgive them for their shortcomings. May Allah bless all those who listen to the recitation on this website and bless the reciters with hasant. Ameen
                  </p>
                )}
                {aboutTab === 'amanahdigital' && (
                  <div className="space-y-3">
                    <p>
                      AmanahDigital creates innovative services and tools designed to strengthen the Ummah's iman and spiritual growth.
                    </p>
                    <p>
                      We make it easier to engage in deen-related activities through simple, accessible, and impactful digital solutions.
                    </p>
                    <a
                      href="https://amanahdigital.co.uk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 text-brand-gold hover:text-brand-gold-mid underline transition-colors"
                    >
                      amanahdigital.co.uk
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bookmark Modal */}
        {menuSection === 'bookmark' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onCloseMenu}>
            <div className="bg-brand-surface rounded-3xl shadow-2xl max-w-md w-full p-6 flex flex-col" style={{ border: '1px solid var(--border-subtle)' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center relative mb-4 flex-shrink-0">
                <h2 className="text-xl font-semibold text-brand-text">Bookmark</h2>
                <button
                  onClick={onCloseMenu}
                  className="absolute right-0 p-1 rounded-lg hover:bg-brand-elevated transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="text-sm leading-relaxed text-center" style={{ color: 'var(--text-muted)' }}>
                <h3 className="text-brand-text font-semibold mb-3">Add to iPhone Home Screen</h3>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Open this website in <span className="font-semibold text-brand-text">Safari</span></li>
                  <li>Tap the <span className="font-semibold text-brand-text">Share</span> button at the bottom of the screen (the square with an arrow pointing up)</li>
                  <li>Scroll down and tap <span className="font-semibold text-brand-text">Add to Home Screen</span></li>
                  <li>Tap <span className="font-semibold text-brand-text">Add</span> in the top right corner</li>
                </ol>
                <p className="mt-3 text-xs" style={{ color: 'var(--text-faint)' }}>The app will appear on your home screen and open in full screen, just like a native app.</p>
              </div>
            </div>
          </div>
        )}

        {/* Community Modal */}
        {menuSection === 'community' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onCloseMenu}>
            <div className="bg-brand-surface rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] p-6 flex flex-col" style={{ border: '1px solid var(--border-subtle)' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center relative mb-4 flex-shrink-0">
                <h2 className="text-xl font-semibold text-brand-text">Community</h2>
                <button
                  onClick={onCloseMenu}
                  className="absolute right-0 p-1 rounded-lg hover:bg-brand-elevated transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setCommunitySection('upload')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
                    communitySection === 'upload'
                      ? 'text-brand-text border-b-2 border-brand-gold'
                      : 'hover:text-brand-text'
                  }`}
                  style={{ color: communitySection === 'upload' ? undefined : 'var(--text-muted)' }}
                >
                  Upload
                </button>
                <button
                  onClick={() => setCommunitySection('stats')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
                    communitySection === 'stats'
                      ? 'text-brand-text border-b-2 border-brand-gold'
                      : 'hover:text-brand-text'
                  }`}
                  style={{ color: communitySection === 'stats' ? undefined : 'var(--text-muted)' }}
                >
                  Stats
                </button>
                <button
                  onClick={() => setCommunitySection('feedback')}
                  className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
                    communitySection === 'feedback'
                      ? 'text-brand-text border-b-2 border-brand-gold'
                      : 'hover:text-brand-text'
                  }`}
                  style={{ color: communitySection === 'feedback' ? undefined : 'var(--text-muted)' }}
                >
                  Feedback
                </button>
              </div>

              {/* Content */}
              <div
                ref={contentContainerRef}
                className="text-sm leading-relaxed space-y-3 overflow-y-auto relative text-center"
                style={{ minHeight: contentHeight > 0 ? `${contentHeight}px` : 'auto', color: 'var(--text-muted)' }}
              >
                {/* Hidden sections for measurement */}
                <div ref={uploadRef} className="absolute opacity-0 pointer-events-none invisible">
                  <p>
                    If you have a recording of a person who has passed away and would like to include it on this website please contact <span className="font-bold text-brand-text">amanahdigital1447@gmail.com</span>
                  </p>
                </div>

                <div ref={statsRef} className="absolute opacity-0 pointer-events-none invisible">
                  <div>
                    <h3 className="text-brand-text font-semibold mb-3">Listening Statistics</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="mb-1"><span className="font-semibold text-brand-text">Your Listening Time:</span></p>
                        <p>{formatListeningTime(totalListeningTime)}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Your personal listening time (saved locally)</p>
                      </div>
                      <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <p className="mb-1"><span className="font-semibold text-brand-text">Global Listening Time:</span></p>
                        <p>{formatListeningTime(0)}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Combined listening time from all users worldwide</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div ref={feedbackRef} className="absolute opacity-0 pointer-events-none invisible">
                  <div>
                    <h3 className="text-brand-text font-semibold mb-3">Feedback</h3>
                    <p className="mb-4">If you encounter any issues with the website or have feedback, please fill out the form below.</p>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-text mb-2">Subject</label>
                        <input type="text" className="w-full px-3 py-2 bg-brand-elevated rounded-lg text-brand-text" style={{ border: '1px solid var(--border-subtle)' }} placeholder="Brief description of the issue" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-text mb-2">Message</label>
                        <textarea rows={5} className="w-full px-3 py-2 bg-brand-elevated rounded-lg text-brand-text resize-none" style={{ border: '1px solid var(--border-subtle)' }} placeholder="Please describe the issue..." />
                      </div>
                      <button type="submit" className="w-full px-4 py-2 bg-brand-gold text-brand-void font-medium rounded-lg">Send Feedback</button>
                    </form>
                  </div>
                </div>

                {/* Visible content */}
                {communitySection === 'upload' && (
                  <p>
                    If you have a recording of a person who has passed away and would like to include it on this website please contact <span className="font-bold text-brand-text">amanahdigital1447@gmail.com</span>
                  </p>
                )}

                {communitySection === 'stats' && (
                  <div>
                    <h3 className="text-brand-text font-semibold mb-3">Listening Statistics</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="mb-1"><span className="font-semibold text-brand-text">Your Listening Time:</span></p>
                        <p>{formatListeningTime(totalListeningTime)}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Your personal listening time (saved locally)</p>
                      </div>
                      <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <p className="mb-1"><span className="font-semibold text-brand-text">Global Listening Time:</span></p>
                        {globalListeningTime === undefined ? (
                          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Loading...</p>
                        ) : globalListeningTime === null ? (
                          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Not available</p>
                        ) : (
                          <>
                            <p>{formatListeningTime(globalListeningTime)}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Combined listening time from all users worldwide</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {communitySection === 'feedback' && (
                  <div>
                    <h3 className="text-brand-text font-semibold mb-3">Feedback</h3>
                    <p className="mb-4">
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
                        <label htmlFor="feedback-subject" className="block text-sm font-medium text-brand-text mb-2">Subject</label>
                        <input
                          type="text"
                          id="feedback-subject"
                          value={feedbackForm.subject}
                          onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })}
                          className="w-full px-3 py-2 bg-brand-elevated rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold"
                          style={{ border: '1px solid var(--border-subtle)' }}
                          placeholder="Brief description of the issue"
                        />
                      </div>
                      <div>
                        <label htmlFor="feedback-message" className="block text-sm font-medium text-brand-text mb-2">Message</label>
                        <textarea
                          id="feedback-message"
                          rows={5}
                          value={feedbackForm.message}
                          onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                          className="w-full px-3 py-2 bg-brand-elevated rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none"
                          style={{ border: '1px solid var(--border-subtle)' }}
                          placeholder="Please describe the issue or provide your feedback..."
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-brand-gold hover:bg-brand-gold-mid text-brand-void font-medium rounded-lg transition-all"
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

        {/* Settings Modal */}
        {menuSection === 'settings' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onCloseMenu}>
            <div className="bg-brand-surface rounded-3xl shadow-2xl max-w-md w-full p-6" style={{ border: '1px solid var(--border-subtle)' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center relative mb-6">
                <h2 className="text-xl font-semibold text-brand-text">Settings</h2>
                <button
                  onClick={onCloseMenu}
                  className="absolute right-0 p-1 rounded-lg hover:bg-brand-elevated transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-brand-mono font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)', letterSpacing: '2px' }}>Quran Script</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onScriptTypeChange('uthmani')}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        scriptType === 'uthmani'
                          ? 'bg-brand-gold text-brand-void'
                          : 'bg-brand-elevated text-brand-text hover:bg-[#1c1930]'
                      }`}
                      style={scriptType !== 'uthmani' ? { border: '1px solid var(--border-subtle)' } : {}}
                    >
                      <div className="font-semibold">Uthmani</div>
                      <div className="text-xs opacity-70 mt-0.5">Madani Mushaf</div>
                    </button>
                    <button
                      onClick={() => onScriptTypeChange('indopak')}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        scriptType === 'indopak'
                          ? 'bg-brand-gold text-brand-void'
                          : 'bg-brand-elevated text-brand-text hover:bg-[#1c1930]'
                      }`}
                      style={scriptType !== 'indopak' ? { border: '1px solid var(--border-subtle)' } : {}}
                    >
                      <div className="font-semibold">IndoPak</div>
                      <div className="text-xs opacity-70 mt-0.5">Nastaleeq Style</div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-brand-mono font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-faint)', letterSpacing: '2px' }}>Translation</h3>
                  <button
                    onClick={() => onShowTranslationChange(!showTranslation)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-brand-elevated hover:bg-[#1c1930] transition-all"
                    style={{ border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="text-left">
                      <div className="text-sm font-semibold text-brand-text">English Translation</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Saheeh International</div>
                    </div>
                    <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${showTranslation ? 'bg-brand-gold' : 'bg-brand-elevated'}`} style={!showTranslation ? { border: '1px solid var(--border-mid)' } : {}}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-brand-void shadow transition-transform ${showTranslation ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-brand-surface rounded-3xl shadow-2xl p-4" style={{ border: '1px solid var(--border-subtle)' }}>
          <div className="mb-4">
            <button
              onClick={onPlayRandom}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all text-brand-void shadow-lg flex items-center justify-center gap-2 mb-4 active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #F5C97A 0%, #C8884A 100%)' }}
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
                background: showOnlyWithAudio ? 'rgba(245,201,122,0.10)' : 'rgba(255,255,255,0.04)',
                color: showOnlyWithAudio ? '#F5C97A' : 'var(--text-muted)',
                border: showOnlyWithAudio ? '1px solid rgba(245,201,122,0.25)' : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              With audio only
            </button>
            <button
              onClick={() => onAutoPlayNextChange(!autoPlayNext)}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-brand-mono font-medium transition-all"
              style={{
                background: autoPlayNext ? 'rgba(245,201,122,0.10)' : 'rgba(255,255,255,0.04)',
                color: autoPlayNext ? '#F5C97A' : 'var(--text-muted)',
                border: autoPlayNext ? '1px solid rgba(245,201,122,0.25)' : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              Auto play next
            </button>
          </div>

          {/* Reciter Filter */}
          <div className="mb-4 relative">
            <button
              onClick={() => setShowReciterFilter(!showReciterFilter)}
              className="w-full px-3 py-2 rounded-xl text-xs font-brand-mono font-medium transition-all flex items-center justify-between gap-2"
              style={{
                background: selectedReciterFilter !== 'all' ? 'rgba(245,201,122,0.10)' : 'rgba(255,255,255,0.04)',
                color: selectedReciterFilter !== 'all' ? '#F5C97A' : 'var(--text-muted)',
                border: selectedReciterFilter !== 'all' ? '1px solid rgba(245,201,122,0.25)' : '1px solid rgba(255,255,255,0.07)',
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
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowReciterFilter(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-brand-surface rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto" style={{ border: '1px solid var(--border-mid)' }}>
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setSelectedReciterFilter('all');
                        setShowReciterFilter(false);
                      }}
                      className={`
                        w-full px-3 py-2 rounded-lg text-sm text-left transition-all
                        ${selectedReciterFilter === 'all'
                          ? 'bg-brand-gold text-brand-void'
                          : 'bg-brand-elevated text-brand-text hover:bg-[#1c1930]'
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
                            ? 'bg-brand-gold text-brand-void'
                            : 'bg-brand-elevated text-brand-text hover:bg-[#1c1930]'
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
                className={`w-full rounded-2xl transition-all`}
                style={{
                  background: !hasAudio ? '#14112a' : isActive ? 'rgba(245,201,122,0.07)' : '#0e0c1a',
                  border: !hasAudio
                    ? '1px solid rgba(255,255,255,0.06)'
                    : isActive
                    ? '1px solid rgba(245,201,122,0.30)'
                    : '1px solid rgba(255,255,255,0.07)',
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
                    className={`font-medium text-[15px] leading-snug ${isActive ? 'text-brand-text' : 'text-brand-text'}`}
                    style={!hasAudio ? { color: 'var(--text-faint)' } : {}}
                  >
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
                      className="text-[11px] mt-1 flex items-center gap-1 hover:underline font-brand-mono"
                      style={{ color: 'var(--text-faint)' }}
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
                      className="p-2 rounded-xl transition-all"
                      style={{
                        background: isReplayEnabled ? 'rgba(245,201,122,0.15)' : 'rgba(255,255,255,0.06)',
                        color: isReplayEnabled ? '#F5C97A' : 'var(--text-faint)',
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
                        if (isActive) {
                          onPlayPause();
                        } else {
                          onSurahSelect(surah);
                        }
                      }
                    }}
                    disabled={!hasAudio}
                    className="p-2 rounded-xl transition-all"
                    style={{
                      background: !hasAudio ? 'transparent' : isActive ? 'rgba(245,201,122,0.15)' : 'rgba(255,255,255,0.06)',
                      cursor: !hasAudio ? 'not-allowed' : 'pointer',
                    }}
                    aria-label={hasAudio ? (isActive && isPlaying ? 'Pause' : 'Play') : 'No audio available'}
                  >
                    {isActive && isPlaying ? (
                      <Pause size={16} style={{ color: '#F5C97A' }} fill="currentColor" />
                    ) : (
                      <Play
                        size={16}
                        style={{ color: !hasAudio ? 'var(--text-faint)' : isActive ? '#F5C97A' : 'var(--text-muted)' }}
                        fill={isActive ? 'currentColor' : 'none'}
                      />
                    )}
                  </button>
                </div>
                </div>
                {isExpanded && surah.audioOptions && surah.audioOptions.length > 0 && (
                  <div className="px-4 pb-4 mt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="pt-3 space-y-1">
                      <div className="text-[10px] font-brand-mono mb-2 uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Select Reciter:</div>
                      {surah.audioOptions.map((option) => {
                        const reciterName = option.reciter || option.name;
                        const description = getReciterDescription(reciterName);
                        return (
                          <div
                            key={option.name}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                            style={{
                              background: selectedAudioName === option.name ? 'rgba(245,201,122,0.10)' : '#14112a',
                              color: selectedAudioName === option.name ? '#F5C97A' : 'var(--text-muted)',
                              border: selectedAudioName === option.name ? '1px solid rgba(245,201,122,0.20)' : '1px solid transparent',
                            }}
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
                              className="p-1 rounded hover:bg-white/10 transition-all flex-shrink-0"
                              style={{ color: 'var(--text-faint)' }}
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
        
        {/* Verses Display Section */}
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
