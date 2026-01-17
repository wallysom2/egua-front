'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface DashboardCardProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    color?: 'blue' | 'brand' | 'purple' | 'green' | 'orange' | 'red';
    href?: string;
    onClick?: () => void;
    children?: ReactNode;
    buttonText?: string;
    delay?: number;
}

const colorMap = {
    blue: {
        from: 'from-blue-500',
        to: 'to-blue-600',
        hoverFrom: 'hover:from-blue-600',
        hoverTo: 'hover:to-blue-700',
        border: 'hover:border-blue-400 dark:hover:border-blue-500',
        shadow: 'shadow-blue-500/20',
        button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    },
    brand: {
        from: 'from-brand-500',
        to: 'to-brand-600',
        hoverFrom: 'hover:from-brand-600',
        hoverTo: 'hover:to-brand-700',
        border: 'hover:border-brand-400 dark:hover:border-brand-500',
        shadow: 'shadow-brand-500/20',
        button: 'from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700',
    },
    purple: {
        from: 'from-purple-500',
        to: 'to-purple-600',
        hoverFrom: 'hover:from-purple-600',
        hoverTo: 'hover:to-purple-700',
        border: 'hover:border-purple-400 dark:hover:border-purple-500',
        shadow: 'shadow-purple-500/20',
        button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    },
    green: {
        from: 'from-green-500',
        to: 'to-green-600',
        hoverFrom: 'hover:from-green-600',
        hoverTo: 'hover:to-green-700',
        border: 'hover:border-green-400 dark:hover:border-green-500',
        shadow: 'shadow-green-500/20',
        button: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    },
    orange: {
        from: 'from-orange-500',
        to: 'to-orange-600',
        hoverFrom: 'hover:from-orange-600',
        hoverTo: 'hover:to-orange-700',
        border: 'hover:border-orange-400 dark:hover:border-orange-500',
        shadow: 'shadow-orange-500/20',
        button: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    },
    red: {
        from: 'from-red-500',
        to: 'to-red-600',
        hoverFrom: 'hover:from-red-600',
        hoverTo: 'hover:to-red-700',
        border: 'hover:border-red-400 dark:hover:border-red-500',
        shadow: 'shadow-red-500/20',
        button: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    },
};

export function DashboardCard({
    title,
    description,
    icon: Icon,
    color = 'brand',
    href,
    onClick,
    children,
    buttonText,
    delay = 0,
}: DashboardCardProps) {
    const activeColor = colorMap[color];

    const content = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`group bg-white dark:bg-bg-secondary rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-border-custom ${activeColor.border} transition-all hover:shadow-2xl cursor-pointer w-full max-w-[320px] mx-auto aspect-square flex flex-col items-center text-center`}
            onClick={onClick}
        >
            <div className="flex flex-col items-center justify-center flex-1 w-full">
                {/* Ícone */}
                <div className={`w-20 h-20 bg-gradient-to-br ${activeColor.from} ${activeColor.to} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg ${activeColor.shadow}`}>
                    <Icon className="w-10 h-10 text-white" />
                </div>

                {/* Nome/Título */}
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-text-primary line-clamp-2" title={title}>
                    {title}
                </h3>

                {/* Descrição */}
                {description && (
                    <p className="text-slate-600 dark:text-text-secondary text-sm mb-6 leading-relaxed line-clamp-2">
                        {description}
                    </p>
                )}
            </div>

            {/* Children (Extra Content) */}
            {children && (
                <div className="w-full mt-auto">
                    {children}
                </div>
            )}

            {/* Botão */}
            {buttonText && (
                <div className={`mt-auto w-full py-3 px-6 bg-gradient-to-r ${activeColor.button} text-white rounded-xl transition-all font-bold text-base shadow-md`}>
                    {buttonText}
                </div>
            )}
        </motion.div>
    );

    if (href) {
        return (
            <Link href={href} className="h-full">
                {content}
            </Link>
        );
    }

    return content;
}
