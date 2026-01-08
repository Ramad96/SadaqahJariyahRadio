// Data structure for all 114 Surahs
// Future-proofed with additionalClips array for sequential audio clips

const surahNames = [
  'Al-Fatihah', 'Al-Baqarah', 'Al-Imran', 'An-Nisa', 'Al-Ma\'idah', 'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Tawbah', 'Yunus',
  'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr', 'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
  'Al-Anbiya', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan', 'Ash-Shu\'ara', 'An-Naml', 'Al-Qasas', 'Al-\'Ankabut', 'Ar-Rum',
  'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir', 'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
  'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah', 'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
  'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman', 'Al-Waqi\'ah', 'Al-Hadid', 'Al-Mujadilah', 'Al-Hashr', 'Al-Mumtahanah',
  'As-Saff', 'Al-Jumu\'ah', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq', 'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij',
  'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyamah', 'Al-Insan', 'Al-Mursalat', 'An-Naba', 'An-Nazi\'at', '\'Abasa',
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj', 'At-Tariq', 'Al-A\'la', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad',
  'Ash-Shams', 'Al-Lail', 'Ad-Duhaa', 'Ash-Sharh', 'At-Tin', 'Al-\'Alaq', 'Al-Qadr', 'Al-Bayyina', 'Az-Zalzalah', 'Al-\'Adiyat',
  'Al-Qari\'ah', 'At-Takathur', 'Al-\'Asr', 'Al-Humazah', 'Al-Fil', 'Quraish', 'Al-Ma\'un', 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
  'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
];

export const surahs = Array.from({ length: 114 }, (_, i) => {
  const surahNumber = i + 1;
  // Assign audio files: first 9 surahs use audio1-9, surah 112 (Al-Ikhlas) uses surah-iklas
  // Using import.meta.env.BASE_URL to ensure correct paths with GitHub Pages base path
  const baseUrl = import.meta.env.BASE_URL;
  let audioUrl = null;
  if (surahNumber <= 9) {
    audioUrl = `${baseUrl}audio_files/audio${surahNumber}.mp3`;
  } else if (surahNumber === 112) {
    audioUrl = `${baseUrl}audio_files/surah-iklas.mp3`;
  }
  
  return {
    id: surahNumber,
    number: surahNumber,
    name: `${surahNumber}. ${surahNames[i]}`,
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

