// Export types and enums from data files
export { PartOfSpeech, SentenceTypeCode } from './words-seed-data-es';
export type { WordData } from './words-seed-data-es';

// Import word data for different languages
import { SPANISH_WORDS_DATA } from './words-seed-data-es';
import { ENGLISH_WORDS_DATA } from './words-seed-data-en';

// Combine all word data
export const WORDS_DATA = [...SPANISH_WORDS_DATA, ...ENGLISH_WORDS_DATA];
