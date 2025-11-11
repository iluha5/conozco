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
import { Header } from '@/components/header';
import { ArrowLeft } from 'lucide-react';
import { AddWordDialog } from '@/components/add-word-dialog';
import { WordsList } from '@/components/words-list';
import { useToast } from '@/hooks/use-toast';
import { useTrainingSelection } from '@/hooks/use-training-settings';

type Language = {
    id: number;
    code: string;
    name: string;
};

type Word = {
    id: number;
    userId: number;
    baseWordId?: number;
    customWord?: string;
    customTranslation?: string;
    languageId: number;
    language: Language;
    status: 'NOT_LEARNED' | 'LEARNED';
    createdAt: string;
    updatedAt: string;
    baseWord?: {
        id: number;
        word: string;
        partOfSpeech: {
            id: number;
            name: string;
            displayName: string;
        };
        languageId: number;
        translations: Array<{
            translation: string;
            priority: number;
        }>;
        examples: Array<{
            example: string;
            translation: string;
            pronoun: {
                pronoun: string;
            };
            sentenceType?: {
                id: number;
                code: string;
                displayName: string;
                isNegative: boolean;
                isQuestion: boolean;
            };
        }>;
    };
};

export default function WordsPage() {
    const [words, setWords] = useState<Word[]>([]);
    const [filteredWords, setFilteredWords] = useState<Word[]>([]);
    const { selectedLanguage, setSelectedLanguage } = useTrainingSelection();
    const [selectedStatus, setSelectedStatus] = useState<string>('NOT_LEARNED');
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        fetchWords();
    }, []);

    useEffect(() => {
        filterWords();
    }, [words, selectedLanguage, selectedStatus]);

    const fetchWords = async () => {
        try {
            const response = await fetch('/api/words');
            if (response.ok) {
                const data = await response.json();
                setWords(data);
            }
        } catch (error) {
            console.error('Error fetching words:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить слова',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const filterWords = () => {
        let filtered = words;

        if (selectedLanguage !== 'ALL') {
            filtered = filtered.filter(
                word => word.language.code === selectedLanguage,
            );
        }

        if (selectedStatus !== 'ALL') {
            filtered = filtered.filter(word => word.status === selectedStatus);
        }

        setFilteredWords(filtered);
    };

    // Функция для получения слов, отфильтрованных только по языку
    const getWordsByLanguage = () => {
        if (selectedLanguage === 'ALL') {
            return words;
        }
        return words.filter(word => word.language.code === selectedLanguage);
    };

    const handleAddWord = async () => {
        await fetchWords();
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

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Мои слова
                    </h1>
                    <AddWordDialog onWordAdded={handleAddWord} />
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
                                {getWordsByLanguage().length}
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
                                {
                                    getWordsByLanguage().filter(
                                        w => w.status === 'NOT_LEARNED',
                                    ).length
                                }
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
                                {
                                    getWordsByLanguage().filter(
                                        w => w.status === 'LEARNED',
                                    ).length
                                }
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
                        onWordsChange={fetchWords}
                        showBulkActions={true}
                        emptyMessage="Слова не найдены. Добавьте новое слово!"
                    />
                )}
            </div>
        </div>
    );
}
