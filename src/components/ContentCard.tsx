import Link from 'next/link';
import { motion } from 'framer-motion';

interface Badge {
    text: string;
    variant: 'blue' | 'purple' | 'green' | 'yellow' | 'slate';
}

interface ContentCardProps {
    title: string;
    subtitle?: string;
    badges?: Badge[];
    mainAction: {
        label: string;
        href: string;
    };
    editAction?: {
        href?: string;
        onClick?: () => void;
    };
    deleteAction?: {
        onClick: () => void;
    };
    viewMode: 'grid' | 'list';
    showActions?: boolean;
    index?: number;
}

export function ContentCard({
    title,
    subtitle,
    badges = [],
    mainAction,
    editAction,
    deleteAction,
    viewMode,
    showActions = false,
    index = 0,
}: ContentCardProps) {
    const getBadgeStyles = (variant: string) => {
        switch (variant) {
            case 'blue':
                return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
            case 'purple':
                return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300';
            case 'green':
                return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
            case 'yellow':
                return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
            default:
                return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`group bg-white dark:bg-bg-secondary backdrop-blur rounded-xl shadow-sm border border-slate-200 dark:border-border-custom hover:border-slate-300 dark:hover:border-border-hover transition-all hover:shadow-md ${viewMode === 'grid'
                ? 'p-6 hover:scale-105'
                : 'p-4 flex items-center gap-6'
                }`}
        >
            {viewMode === 'grid' ? (
                <>
                    {/* Grid View */}
                    <div className="flex items-start justify-between mb-4 min-h-[24px]">
                        <div className="text-xs text-slate-500 dark:text-text-tertiary">
                            {subtitle}
                        </div>
                        <div className="flex gap-2">
                            {badges.map((badge, i) => (
                                <span
                                    key={i}
                                    className={`px-2 py-1 rounded text-xs font-medium ${getBadgeStyles(
                                        badge.variant,
                                    )}`}
                                >
                                    {badge.text}
                                </span>
                            ))}
                        </div>
                    </div>

                    <h2
                        className="text-xl font-bold mb-6 text-slate-900 dark:text-white leading-tight line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: title }}
                    />

                    <div className="flex gap-3 mt-auto">
                        <Link
                            href={mainAction.href}
                            className="flex-1 text-center py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-medium"
                        >
                            {mainAction.label}
                        </Link>

                        {showActions && (
                            <div className="flex gap-2">
                                {editAction && (
                                    editAction.href ? (
                                        <Link
                                            href={editAction.href}
                                            className="p-3 bg-slate-100 dark:bg-bg-tertiary text-slate-600 dark:text-text-secondary rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            title="Editar"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                />
                                            </svg>
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={editAction.onClick}
                                            className="p-3 bg-slate-100 dark:bg-bg-tertiary text-slate-600 dark:text-text-secondary rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            title="Editar"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                />
                                            </svg>
                                        </button>
                                    )
                                )}

                                {deleteAction && (
                                    <button
                                        onClick={deleteAction.onClick}
                                        className="p-3 bg-slate-100 dark:bg-bg-tertiary text-slate-600 dark:text-text-secondary rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        title="Excluir"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* List View */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h2
                                className="text-lg font-bold text-slate-900 dark:text-white flex-1"
                                dangerouslySetInnerHTML={{ __html: title }}
                            />
                            <div className="flex gap-2">
                                {badges.map((badge, i) => (
                                    <span
                                        key={i}
                                        className={`px-2 py-1 rounded text-xs font-medium ${getBadgeStyles(
                                            badge.variant,
                                        )}`}
                                    >
                                        {badge.text}
                                    </span>
                                ))}
                            </div>
                        </div>
                        {subtitle && (
                            <div className="text-xs text-slate-500 dark:text-text-tertiary">
                                {subtitle}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                        <Link
                            href={mainAction.href}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all font-medium text-sm"
                        >
                            {mainAction.label}
                        </Link>

                        {showActions && (
                            <>
                                {editAction && (
                                    editAction.href ? (
                                        <Link
                                            href={editAction.href}
                                            className="p-2 bg-slate-100 dark:bg-bg-tertiary text-slate-600 dark:text-text-secondary rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            title="Editar"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                />
                                            </svg>
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={editAction.onClick}
                                            className="p-2 bg-slate-100 dark:bg-bg-tertiary text-slate-600 dark:text-text-secondary rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            title="Editar"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                                />
                                            </svg>
                                        </button>
                                    )
                                )}

                                {deleteAction && (
                                    <button
                                        onClick={deleteAction.onClick}
                                        className="p-2 bg-slate-100 dark:bg-bg-tertiary text-slate-600 dark:text-text-secondary rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        title="Excluir"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </motion.div>
    );
}
