import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function TrainingEmptyState() {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-gray-600">
                    Нет слов для тренировки. Добавьте слова в словарь!
                </p>
                <div className="flex justify-center mt-4">
                    <Link href="/words">
                        <Button>Перейти к словам</Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
