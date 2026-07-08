import { type ClassValue, clsx } from 'clsx';
import React from 'react';
import { twMerge } from 'tailwind-merge';

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
    withHoverEffect?: boolean;
    children?: React.ReactNode;
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
    withHoverEffect = false,
    className,
    children,
    ...props
}) => {
    return (
        <div
            className={cn(
                'rounded-xl border border-slate-200 bg-white p-6 shadow-xs',
                'dark:border-slate-800 dark:bg-slate-900',
                withHoverEffect &&
                    'transition-all duration-200 hover:border-slate-300 hover:shadow-xs dark:hover:border-slate-700',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
};
