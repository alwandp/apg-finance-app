import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    intensity?: 'low' | 'medium' | 'high';
    children?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    intensity = 'medium',
    className,
    children,
    ...props
}) => {
    const intensityClasses = {
        low: 'bg-white/20 backdrop-blur-sm border-white/20',
        medium: 'bg-white/40 backdrop-blur-md border-white/30',
        high: 'bg-white/60 backdrop-blur-xl border-white/40',
    };

    return (
        <div
            className={cn(
                'rounded-xl border shadow-xs transition-all duration-300',
                'dark:bg-slate-900/40 dark:border-white/10',
                intensityClasses[intensity],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
