function mapBaseWordRelations(baseWord: any) {
    return {
        ...baseWord,
        id: baseWord.id.toString(),
        languageId: baseWord.languageId.toString(),
        examples: baseWord.examples.map((example: any) => ({
            ...example,
            sentenceType: example.sentenceType,
            translationLanguage: example.translationLanguage
                ? {
                      id: example.translationLanguage.id,
                      code: example.translationLanguage.code,
                      name: example.translationLanguage.name,
                  }
                : null,
        })),
        grammaticalExamples: baseWord.grammaticalExamples.map(
            (example: any) => ({
                ...example,
                sentenceType: example.sentenceType,
            }),
        ),
    };
}

interface UserWordInfo {
    id: number;
    statusId: number;
}

interface BuildReviewWordsFromBaseOptions {
    userId: number;
    wordStatusNotLearnedId: number;
    wordStatusLearnedId?: number;
    userWordsMap: Map<number | null, UserWordInfo | undefined>;
    belongsToUserDefault?: boolean;
}

export function buildReviewWordsFromBase(
    baseWords: any[],
    {
        userId,
        wordStatusNotLearnedId,
        wordStatusLearnedId,
        userWordsMap,
        belongsToUserDefault = false,
    }: BuildReviewWordsFromBaseOptions,
) {
    return baseWords.map(baseWord => {
        const userWord = userWordsMap.get(baseWord.id);
        const belongsToUser = belongsToUserDefault || !!userWord;

        return {
            id: userWord?.id?.toString() || `base-${baseWord.id}`,
            userId: userId.toString(),
            baseWordId: baseWord.id.toString(),
            customWord: null,
            languageId: baseWord.languageId.toString(),
            language: {
                id: baseWord.language.id.toString(),
                code: baseWord.language.code,
                name: baseWord.language.name,
            },
            status:
                userWord && wordStatusLearnedId
                    ? userWord.statusId === wordStatusLearnedId
                        ? 'LEARNED'
                        : 'NOT_LEARNED'
                    : 'NOT_LEARNED',
            statusId: userWord?.statusId || wordStatusNotLearnedId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            belongsToUser,
            baseWord: mapBaseWordRelations(baseWord),
            customTranslations: [],
        };
    });
}

export function serializeReviewWord(word: any) {
    const {
        status,
        baseWord,
        customTranslations: _customTranslations,
        ...restWord
    } = word;

    return {
        ...restWord,
        status: typeof status === 'string' ? status : status.code,
        baseWord: baseWord
            ? {
                  ...baseWord,
                  examples: baseWord.examples.map((example: any) => ({
                      ...example,
                      sentenceType: example.sentenceType,
                      translationLanguage: example.translationLanguage
                          ? {
                                id: example.translationLanguage.id,
                                code: example.translationLanguage.code,
                                name: example.translationLanguage.name,
                            }
                          : null,
                  })),
                  grammaticalExamples: baseWord.grammaticalExamples.map(
                      (example: any) => ({
                          ...example,
                          sentenceType: example.sentenceType,
                      }),
                  ),
              }
            : undefined,
        customTranslations: [],
    };
}

export function serializeUserReviewWord(word: any, userId: number) {
    const serialized = serializeReviewWord({
        ...word,
        belongsToUser: word.userId === userId,
    });

    return {
        ...serialized,
        belongsToUser: word.userId === userId,
        customTranslations: Array.isArray(word.customTranslations)
            ? word.customTranslations.map((ct: any) => ({
                  id: ct.id,
                  translation: ct.translation,
                  partOfSpeechId: ct.partOfSpeechId,
                  partOfSpeech: ct.partOfSpeech
                      ? {
                            id: ct.partOfSpeech.id,
                            name: ct.partOfSpeech.name,
                        }
                      : null,
                  originalLanguage: ct.originalLanguage
                      ? {
                            id: ct.originalLanguage.id,
                            code: ct.originalLanguage.code,
                            name: ct.originalLanguage.name,
                        }
                      : null,
                  translationLanguage: ct.translationLanguage
                      ? {
                            id: ct.translationLanguage.id,
                            code: ct.translationLanguage.code,
                            name: ct.translationLanguage.name,
                        }
                      : null,
              }))
            : [],
    };
}
