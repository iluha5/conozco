declare module 'nspell' {
    interface NSpell {
        correct(_word: string): boolean;
    }

    interface HunspellDictionary {
        aff: Uint8Array;
        dic: Uint8Array;
    }

    export default function nspell(_dictionary: HunspellDictionary): NSpell;
}
