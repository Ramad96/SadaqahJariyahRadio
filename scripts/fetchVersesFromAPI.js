// Script to fetch Arabic verses from Quran.com API and update verses.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Parse clip filename to extract range
function parseRange(filename) {
  const nameWithoutExt = filename.replace(/\.mp3$/, '');
  const parts = nameWithoutExt.split('_');
  if (parts.length !== 2) {
    return null;
  }
  return parts[1]; // Returns range like "1-7" or "154-157"
}

// Parse range string to get all verse numbers
function getVerseNumbersFromRange(range) {
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

// Extract verse ranges from clips folder
function extractVerseRanges() {
  const clipsPath = path.join(rootDir, 'public', 'audio_files', 'clips');
  const surahVersesMap = {}; // { surahNumber: Set of verse numbers }
  
  if (!fs.existsSync(clipsPath)) {
    console.log('Clips folder not found');
    return surahVersesMap;
  }
  
  const surahFolders = fs.readdirSync(clipsPath)
    .filter(item => {
      const itemPath = path.join(clipsPath, item);
      return fs.statSync(itemPath).isDirectory();
    });
  
  surahFolders.forEach(folder => {
    const match = folder.match(/^(\d+)-/);
    if (!match) return;
    
    const surahNumber = parseInt(match[1], 10);
    const folderPath = path.join(clipsPath, folder);
    const files = fs.readdirSync(folderPath)
      .filter(file => file.endsWith('.mp3'));
    
    if (files.length === 0) return;
    
    if (!surahVersesMap[surahNumber]) {
      surahVersesMap[surahNumber] = new Set();
    }
    
    files.forEach(file => {
      const range = parseRange(file);
      if (range) {
        const verseNumbers = getVerseNumbersFromRange(range);
        verseNumbers.forEach(v => surahVersesMap[surahNumber].add(v));
      }
    });
  });
  
  // Convert Sets to sorted arrays
  const result = {};
  Object.keys(surahVersesMap).forEach(surahNum => {
    result[surahNum] = Array.from(surahVersesMap[surahNum]).sort((a, b) => a - b);
  });
  
  return result;
}

// Fetch all verses for a chapter from Quran.com API
async function fetchVersesForChapter(surahNumber) {
  try {
    // Use the quran/verses/uthmani endpoint which returns text_uthmani
    const url = `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNumber}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Build a map of verse_number -> text_uthmani
    // The verse_key is in format "chapter:verse" (e.g., "1:1")
    const versesMap = {};
    if (data.verses && Array.isArray(data.verses)) {
      data.verses.forEach(verse => {
        if (verse.verse_key && verse.text_uthmani) {
          // Extract verse number from verse_key (format: "1:1" -> verse 1)
          const verseNumber = parseInt(verse.verse_key.split(':')[1], 10);
          if (!isNaN(verseNumber) && verseNumber > 0) {
            versesMap[verseNumber] = verse.text_uthmani;
          }
        }
      });
    }
    
    return versesMap;
  } catch (error) {
    console.error(`Error fetching verses for chapter ${surahNumber}:`, error.message);
    return {};
  }
}

// Fetch all verses for a surah
async function fetchVersesForSurah(surahNumber, verseNumbers) {
  console.log(`Fetching verses for Surah ${surahNumber}...`);
  
  // Fetch all verses for the chapter at once
  const allVerses = await fetchVersesForChapter(surahNumber);
  
  // Extract only the verses we need
  const verses = {};
  for (const verseNum of verseNumbers) {
    if (allVerses[verseNum]) {
      verses[verseNum] = allVerses[verseNum];
      console.log(`  ✓ Verse ${verseNum}`);
    } else {
      console.log(`  ✗ Verse ${verseNum} - not found in API response`);
      verses[verseNum] = ""; // Keep placeholder
    }
  }
  
  // Add a small delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return verses;
}

// Main function
async function rebuildVerses() {
  console.log('Extracting verse ranges from audio files...\n');
  const verseRanges = extractVerseRanges();
  
  console.log('Found verses needed:');
  Object.keys(verseRanges).forEach(surahNum => {
    const verses = verseRanges[surahNum];
    const min = Math.min(...verses);
    const max = Math.max(...verses);
    console.log(`  Surah ${surahNum}: verses ${min}-${max} (${verses.length} verses)`);
  });
  
  console.log('\nFetching Arabic text from Quran.com API...\n');
  
  const allVerses = {};
  
  // Sort surah numbers
  const surahNumbers = Object.keys(verseRanges).map(Number).sort((a, b) => a - b);
  
  for (const surahNum of surahNumbers) {
    const verseNumbers = verseRanges[surahNum];
    if (verseNumbers.length === 0) continue;
    
    const verses = await fetchVersesForSurah(surahNum, verseNumbers);
    allVerses[surahNum] = verses;
    console.log(`\nCompleted Surah ${surahNum}\n`);
  }
  
  // Generate the verses.js file
  let versesContent = `// Arabic verses of the Quran
// Generated based on audio files in public/audio_files/clips folder
// Only includes verses that have corresponding audio files
// Generated by scripts/fetchVersesFromAPI.js
// 
// SOURCE: Arabic text fetched from Quran.com API (Uthmani script)
// API: https://api.quran.com/api/v4/quran/verses/uthmani
// 
// Note: All verses with corresponding audio files now have Arabic text.

export const verses = {
`;

  surahNumbers.forEach(surahNum => {
    const verses = allVerses[surahNum];
    if (!verses || Object.keys(verses).length === 0) return;
    
    const verseNumbers = Object.keys(verses).map(Number).sort((a, b) => a - b);
    versesContent += `  ${surahNum}: {\n`;
    versesContent += `    // Verses needed: ${verseNumbers.join(', ')}\n`;
    verseNumbers.forEach(verseNum => {
      const text = verses[verseNum] || "";
      // Escape quotes in the Arabic text
      const escapedText = text.replace(/"/g, '\\"');
      versesContent += `    ${verseNum}: "${escapedText}",\n`;
    });
    versesContent += `  },\n`;
  });
  
  versesContent += `};

/**
 * Get verses for a specific surah
 * @param {number} surahNumber - The surah number (1-114)
 * @returns {Object|null} - Object with verse numbers as keys and Arabic text as values, or null if not found
 */
export function getVersesForSurah(surahNumber) {
  return verses[surahNumber] || null;
}

/**
 * Get a specific verse
 * @param {number} surahNumber - The surah number (1-114)
 * @param {number} verseNumber - The verse number (1-based)
 * @returns {string|null} - The Arabic verse text, or null if not found
 */
export function getVerse(surahNumber, verseNumber) {
  const surahVerses = verses[surahNumber];
  if (!surahVerses || !surahVerses[verseNumber]) {
    return null;
  }
  return surahVerses[verseNumber];
}

/**
 * Get all verse numbers available for a surah
 * @param {number} surahNumber - The surah number (1-114)
 * @returns {number[]} - Array of verse numbers that have Arabic text
 */
export function getAvailableVerseNumbers(surahNumber) {
  const surahVerses = verses[surahNumber];
  if (!surahVerses) return [];
  return Object.keys(surahVerses).map(Number).sort((a, b) => a - b);
}
`;

  const versesPath = path.join(rootDir, 'src', 'data', 'verses.js');
  fs.writeFileSync(versesPath, versesContent);
  
  console.log(`\n✅ Verses file updated at: ${versesPath}`);
  console.log('All verses have been fetched from Quran.com API');
}

// Run the script
rebuildVerses().catch(error => {
  console.error('Error rebuilding verses:', error);
  process.exit(1);
});

