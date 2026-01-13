import { useState, useEffect } from 'react';
import { getVerse } from '../data/verses';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Parse a range string (e.g., "1-7" or "154-157") and return array of verse numbers
 */
function parseRange(range) {
  if (!range) return [];
  const parts = range.split('-');
  if (parts.length !== 2) return [];
  
  const start = parseInt(parts[0], 10);
  const end = parseInt(parts[1], 10);
  
  if (isNaN(start) || isNaN(end) || start < 1 || end < start) return [];
  
  const verses = [];
  for (let i = start; i <= end; i++) {
    verses.push(i);
  }
  return verses;
}

export default function VersesDisplay({ currentSurah, currentAudioOption }) {
  const [isVisible, setIsVisible] = useState(() => {
    // Load saved visibility state from localStorage, default to true
    const saved = localStorage.getItem('versesDisplayVisible');
    return saved !== null ? saved === 'true' : true;
  });

  // Save visibility state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('versesDisplayVisible', isVisible.toString());
  }, [isVisible]);

  if (!currentSurah || !currentAudioOption || !currentAudioOption.range) {
    return null;
  }

  const verseNumbers = parseRange(currentAudioOption.range);
  const verses = verseNumbers
    .map(verseNum => ({
      number: verseNum,
      text: getVerse(currentSurah.number, verseNum)
    }))
    .filter(verse => verse.text); // Only show verses that have text

  if (verses.length === 0) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t-2 border-slate-700 shadow-2xl">
        <button
          onClick={() => setIsVisible(true)}
          className="w-full px-4 py-2 flex items-center justify-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Show verses"
        >
          <ChevronUp size={18} />
          <span className="text-sm font-medium">Show Verses</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t-2 border-slate-700 shadow-2xl h-[300px] md:h-[400px]">
      {/* Header with Hide Button */}
      <div className="border-b border-slate-700 flex items-center justify-between px-4 py-2">
        <div className="flex-1">
          <h2 className="text-white font-bold text-lg">
            {currentSurah.name}
            {currentSurah.nameArabic && (
              <span className="text-slate-400 font-normal ml-2">
                {currentSurah.nameArabic}
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Verses {currentAudioOption.range}
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          aria-label="Hide verses"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 h-[calc(100%-80px)] overflow-y-auto">
        <div className="space-y-4">
          {verses.map((verse) => (
            <div key={verse.number} className="flex gap-3 items-start">
              <div className="flex-1">
                <p className="text-white text-xl leading-relaxed font-arabic">
                  {verse.text}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold">
                  {verse.number}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

