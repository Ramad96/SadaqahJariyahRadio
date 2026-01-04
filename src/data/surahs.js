// Data structure for all 114 Surahs
// Future-proofed with additionalClips array for sequential audio clips

export const surahs = Array.from({ length: 114 }, (_, i) => {
  const surahNumber = i + 1;
  // Using dummy audio URLs - can be replaced with actual Quran recitation URLs
  const audioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${surahNumber % 10 || 10}.mp3`;
  
  return {
    id: surahNumber,
    number: surahNumber,
    name: `Surah ${surahNumber}`,
    nameArabic: `سورة ${surahNumber}`, // Placeholder - can be replaced with actual Arabic names
    audioUrl: audioUrl,
    // Future-proofing: array for additional clips to be played sequentially
    additionalClips: []
  };
});

// You can enhance this with actual Surah names later:
// Example structure for future enhancement:
/*
export const surahs = [
  {
    id: 1,
    number: 1,
    name: "Al-Fatiha",
    nameArabic: "الفاتحة",
    audioUrl: "https://...",
    additionalClips: []
  },
  // ... etc
];
*/

