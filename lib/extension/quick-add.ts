import 'server-only';

import { prisma } from '@/lib/prisma';
import { getWordData } from '@/lib/translation-api';
import { checkAndLogRateLimit } from '@/lib/rate-limit';
import {
    createBaseWordFromExternal,
    findBaseWordByExactMatch,
} from '@/lib/words/createBaseWordFromExternal';
import { getWordIncludeForList } from '@/lib/words/getWordIncludeForList';
import { validateExtensionWordInput } from '@/lib/extension/word-input';
import { isLearnLanguageAvailable } from '@/config/learn-languages';

export type ExtensionQuickAddResult = {
    word: string;
    translation: string | null;
    alreadyInDictionary: boolean;
    alreadyInUserWords: boolean;
    createdInDictionary: boolean;
    examplesCount: number;
    userWordId?: number;
};

export async function quickAddWordForExtensionUser(
    userId: number,
    rawWord: string,
): Promise<
    | { success: true; data: ExtensionQuickAddResult }
    | { success: false; status: number; error: string; retryAfter?: number }
> {
    const validation = validateExtensionWordInput(rawWord);

    if (!validation.valid || !validation.normalizedWord) {
        return {
            success: false,
            status: 400,
            error: validation.error || 'Invalid word',
        };
    }

    const trimmedWord = validation.normalizedWord;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            ownLanguage: true,
            learnLanguage: true,
        },
    });

    if (!user) {
        return { success: false, status: 401, error: 'Unauthorized' };
    }

    const learnLanguageCode = user.learnLanguage?.code;

    if (!learnLanguageCode || !isLearnLanguageAvailable(learnLanguageCode)) {
        return {
            success: false,
            status: 400,
            error: 'Learning language is not configured in your profile',
        };
    }

    const translationLanguageCode = user.ownLanguage?.code || 'en';

    const language = await prisma.language.findUnique({
        where: { code: learnLanguageCode },
    });

    if (!language) {
        return {
            success: false,
            status: 400,
            error: 'Unsupported learning language',
        };
    }

    let existingBaseWord = await findBaseWordByExactMatch(
        trimmedWord,
        language.id,
        translationLanguageCode,
    );

    const alreadyInDictionary = !!existingBaseWord;
    let createdInDictionary = false;
    let examplesCount = existingBaseWord?.examples?.length ?? 0;

    if (!existingBaseWord) {
        const rateLimit = await checkAndLogRateLimit({
            email: user.email,
            action: 'EXTENSION_QUICK_ADD_NEW',
            limitMinutes: 60,
            maxAttempts: 30,
        });

        if (!rateLimit.allowed) {
            return {
                success: false,
                status: 429,
                error: 'Too many new words added via extension',
                retryAfter: rateLimit.remainingSeconds,
            };
        }

        const wordData = await getWordData(
            trimmedWord,
            learnLanguageCode,
            translationLanguageCode,
            userId,
        );

        if ('error' in wordData) {
            return {
                success: false,
                status: 500,
                error: wordData.error,
            };
        }

        existingBaseWord = await createBaseWordFromExternal({
            trimmedWord,
            languageId: language.id,
            translationLanguageCode,
            wordData,
        });

        createdInDictionary = true;
        examplesCount = wordData.examples.length;
    } else {
        const rateLimit = await checkAndLogRateLimit({
            email: user.email,
            action: 'EXTENSION_QUICK_ADD_EXISTING',
            limitMinutes: 60,
            maxAttempts: 120,
        });

        if (!rateLimit.allowed) {
            return {
                success: false,
                status: 429,
                error: 'Too many words added via extension',
                retryAfter: rateLimit.remainingSeconds,
            };
        }
    }

    const mainTranslation =
        existingBaseWord.translations[0]?.translation ?? null;

    const existingUserWord = await prisma.word.findUnique({
        where: {
            userId_baseWordId: {
                userId,
                baseWordId: existingBaseWord.id,
            },
        },
    });

    if (existingUserWord) {
        return {
            success: true,
            data: {
                word: trimmedWord,
                translation: mainTranslation,
                alreadyInDictionary,
                alreadyInUserWords: true,
                createdInDictionary,
                examplesCount,
                userWordId: existingUserWord.id,
            },
        };
    }

    const listInclude = getWordIncludeForList(userId, translationLanguageCode);

    const userWord = await prisma.word.create({
        data: {
            userId,
            baseWordId: existingBaseWord.id,
            languageId: existingBaseWord.languageId,
        },
        include: listInclude,
    });

    return {
        success: true,
        data: {
            word: trimmedWord,
            translation: mainTranslation,
            alreadyInDictionary,
            alreadyInUserWords: false,
            createdInDictionary,
            examplesCount,
            userWordId: userWord.id,
        },
    };
}
