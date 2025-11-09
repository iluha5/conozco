// Экспортируем типы и енумы из файлов с данными
export { PartOfSpeech, SentenceTypeCode, WordData } from './words-seed-data-es';

// Импортируем данные слов для разных языков
import { SPANISH_WORDS_DATA } from './words-seed-data-es';
import { ENGLISH_WORDS_DATA } from './words-seed-data-en';

// Объединяем все данные слов
export const WORDS_DATA = [...SPANISH_WORDS_DATA, ...ENGLISH_WORDS_DATA];
