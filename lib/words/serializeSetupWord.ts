export function serializeSetupWord(word: any) {
    const { status, baseWord, customTranslations, language, ...rest } = word;

    return {
        id: rest.id,
        createdAt: rest.createdAt,
        status: typeof status === 'string' ? status : status.code,
        customWord: rest.customWord ?? undefined,
        language: {
            code: language.code,
        },
        baseWord: baseWord
            ? {
                  word: baseWord.word,
                  translations: baseWord.translations.map((t: any) => ({
                      translation: t.translation,
                  })),
                  wordGroups: baseWord.wordGroups.map((wg: any) => ({
                      wordGroupId: wg.wordGroupId,
                  })),
              }
            : undefined,
        customTranslations: Array.isArray(customTranslations)
            ? customTranslations.map((ct: any) => ({
                  translation: ct.translation,
              }))
            : [],
    };
}
