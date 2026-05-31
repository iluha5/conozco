import {
    langLanguagesMatch,
    langRegionsMatch,
    langTagsMatch,
    parseLangTag,
} from '@/lib/speech-locale';
import { logSpeechError } from '@/lib/speech-debug-log';

export type SpeechError =
    | 'unsupported'
    | 'voices-unavailable'
    | 'synthesis-failed';

export type SpeechOptions = {
    lang: string;
    rate?: number;
    pitch?: number;
};

const VOICES_LOAD_TIMEOUT_MS = 3000;
const DEFAULT_RATE = 0.8;
const DEFAULT_PITCH = 1;
const FALLBACK_LANG = 'en-US';

let cachedVoices: SpeechSynthesisVoice[] | null = null;
let loadVoicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

export function isSpeechApiAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function preferDefaultOrLocal(
    voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
    if (voices.length === 0) {
        return null;
    }

    return (
        voices.find(voice => voice.default) ??
        voices.find(voice => voice.localService) ??
        voices[0]
    );
}

export function pickVoice(
    voices: SpeechSynthesisVoice[],
    lang: string,
): SpeechSynthesisVoice | null {
    if (voices.length === 0) {
        return null;
    }

    const exactMatch = voices.find(voice => langTagsMatch(voice.lang, lang));

    if (exactMatch) {
        return exactMatch;
    }

    const regionMatch = voices.filter(voice =>
        langRegionsMatch(voice.lang, lang),
    );

    const regionVoice = preferDefaultOrLocal(regionMatch);
    if (regionVoice) {
        return regionVoice;
    }

    const requested = parseLangTag(lang);
    const sameLanguage = voices.filter(voice =>
        langLanguagesMatch(voice.lang, lang),
    );

    if (requested.region && sameLanguage.length > 0) {
        const requestedRegionVoices = sameLanguage.filter(
            voice => parseLangTag(voice.lang).region === requested.region,
        );
        const regionalVoice = preferDefaultOrLocal(requestedRegionVoices);
        if (regionalVoice) {
            return regionalVoice;
        }
    }

    const languageVoice = preferDefaultOrLocal(sameLanguage);
    if (languageVoice) {
        return languageVoice;
    }

    const defaultVoice = voices.find(voice => voice.default);
    if (defaultVoice) {
        return defaultVoice;
    }

    const localVoice = voices.find(voice => voice.localService);
    if (localVoice) {
        return localVoice;
    }

    return voices[0];
}

export function shouldAssignVoice(
    voice: SpeechSynthesisVoice | null,
    lang: string,
): boolean {
    if (!voice) {
        return false;
    }

    return (
        langTagsMatch(voice.lang, lang) || langRegionsMatch(voice.lang, lang)
    );
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
    if (cachedVoices && cachedVoices.length > 0) {
        return Promise.resolve(cachedVoices);
    }

    if (!isSpeechApiAvailable()) {
        return Promise.resolve([]);
    }

    if (loadVoicesPromise) {
        return loadVoicesPromise;
    }

    loadVoicesPromise = new Promise(resolve => {
        const synth = window.speechSynthesis;

        const finish = (voices: SpeechSynthesisVoice[]) => {
            if (voices.length > 0) {
                cachedVoices = voices;
            }
            loadVoicesPromise = null;
            resolve(voices);
        };

        const tryResolveWithVoices = (): boolean => {
            const voices = synth.getVoices();
            if (voices.length > 0) {
                finish(voices);
                return true;
            }
            return false;
        };

        if (tryResolveWithVoices()) {
            return;
        }

        const handleVoicesChanged = () => {
            if (tryResolveWithVoices()) {
                synth.removeEventListener('voiceschanged', handleVoicesChanged);
                clearTimeout(timeoutId);
            }
        };

        synth.addEventListener('voiceschanged', handleVoicesChanged);

        const timeoutId = setTimeout(() => {
            synth.removeEventListener('voiceschanged', handleVoicesChanged);
            finish(synth.getVoices());
        }, VOICES_LOAD_TIMEOUT_MS);
    });

    return loadVoicesPromise;
}

export function cancelSpeech(): void {
    if (!isSpeechApiAvailable()) {
        return;
    }
    window.speechSynthesis.cancel();
}

type SpeakContext = {
    text: string;
    options: SpeechOptions;
    lang: string;
    voice: SpeechSynthesisVoice | null;
    attempt: 'primary' | 'fallback';
};

function speakOnce(context: SpeakContext): Promise<void> {
    const { text, options, lang, voice, attempt } = context;

    return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        const voiceAssigned = shouldAssignVoice(voice, lang);
        if (voiceAssigned && voice) {
            utterance.voice = voice;
        }

        utterance.rate = options.rate ?? DEFAULT_RATE;
        utterance.pitch = options.pitch ?? DEFAULT_PITCH;

        utterance.onend = () => resolve();
        utterance.onerror = event => {
            logSpeechError({
                code: 'synthesis-failed',
                requestedLang: options.lang,
                textLength: text.length,
                pickedVoice: voice,
                voiceAssigned,
                utteranceLang: lang,
                utteranceError: event.error,
                utteranceCharIndex: event.charIndex,
                attempt,
            });
            reject('synthesis-failed' satisfies SpeechError);
        };

        window.speechSynthesis.speak(utterance);
    });
}

async function speakWithVoice(context: SpeakContext): Promise<void> {
    if (isSpeechApiAvailable()) {
        const synth = window.speechSynthesis;
        if (synth.speaking || synth.pending) {
            cancelSpeech();
        }
    }

    await speakOnce(context);
}

export async function speakText(
    text: string,
    options: SpeechOptions,
): Promise<void> {
    if (!isSpeechApiAvailable()) {
        logSpeechError({
            code: 'unsupported',
            requestedLang: options.lang,
            textLength: text.length,
        });
        throw 'unsupported' satisfies SpeechError;
    }

    if (!text) {
        return;
    }

    const voices = await loadVoices();
    const voice = pickVoice(voices, options.lang);

    if (!voice) {
        logSpeechError({
            code: 'voices-unavailable',
            requestedLang: options.lang,
            textLength: text.length,
            extra: { voicesCount: voices.length },
        });
        throw 'voices-unavailable' satisfies SpeechError;
    }

    const primaryContext: SpeakContext = {
        text,
        options,
        lang: options.lang,
        voice,
        attempt: 'primary',
    };

    try {
        await speakWithVoice(primaryContext);
    } catch {
        const fallbackVoice = pickVoice(voices, FALLBACK_LANG);

        try {
            await speakWithVoice({
                text,
                options,
                lang: FALLBACK_LANG,
                voice: fallbackVoice,
                attempt: 'fallback',
            });
        } catch {
            logSpeechError({
                code: 'synthesis-failed',
                requestedLang: options.lang,
                textLength: text.length,
                pickedVoice: voice,
                voiceAssigned: shouldAssignVoice(voice, options.lang),
                attempt: 'fallback',
                extra: {
                    fallbackLang: FALLBACK_LANG,
                    fallbackVoice: fallbackVoice?.lang,
                },
            });
            throw 'synthesis-failed' satisfies SpeechError;
        }
    }
}
