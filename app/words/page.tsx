'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { ArrowLeft } from 'lucide-react';
import { AddWordDialog } from '@/components/AddWordDialog';
import { WordsList } from '@/components/WordList/WordList';
import { WordGroupsFilter } from '@/components/word-groups/WordGroupsFilter';
import { useUserSettings } from '@/hooks/settings';
import { useWordsData, useWordsFilter, useWordsStats } from '@/hooks/words';
import { useWordGroupsFilter } from '@/hooks/word-groups/use-word-groups-filter';
import { WordsFilter, Word } from '@/types/words.types';

export default function WordsPage() {
    const { settings: userSettings } = useUserSettings();
    const [selectedStatus, setSelectedStatus] = useState<string>('NOT_LEARNED');
    const [isClient, setIsClient] = useState(false);

    // Загрузка данных
    const { words, loading, refetch, updateWord, removeWord } = useWordsData();

    // Фильтр по группам
    const { selectedGroupIds, toggleGroup, toggleAll } =
        useWordGroupsFilter('myWords');

    // Получаем язык для фильтрации из настроек пользователя
    const learnLanguageCode = useMemo(() => {
        return userSettings?.learnLanguage?.code || 'ALL';
    }, [userSettings?.learnLanguage?.code]);

    // Формирование фильтра
    const filter: WordsFilter = {
        language: learnLanguageCode,
        status: selectedStatus,
        groupIds: selectedGroupIds.length > 0 ? selectedGroupIds : undefined,
    };

    // Фильтрация слов
    const filteredWords = useWordsFilter(words, filter);

    // Статистика (по языку, без учета статуса)
    const stats = useWordsStats(words, learnLanguageCode);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleAddWord = async () => {
        await refetch();
    };

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-gray-600">Загрузка...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />
            <div className="container mx-auto px-4 py-4">
                <div className="mb-3">
                    <Link href="/">
                        <Button variant="ghost">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Назад
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-row justify-between items-center gap-4 mb-6">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Мои слова
                    </h1>
                    <div className="flex flex-row gap-2 w-auto">
                        <div className="flex-none min-w-0">
                            <AddWordDialog onWordAdded={handleAddWord} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <Card
                        className={`flex-1 max-w-[140px] cursor-pointer transition-all hover:shadow-md ${
                            selectedStatus === 'ALL'
                                ? 'ring-2 ring-black shadow-md'
                                : ''
                        }`}
                        onClick={() => setSelectedStatus('ALL')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Всего слов
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`flex-1 max-w-[140px] cursor-pointer transition-all hover:shadow-md ${
                            selectedStatus === 'NOT_LEARNED'
                                ? 'ring-2 ring-orange-500 shadow-md'
                                : ''
                        }`}
                        onClick={() => setSelectedStatus('NOT_LEARNED')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Не выучено
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {stats.notLearned}
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`flex-1 max-w-[140px] cursor-pointer transition-all hover:shadow-md ${
                            selectedStatus === 'LEARNED'
                                ? 'ring-2 ring-green-500 shadow-md'
                                : ''
                        }`}
                        onClick={() => setSelectedStatus('LEARNED')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Выучено
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.learned}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <WordGroupsFilter
                        selectedGroupIds={selectedGroupIds}
                        onToggleGroup={toggleGroup}
                        onToggleAll={toggleAll}
                    />
                    <div className="text-sm text-gray-600">
                        Показано:{' '}
                        <span className="font-semibold text-gray-900">
                            {filteredWords.length}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Загрузка...</p>
                    </div>
                ) : (
                    <WordsList
                        words={filteredWords}
                        onWordsChange={refetch}
                        onWordUpdate={(wordId, updates) => {
                            updateWord(
                                Number(wordId),
                                updates as Partial<Word>,
                            );
                        }}
                        onWordRemove={wordId => {
                            removeWord(Number(wordId));
                        }}
                        showBulkActions={true}
                        emptyMessage="Слова не найдены. Добавьте новое слово!"
                    />
                )}
            </div>
        </div>
    );
}
