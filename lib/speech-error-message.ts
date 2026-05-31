import type { SpeechError } from '@/lib/speech-synthesis';

export function getSpeechErrorMessage(
    t: (_key: string) => string,
    error: SpeechError,
): string {
    switch (error) {
        case 'unsupported':
            return t('Speech synthesis is not supported in this browser');
        case 'voices-unavailable':
            return t(
                'Install Google Text-to-speech and the language pack in Android settings',
            );
        case 'synthesis-failed':
            return t('Could not play pronunciation. Try again.');
        default:
            return t('Could not play pronunciation. Try again.');
    }
}
