import type { SpeechError } from '@/lib/speech-synthesis';

type SpeechErrorLogContext = {
    code: SpeechError;
    requestedLang?: string;
    textLength?: number;
    pickedVoice?: SpeechSynthesisVoice | null;
    voiceAssigned?: boolean;
    utteranceLang?: string;
    utteranceError?: string;
    utteranceCharIndex?: number;
    attempt?: 'primary' | 'fallback';
    extra?: Record<string, unknown>;
};

function formatVoiceForLog(
    voice: SpeechSynthesisVoice | null | undefined,
): Record<string, unknown> | null {
    if (!voice) {
        return null;
    }

    return {
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService,
        default: voice.default,
        voiceURI: voice.voiceURI,
    };
}

function getSpeechEnvironmentSnapshot(): Record<string, unknown> {
    if (typeof window === 'undefined') {
        return { runtime: 'server' };
    }

    const synth =
        typeof window.speechSynthesis !== 'undefined'
            ? window.speechSynthesis
            : null;

    return {
        href: window.location.href,
        origin: window.location.origin,
        secureContext: window.isSecureContext,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: [...navigator.languages],
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory:
            'deviceMemory' in navigator
                ? (navigator as Navigator & { deviceMemory?: number })
                      .deviceMemory
                : undefined,
        speechSynthesis: synth
            ? {
                  speaking: synth.speaking,
                  pending: synth.pending,
                  paused: synth.paused,
                  voicesCount: synth.getVoices().length,
              }
            : null,
        screen: {
            width: window.screen.width,
            height: window.screen.height,
            pixelRatio: window.devicePixelRatio,
        },
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
        },
    };
}

export function logSpeechError(context: SpeechErrorLogContext): void {
    console.error('[speech] playback failed', {
        ...context,
        pickedVoice: formatVoiceForLog(context.pickedVoice),
        environment: getSpeechEnvironmentSnapshot(),
        timestamp: new Date().toISOString(),
    });
}
