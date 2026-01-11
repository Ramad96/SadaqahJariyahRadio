// Utility functions for parsing clip filenames and loading clips

/**
 * Parses a clip filename to extract reciter name and ayah range
 * Format: ReciterName_1-10.mp3
 * Example: ShiekhMagdiOsman_1-6.mp3 -> { reciter: "Shiekh Magdi Osman", range: "1-6" }
 */
export function parseClipFilename(filename) {
  // Remove .mp3 extension
  const nameWithoutExt = filename.replace(/\.mp3$/, '');
  
  // Split by underscore to separate reciter name and range
  const parts = nameWithoutExt.split('_');
  if (parts.length !== 2) {
    return null; // Invalid format
  }
  
  const [reciterName, range] = parts;
  
  // Split reciter name by capital letters
  // Example: "ShiekhMagdiOsman" -> "Shiekh Magdi Osman"
  // Handle first letter correctly
  const formattedReciter = reciterName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  
  return {
    reciter: formattedReciter,
    range: range,
    displayName: `${formattedReciter} (${range})`
  };
}

/**
 * Loads clips for a surah from the clips folder
 * Returns an array of audio options with parsed information
 */
export async function loadClipsForSurah(surahNumber, surahFolderName) {
  const baseUrl = import.meta.env.BASE_URL;
  const clipsPath = `${baseUrl}audio_files/clips/${surahFolderName}/`;
  
  // In a real application, you'd fetch the list of files from the server
  // For now, we'll use a predefined list or check common filenames
  // This is a placeholder - in production, you'd need an API endpoint or manifest file
  
  // For now, return empty array - clips will be loaded dynamically
  // when the user selects clips mode, we'll need to scan the folder
  return [];
}

/**
 * Creates a clip audio option from a filename
 */
export function createClipAudioOption(filename, surahFolderName) {
  const parsed = parseClipFilename(filename);
  if (!parsed) return null;
  
  const baseUrl = import.meta.env.BASE_URL;
  const url = `${baseUrl}audio_files/clips/${surahFolderName}/${filename}`;
  
  return {
    name: parsed.displayName,
    reciter: parsed.reciter,
    range: parsed.range,
    url: url,
    isClip: true
  };
}

/**
 * Checks if a range covers the complete surah
 * @param {string} range - The range string (e.g., "1-7", "1-286")
 * @param {number} totalAyahs - Total number of ayahs in the surah
 * @returns {boolean} - True if the range covers the complete surah
 */
export function isCompleteSurah(range, totalAyahs) {
  if (!range || !totalAyahs) return false;
  
  // Parse the range (e.g., "1-7" -> [1, 7])
  const parts = range.split('-');
  if (parts.length !== 2) return false;
  
  const start = parseInt(parts[0], 10);
  const end = parseInt(parts[1], 10);
  
  // Check if range starts at 1 and ends at totalAyahs
  return start === 1 && end === totalAyahs;
}

/**
 * Gets the display text for a range
 * @param {string} range - The range string (e.g., "1-7", "1-286")
 * @param {number} totalAyahs - Total number of ayahs in the surah
 * @returns {string} - "Complete Surah" if it covers all ayahs, otherwise the range
 */
export function getRangeDisplay(range, totalAyahs) {
  if (isCompleteSurah(range, totalAyahs)) {
    return 'Complete Surah';
  }
  return range;
}

