export function findNextErrorWithResults(
    currentExerciseIndex: number,
    results: (boolean | null)[],
): number {
    // Ищем следующую ошибку после текущего индекса
    for (
        let errorIndex = currentExerciseIndex + 1;
        errorIndex < results.length;
        errorIndex++
    ) {
        if (results[errorIndex] === false) {
            return errorIndex;
        }
    }
    // Если не нашли, ищем с начала до текущего индекса
    for (let errorIndex = 0; errorIndex <= currentExerciseIndex; errorIndex++) {
        if (results[errorIndex] === false) {
            return errorIndex;
        }
    }
    return -1; // Ошибок больше нет
}

export function findNextError(
    currentExerciseIndex: number,
    exerciseResults: (boolean | null)[],
): number {
    return findNextErrorWithResults(currentExerciseIndex, exerciseResults);
}
