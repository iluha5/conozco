interface TrainingListHeaderProps {
    title: string;
    description: string;
}

export function TrainingListHeader({
    title,
    description,
}: TrainingListHeaderProps) {
    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
    );
}
