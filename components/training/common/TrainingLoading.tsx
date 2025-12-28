import { useTranslation } from '@/lib/i18n';

export function TrainingLoading() {
    const { t } = useTranslation();
    return (
        <div className="text-center py-12">
            <p className="text-gray-600">{t('Loading...')}</p>
        </div>
    );
}
