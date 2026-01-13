/**
 * Training feature hooks
 * Все хуки для функционала тренировки
 */

export { useTrainingState } from './use-training-state';
export { useTrainingLogic } from './use-training-logic';
export { useTrainingWordsFilter } from './use-training-words-filter';
export { useTrainingData } from './use-training-data';
export { useTrainingStorage } from './use-training-storage';
export { useTrainingInitialization } from './use-training-initialization';
export { useTrainingStorageCheck } from './use-training-storage-check';

// New hooks for stage components
export { useRetryMode } from './use-retry-mode';
export { useExerciseResults } from './use-exercise-results';
export { useFadeAnimation } from './use-fade-animation';
export { useRecordResult } from './use-record-result';
export { useSpeech } from './use-speech';

// Type exports
export type { UseRetryModeOptions, UseRetryModeReturn } from './use-retry-mode';
export type {
    UseExerciseResultsOptions,
    UseExerciseResultsReturn,
} from './use-exercise-results';
export type {
    UseFadeAnimationOptions,
    UseFadeAnimationReturn,
} from './use-fade-animation';
export type { UseRecordResultReturn } from './use-record-result';
export type { UseSpeechOptions, UseSpeechReturn } from './use-speech';
