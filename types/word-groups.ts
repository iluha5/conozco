export interface ActiveWordGroup {
    id: number;
    name: string;
    wordsCount: number;
    visibility: 'PUBLIC' | 'PRIVATE' | 'SHARED';
    isOwner: boolean;
    canRemove: boolean;
    activatedAt: Date | string;
}

export interface AvailableWordGroup {
    id: number;
    name: string;
    wordsCount: number;
    visibility: 'PUBLIC' | 'PRIVATE' | 'SHARED';
    createdBy: string;
}

export type WordGroupsFilterContext =
    | 'myWords'
    | 'addWordDialog'
    | 'trainingSetup';
