export function serializeWordListItem(word: any) {
    const { status, baseWord, customTranslations, language, ...rest } = word;

    return {
        id: rest.id,
        status: typeof status === 'string' ? status : status.code,
        language: {
            code: language.code,
            name: language.name,
        },
        customWord: rest.customWord ?? undefined,
        baseWord: baseWord
            ? {
                  word: baseWord.word,
                  translations: baseWord.translations.map((t: any) => ({
                      translation: t.translation,
                      priority: t.priority,
                      partOfSpeech: t.partOfSpeech
                          ? { name: t.partOfSpeech.name }
                          : undefined,
                  })),
                  translationsCount:
                      baseWord._count?.translations ??
                      baseWord.translations?.length ??
                      0,
              }
            : undefined,
        customTranslations: Array.isArray(customTranslations)
            ? customTranslations.map((ct: any) => ({
                  translation: ct.translation,
                  partOfSpeechId: ct.partOfSpeechId,
                  partOfSpeech: ct.partOfSpeech
                      ? { name: ct.partOfSpeech.name }
                      : undefined,
              }))
            : [],
    };
}
