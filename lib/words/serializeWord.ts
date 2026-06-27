export function serializeWord(word: any) {
    const { status, baseWord, customTranslations, ...rest } = word;

    return {
        ...rest,
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
        customTranslations: Array.isArray(customTranslations)
            ? customTranslations.map((ct: any) => ({
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
