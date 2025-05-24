"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GradientButtonProps {
  href?: string;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function GradientButton({ 
  href, 
  children, 
  className = "", 
  type = "button",
  onClick,
  disabled = false,
  loading = false
}: GradientButtonProps) {
  const baseClasses = `
    group relative overflow-hidden
    px-8 py-4 rounded-xl
    bg-gradient-to-r from-indigo-500 to-purple-600
    dark:from-indigo-400 dark:to-purple-500
    hover:from-indigo-600 hover:to-purple-700
    dark:hover:from-indigo-300 dark:hover:to-purple-400
    transition-all duration-300 ease-out
    text-lg font-semibold
    inline-flex items-center justify-center
    shadow-lg hover:shadow-2xl hover:shadow-purple-500/25
    text-white
    before:absolute before:inset-0
    before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0
    before:translate-x-[-100%] before:skew-x-12
    hover:before:translate-x-[100%] before:transition-transform before:duration-700
    after:absolute after:inset-0
    after:bg-gradient-to-r after:from-white/0 after:via-white/5 after:to-white/0
    after:translate-x-[100%] after:skew-x-12
    hover:after:translate-x-[-100%] after:transition-transform after:duration-700
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
    ${className}
  `;

  if (href) {
    return (
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        className="inline-block"
      >
        <Link href={href} className={baseClasses}>
          <motion.span 
            className="relative z-10 drop-shadow-sm flex items-center gap-2 group-hover:gap-3 transition-all duration-300"
            whileHover={{ scale: disabled ? 1 : 1.02 }}
          >
            {children}
          </motion.span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      className={baseClasses}
    >
      <motion.span 
        className="relative z-10 drop-shadow-sm flex items-center gap-2 group-hover:gap-3 transition-all duration-300"
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Carregando...
          </>
        ) : (
          children
        )}
      </motion.span>
    </motion.button>
  );
}