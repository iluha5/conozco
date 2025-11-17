-- Update PartOfSpeech displayName to match the language

-- English (en)
UPDATE "PartOfSpeech" 
SET "displayName" = CASE 
    WHEN name = 'NOUN' THEN 'noun'
    WHEN name = 'VERB' THEN 'verb'
    WHEN name = 'ADJECTIVE' THEN 'adjective'
    WHEN name = 'ADVERB' THEN 'adverb'
    WHEN name = 'PRONOUN' THEN 'pronoun'
    WHEN name = 'PREPOSITION' THEN 'preposition'
    WHEN name = 'CONJUNCTION' THEN 'conjunction'
    WHEN name = 'INTERJECTION' THEN 'interjection'
    ELSE "displayName"
END
WHERE "languageId" = (SELECT id FROM "Language" WHERE code = 'en');

-- Spanish (es) - uppercase variants
UPDATE "PartOfSpeech" 
SET "displayName" = CASE 
    WHEN name = 'NOUN' THEN 'sustantivo'
    WHEN name = 'VERB' THEN 'verbo'
    WHEN name = 'ADJECTIVE' THEN 'adjetivo'
    WHEN name = 'ADVERB' THEN 'adverbio'
    WHEN name = 'PRONOUN' THEN 'pronombre'
    WHEN name = 'PREPOSITION' THEN 'preposición'
    WHEN name = 'CONJUNCTION' THEN 'conjunción'
    WHEN name = 'INTERJECTION' THEN 'interjección'
    ELSE "displayName"
END
WHERE "languageId" = (SELECT id FROM "Language" WHERE code = 'es');

-- Spanish (es) - lowercase variants
UPDATE "PartOfSpeech" 
SET "displayName" = CASE 
    WHEN name = 'noun' THEN 'sustantivo'
    WHEN name = 'verb' THEN 'verbo'
    WHEN name = 'verb phrase' THEN 'frase verbal'
    WHEN name = 'adverb' THEN 'adverbio'
    ELSE "displayName"
END
WHERE "languageId" = (SELECT id FROM "Language" WHERE code = 'es') 
  AND name IN ('noun', 'verb', 'verb phrase', 'adverb');

-- Russian (ru)
UPDATE "PartOfSpeech" 
SET "displayName" = CASE 
    WHEN name = 'NOUN' THEN 'существительное'
    WHEN name = 'VERB' THEN 'глагол'
    WHEN name = 'ADJECTIVE' THEN 'прилагательное'
    WHEN name = 'ADVERB' THEN 'наречие'
    WHEN name = 'PRONOUN' THEN 'местоимение'
    WHEN name = 'PREPOSITION' THEN 'предлог'
    WHEN name = 'CONJUNCTION' THEN 'союз'
    WHEN name = 'INTERJECTION' THEN 'междометие'
    ELSE "displayName"
END
WHERE "languageId" = (SELECT id FROM "Language" WHERE code = 'ru');

