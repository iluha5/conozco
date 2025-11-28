import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
    message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-gray-600">{message}</p>
            </CardContent>
        </Card>
    );
}
