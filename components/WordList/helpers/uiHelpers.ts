export const getLoadingState = (
    loadingWords: Set<string | number>,
    wordId: string | number,
) => {
    return loadingWords.has(wordId);
};

export const getErrorState = (
    errorWords: Set<string | number>,
    wordId: string | number,
) => {
    return errorWords.has(wordId);
};
