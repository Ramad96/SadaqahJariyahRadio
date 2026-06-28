import { useState, useEffect } from 'react';
import { getVerse as getVerseUthmani } from '../data/verses_uthmani';
import { getVerse as getVerseIndopak } from '../data/verses_indopak';
import { getVerse as getVerseTranslation } from '../data/verses_translation_en';
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

export default function VersesDisplay({ currentSurah, currentAudioOption, scriptType = 'uthmani', showTranslation = true, arabicFontSize = 1.25 }) {
  const getVerse = scriptType === 'indopak' ? getVerseIndopak : getVerseUthmani;
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

  const verseNumbers = parseRange(currentAudioOption?.range);
  const verses = verseNumbers
    .map(verseNum => ({
      number: verseNum,
      text: getVerse(currentSurah?.number, verseNum)
    }))
    .filter(verse => verse.text); // Only show verses that have text

  if (verses.length === 0) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="bg-brand-surface rounded-3xl shadow-2xl p-4" style={{ border: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setIsVisible(true)}
          className="w-full px-4 py-2 flex items-center justify-center gap-2 hover:bg-brand-elevated transition-colors rounded-xl"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Show verses"
        >
          <ChevronUp size={18} />
          <span className="text-sm font-medium">Show Verses</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface rounded-3xl shadow-2xl p-4" style={{ border: '1px solid var(--border-subtle)' }}>
      {/* Header with Hide Button */}
      <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex-1">
          <h2 className="text-brand-text font-semibold text-lg">
            {currentSurah.name}
            {currentSurah.nameArabic && (
              <span className="font-arabic ml-2 text-brand-gold font-normal">
                {currentSurah.nameArabic}
              </span>
            )}
          </h2>
          <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            Verses {currentAudioOption.range}
            <span className="text-xs px-2 py-0.5 rounded-full font-brand-mono bg-brand-elevated" style={{ color: 'var(--text-faint)' }}>
              {scriptType === 'indopak' ? 'IndoPak' : 'Uthmani'}
            </span>
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-2 rounded-lg hover:bg-brand-elevated transition-all"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Hide verses"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <div className="space-y-4">
          {verses.map((verse) => (
            <div key={verse.number} className="flex gap-3 items-start">
              <div className="flex-1">
                <p className="text-brand-text leading-relaxed font-arabic" style={{ fontSize: arabicFontSize + 'rem' }}>
                  {verse.text}
                </p>
                {showTranslation && getVerseTranslation(currentSurah.number, verse.number) && (
                  <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
                    {getVerseTranslation(currentSurah.number, verse.number)}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-gold text-brand-void text-sm font-bold font-brand-mono">
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
