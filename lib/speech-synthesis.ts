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

export function pickVoice(
    voices: SpeechSynthesisVoice[],
    lang: string,
): SpeechSynthesisVoice | null {
    if (voices.length === 0) {
        return null;
    }

    const langPrefix = lang.split('-')[0];

    const exactMatch = voices.find(voice => voice.lang === lang);

    if (exactMatch) {
        return exactMatch;
    }

    const prefixMatch = voices.find(voice => voice.lang.startsWith(langPrefix));

    if (prefixMatch) {
        return prefixMatch;
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

function speakOnce(
    text: string,
    options: SpeechOptions,
    voice: SpeechSynthesisVoice | null,
    lang: string,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        if (voice) {
            utterance.voice = voice;
        }
        utterance.rate = options.rate ?? DEFAULT_RATE;
        utterance.pitch = options.pitch ?? DEFAULT_PITCH;

        utterance.onend = () => resolve();
        utterance.onerror = () =>
            reject('synthesis-failed' satisfies SpeechError);

        window.speechSynthesis.speak(utterance);
    });
}

async function speakWithVoice(
    text: string,
    options: SpeechOptions,
    voices: SpeechSynthesisVoice[],
    lang: string,
): Promise<void> {
    const voice = pickVoice(voices, lang);
    cancelSpeech();
    await speakOnce(text, options, voice, lang);
}

export async function speakText(
    text: string,
    options: SpeechOptions,
): Promise<void> {
    if (!isSpeechApiAvailable()) {
        throw 'unsupported' satisfies SpeechError;
    }

    if (!text) {
        return;
    }

    const voices = await loadVoices();
    const voice = pickVoice(voices, options.lang);

    if (!voice) {
        throw 'voices-unavailable' satisfies SpeechError;
    }

    try {
        await speakWithVoice(text, options, voices, options.lang);
    } catch {
        try {
            await speakWithVoice(text, options, voices, FALLBACK_LANG);
        } catch {
            throw 'synthesis-failed' satisfies SpeechError;
        }
    }
}
