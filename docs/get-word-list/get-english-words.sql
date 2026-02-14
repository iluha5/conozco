SELECT bw.word
FROM "BaseWord" bw
INNER JOIN "Language" l ON bw."languageId" = l.id
WHERE l.code = 'en'
ORDER BY bw.word ASC;
