import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    onClick
}) => {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    };

    return (
        <div
            onClick={onClick}
            className={`
                bg-white rounded-[28px] border border-slate-100 shadow-sm 
                ${paddings[padding]} 
                ${onClick ? 'cursor-pointer hover:border-blue-500 transition-all active:scale-[0.98]' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
};
