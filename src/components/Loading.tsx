'use client';

import { motion } from 'framer-motion';

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loading({ 
  fullScreen = true, 
  text,
  size = 'md',
  className = ''
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const spinner = (
    <div className={`${sizeClasses[size]} border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin`} />
  );

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center ${className}`}
    >
      {spinner}
      {text && (
        <p className={`mt-4 ${textSizeClasses[size]} font-medium text-slate-900 dark:text-white`}>
          {text}
        </p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        {content}
      </div>
    );
  }

  return content;
}

