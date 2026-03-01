// Pre-check script: compares audio files against verses_translation_en.js.
// Reports any translations that are needed but missing.
// Exits with code 0 if everything is present, 1 if anything is missing.
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

function parseRange(filename) {
  const nameWithoutExt = filename.replace(/\.mp3$/, '');
  const parts = nameWithoutExt.split('_');
  if (parts.length !== 2) return null;
  return parts[1];
}

function getVerseNumbersFromRange(range) {
  if (!range) return [];
  const parts = range.split('-');
  if (parts.length !== 2) return [];
  const start = parseInt(parts[0], 10);
  const end = parseInt(parts[1], 10);
  if (isNaN(start) || isNaN(end) || start < 1 || end < start) return [];
  const verses = [];
  for (let i = start; i <= end; i++) verses.push(i);
  return verses;
}

function extractNeededVerses() {
  const clipsPath = path.join(rootDir, 'public', 'audio_files');
  const surahVersesMap = {};

  if (!fs.existsSync(clipsPath)) {
    console.log('No audio_files folder found.');
    return surahVersesMap;
  }

  const surahFolders = fs.readdirSync(clipsPath)
    .filter(item => fs.statSync(path.join(clipsPath, item)).isDirectory());

  surahFolders.forEach(folder => {
    const match = folder.match(/^(\d+)-/);
    if (!match) return;

    const surahNumber = parseInt(match[1], 10);
    const folderPath = path.join(clipsPath, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.mp3'));
    if (files.length === 0) return;

    if (!surahVersesMap[surahNumber]) surahVersesMap[surahNumber] = new Set();

    files.forEach(file => {
      const range = parseRange(file);
      if (range) getVerseNumbersFromRange(range).forEach(v => surahVersesMap[surahNumber].add(v));
    });
  });

  const result = {};
  Object.keys(surahVersesMap).forEach(surahNum => {
    result[surahNum] = Array.from(surahVersesMap[surahNum]).sort((a, b) => a - b);
  });
  return result;
}

async function checkTranslations() {
  console.log('Checking translation coverage against audio files...\n');

  const needed = extractNeededVerses();
  const surahNumbers = Object.keys(needed).map(Number).sort((a, b) => a - b);

  if (surahNumbers.length === 0) {
    console.log('No audio files found. Nothing to check.');
    process.exit(0);
  }

  const filePath = path.join(rootDir, 'src', 'data', 'verses_translation_en.js');
  let verses = null;

  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️  src/data/verses_translation_en.js not found — all translations will be treated as missing');
  } else {
    ({ verses } = await import(pathToFileURL(filePath).href));
  }

  const missing = {};
  surahNumbers.forEach(surahNum => {
    needed[surahNum].forEach(verseNum => {
      const text = verses?.[surahNum]?.[verseNum];
      if (!text || text.trim() === '') {
        if (!missing[surahNum]) missing[surahNum] = [];
        missing[surahNum].push(verseNum);
      }
    });
  });

  const missingSurahs = Object.keys(missing).map(Number).sort((a, b) => a - b);

  if (missingSurahs.length === 0) {
    console.log('✅ [translation_en] All translations present');
    console.log('\n✅ Translation data is complete. No API fetch needed.');
    process.exit(0);
  } else {
    const count = missingSurahs.reduce((sum, s) => sum + missing[s].length, 0);
    console.log(`❌ [translation_en] ${count} translation(s) missing:`);
    missingSurahs.forEach(surahNum => {
      console.log(`   Surah ${surahNum}: verses ${missing[surahNum].join(', ')}`);
    });
    console.log(`\n⚠️  ${count} translation(s) missing. Run 'npm run fetch-translations' to fetch from the Quran.com API.`);
    process.exit(1);
  }
}

checkTranslations().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
