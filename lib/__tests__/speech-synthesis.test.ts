import { pickVoice, shouldAssignVoice } from '@/lib/speech-synthesis';

function mockVoice(
    partial: Partial<SpeechSynthesisVoice> & Pick<SpeechSynthesisVoice, 'lang'>,
): SpeechSynthesisVoice {
    return {
        name: partial.name ?? partial.lang,
        default: partial.default ?? false,
        localService: partial.localService ?? true,
        voiceURI: partial.voiceURI ?? partial.lang,
        ...partial,
    } as SpeechSynthesisVoice;
}

describe('pickVoice', () => {
    it('prefers en_US over en_AU when en-US is requested', () => {
        const voices = [
            mockVoice({ lang: 'en_AU', name: 'English Australia' }),
            mockVoice({ lang: 'en_US', name: 'English United States' }),
        ];

        const picked = pickVoice(voices, 'en-US');

        expect(picked?.lang).toBe('en_US');
    });

    it('does not assign mismatched region voice to utterance', () => {
        const australiaVoice = mockVoice({ lang: 'en_AU' });

        expect(shouldAssignVoice(australiaVoice, 'en-US')).toBe(false);
        expect(shouldAssignVoice(australiaVoice, 'en-AU')).toBe(true);
    });
});
