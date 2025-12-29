import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    centerText?: boolean;
    leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    centerText = false,
    leftIcon,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="space-y-4">
            {label && (
                <label className="block text-center text-xs font-bold font-jakarta text-slate-900 uppercase tracking-widest">
                    {label}
                </label>
            )}
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
                        w-full bg-white rounded-[20px] border border-slate-100 shadow-sm py-5 px-6 
                        outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 
                        font-bold font-jakarta text-slate-900 transition-all placeholder:text-slate-400
                        ${centerText ? 'text-center' : 'text-left'}
                        ${leftIcon ? 'pl-14' : ''}
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-red-500 text-center font-medium animate-slide-up">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
