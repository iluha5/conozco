export function findNextErrorWithResults(
    currentExerciseIndex: number,
    results: (boolean | null)[],
): number {
    for (
        let errorIndex = currentExerciseIndex + 1;
        errorIndex < results.length;
        errorIndex++
    ) {
        if (results[errorIndex] === false) {
            return errorIndex;
        }
    }
    // Wrap to start when no error after currentExerciseIndex
    for (let errorIndex = 0; errorIndex <= currentExerciseIndex; errorIndex++) {
        if (results[errorIndex] === false) {
            return errorIndex;
        }
    }
    return -1;
}

export function findNextError(
    currentExerciseIndex: number,
    exerciseResults: (boolean | null)[],
): number {
    return findNextErrorWithResults(currentExerciseIndex, exerciseResults);
}
