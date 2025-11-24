'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Header } from '@/components/Header';
import { ArrowLeft, Settings } from 'lucide-react';
import { AddWordDialog } from '@/components/AddWordDialog';
import { WordsList } from '@/components/WordsList';
import { WordGroupsManagementDialog } from '@/components/word-groups/WordGroupsManagementDialog';
import { WordGroupsFilter } from '@/components/word-groups/WordGroupsFilter';
import { useTrainingSelection } from '@/hooks/shared';
import { useWordsData, useWordsFilter, useWordsStats } from '@/hooks/words';
import { useWordGroupsFilter } from '@/hooks/word-groups/use-word-groups-filter';
import { WordsFilter, Word } from '@/types/words.types';

export default function WordsPage() {
    const { selectedLanguage, setSelectedLanguage } = useTrainingSelection();
    const [selectedStatus, setSelectedStatus] = useState<string>('NOT_LEARNED');
    const [isClient, setIsClient] = useState(false);
    const [isManagementOpen, setIsManagementOpen] = useState(false);

    // Загрузка данных
    const { words, loading, refetch, updateWord, removeWord } = useWordsData();

    // Фильтр по группам
    const { selectedGroupIds, toggleGroup, toggleAll } =
        useWordGroupsFilter('myWords');

    // Формирование фильтра
    const filter: WordsFilter = {
        language: selectedLanguage,
        status: selectedStatus,
        groupIds: selectedGroupIds.length > 0 ? selectedGroupIds : undefined,
    };

    // Фильтрация слов
    const filteredWords = useWordsFilter(words, filter);

    // Статистика (по языку, без учета статуса)
    const stats = useWordsStats(words, selectedLanguage);

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

                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Мои слова
                    </h1>
                    <div className="flex flex-row gap-2 w-full md:w-auto">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setIsManagementOpen(true)}
                            className="flex-1 md:flex-none min-w-0"
                        >
                            <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                                Управление группами
                            </span>
                        </Button>
                        <div className="flex-1 md:flex-none min-w-0">
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
                    <Select
                        value={selectedLanguage}
                        onValueChange={setSelectedLanguage}
                    >
                        <SelectTrigger className="w-[200px] bg-white">
                            <SelectValue placeholder="Выберите язык" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Все языки</SelectItem>
                            <SelectItem value="en">🇬🇧 Английский</SelectItem>
                            <SelectItem value="es">🇪🇸 Испанский</SelectItem>
                        </SelectContent>
                    </Select>
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

                <WordGroupsManagementDialog
                    open={isManagementOpen}
                    onOpenChange={setIsManagementOpen}
                />
            </div>
        </div>
    );
}
