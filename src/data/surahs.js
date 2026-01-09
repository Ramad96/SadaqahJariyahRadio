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
  const surahName = surahNames[i];
  // Using import.meta.env.BASE_URL to ensure correct paths with GitHub Pages base path
  const baseUrl = import.meta.env.BASE_URL;
  
  // Construct folder path: {number}-{surahName}
  const folderName = `${surahNumber}-${surahName}`;
  const folderPath = `${baseUrl}audio_files/surah/${folderName}/`;
  
  // Only set audio URL if the file exists in the surah folder
  // Currently only surahs 1-5 have audio files
  // If no file exists, set to null so the surah will be greyed out
  let defaultAudioUrl = null;
  if (surahNumber <= 5) {
    // Check if audio file exists in the surah folder
    defaultAudioUrl = `${folderPath}audio1.mp3`;
  }
  
  // Define audio options for each surah - only use files from the surah-specific folder
  const audioOptions = [];
  
  // Only add "Default" option if audio file exists
  if (defaultAudioUrl) {
    audioOptions.push({ name: 'Default', url: defaultAudioUrl });
  }
  
  return {
    id: surahNumber,
    number: surahNumber,
    name: `${surahNumber}. ${surahName}`,
    nameArabic: `سورة ${surahNumber}`, // Placeholder - can be replaced with actual Arabic names
    folderName: folderName,
    folderPath: folderPath,
    audioOptions: audioOptions,
    // Legacy support - use first option's URL if available, null if no file exists
    audioUrl: defaultAudioUrl,
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

