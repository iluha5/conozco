'use client';

import { toast } from '@/hooks/shared/use-toast';
import { getSpeechErrorMessage } from '@/lib/speech-error-message';
import type { SpeechError } from '@/lib/speech-synthesis';

export function showSpeechErrorToast(
    error: SpeechError,
    t: (_key: string) => string,
): void {
    toast({
        title: t('Error'),
        description: getSpeechErrorMessage(t, error),
        variant: 'destructive',
    });
}
