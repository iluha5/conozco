import { Loader2 } from 'lucide-react';

export function LoadingOverlay() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
                <p className="text-lg font-medium text-white">
                    Завершение тренировки...
                </p>
            </div>
        </div>
    );
}
