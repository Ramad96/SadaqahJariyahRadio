// Data structure for all 114 Surahs
// Future-proofed with additionalClips array for sequential audio clips

export const surahs = Array.from({ length: 114 }, (_, i) => {
  const surahNumber = i + 1;
  // Using audio files from audio_files folder, cycling through the 9 available files
  const audioFileNumber = ((surahNumber - 1) % 9) + 1;
  const audioUrl = `/audio_files/audio${audioFileNumber}.mp3`;
  
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

