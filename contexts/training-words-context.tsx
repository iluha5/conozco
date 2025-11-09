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
    setSelectedWords: (words: Set<string>) => void;
    resetSelection: () => void;
};

const TrainingWordsContext = createContext<
    TrainingWordsContextType | undefined
>(undefined);

export function TrainingWordsProvider({ children }: { children: ReactNode }) {
    const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
    const { data: session } = useSession();

    const resetSelection = () => {
        setSelectedWords(new Set());
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
