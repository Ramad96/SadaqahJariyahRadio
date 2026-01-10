// Reciter descriptions - one-liner about each reciter
// This maps reciter names to their descriptions

export const reciterDescriptions = {
  'Default': 'A default recitation option for this surah.',
  'audio1': 'A default recitation option for this surah.',
  'Sheikh Fouad Saeed Abdulkadir': 'A renowned reciter known for his beautiful and melodious recitation style.',
  'Shiekh Magdi Osman': 'A respected reciter whose recitations continue to inspire listeners worldwide.',
  'Stranger': 'An anonymous reciter whose recitation has been preserved for posterity.',
  // Add more reciters as needed
};

/**
 * Get description for a reciter
 * @param {string} reciterName - The name of the reciter
 * @returns {string} - The description or a default message
 */
export function getReciterDescription(reciterName) {
  if (!reciterName) return 'No description available.';
  return reciterDescriptions[reciterName] || `A reciter whose beautiful recitation has been preserved for this surah.`;
}

