'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';

type TrainingWordsContextType = {
    selectedWords: Set<string>;
    setSelectedWords: (
        words: Set<string> | ((prev: Set<string>) => Set<string>),
    ) => void;
    resetSelection: () => void;
};

const TrainingWordsContext = createContext<
    TrainingWordsContextType | undefined
>(undefined);

export function TrainingWordsProvider({ children }: { children: ReactNode }) {
    const [selectedWords, setSelectedWordsState] = useState<Set<string>>(
        new Set(),
    );
    const { data: session } = useSession();

    const setSelectedWords = (
        words: Set<string> | ((prev: Set<string>) => Set<string>),
    ) => {
        if (typeof words === 'function') {
            setSelectedWordsState(prev => words(prev));
        } else {
            setSelectedWordsState(words);
        }
    };

    const resetSelection = () => {
        setSelectedWordsState(new Set());
    };

    return (
        <TrainingWordsContext.Provider
            value={{ selectedWords, setSelectedWords, resetSelection }}
        >
            {children}
        </TrainingWordsContext.Provider>
    );
}

export function useTrainingWords() {
    const context = useContext(TrainingWordsContext);
    if (context === undefined) {
        throw new Error(
            'useTrainingWords must be used within a TrainingWordsProvider',
        );
    }
    return context;
}
