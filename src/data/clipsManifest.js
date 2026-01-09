// Manifest of available clips in the clips folder
// Format: { surahNumber: [{ filename, reciter, range }] }

import { parseClipFilename } from '../utils/clipParser';

// This manifest lists all available clips
// When new clips are added, update this file
export const clipsManifest = {
  109: [
    { filename: 'ShiekhMagdiOsman_1-6.mp3' }
  ],
  112: [
    { filename: 'Stranger_1-4.mp3' }
  ]
};

/**
 * Get clips for a specific surah
 */
export function getClipsForSurah(surahNumber, surahFolderName) {
  const baseUrl = import.meta.env.BASE_URL;
  const clips = clipsManifest[surahNumber] || [];
  
  return clips.map(clip => {
    const parsed = parseClipFilename(clip.filename);
    if (!parsed) return null;
    
    return {
      name: parsed.displayName,
      reciter: parsed.reciter,
      range: parsed.range,
      url: `${baseUrl}audio_files/clips/${surahFolderName}/${clip.filename}`,
      isClip: true
    };
  }).filter(Boolean);
}

