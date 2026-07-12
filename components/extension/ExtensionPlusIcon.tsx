type ExtensionPlusIconProps = {
    size?: 'inline' | 'step';
    className?: string;
};

const sizeClasses = {
    inline: 'mx-0.5 h-[18px] w-[18px] text-[13px] shadow-[0_2px_8px_rgba(37,99,235,0.4)]',
    step: 'h-5 w-5 shrink-0 text-sm shadow-[0_2px_8px_rgba(37,99,235,0.4)]',
};

export function ExtensionPlusIcon({
    size = 'inline',
    className = '',
}: ExtensionPlusIconProps) {
    return (
        <span
            aria-hidden
            className={`inline-flex items-center justify-center rounded-full bg-[#2563eb] font-bold leading-none text-white ${sizeClasses[size]} ${className}`}
        >
            +
        </span>
    );
}
