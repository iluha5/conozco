-- Revert PartOfSpeech displayName back to Russian for all languages

-- English (en) - set to Russian
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
WHERE "languageId" = (SELECT id FROM "Language" WHERE code = 'en');

-- Spanish (es) - uppercase variants - set to Russian
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
WHERE "languageId" = (SELECT id FROM "Language" WHERE code = 'es');

-- Spanish (es) - lowercase variants - set to Russian
UPDATE "PartOfSpeech" 
SET "displayName" = CASE 
    WHEN name = 'noun' THEN 'существительное'
    WHEN name = 'verb' THEN 'глагол'
    WHEN name = 'verb phrase' THEN 'глагольная фраза'
    WHEN name = 'adverb' THEN 'наречие'
    ELSE "displayName"
END
WHERE "languageId" = (SELECT id FROM "Language" WHERE code = 'es') 
  AND name IN ('noun', 'verb', 'verb phrase', 'adverb');

-- Russian (ru) - already in Russian, but ensure consistency
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

