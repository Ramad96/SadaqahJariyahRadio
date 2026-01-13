import { getVerse } from '../data/verses';

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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t-2 border-slate-700 shadow-2xl">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Surah Name and Range Header */}
        <div className="mb-3 pb-3 border-b border-slate-700">
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

        {/* Verses */}
        <div className="max-h-[300px] overflow-y-auto pr-2">
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
    </div>
  );
}

