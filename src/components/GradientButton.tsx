"use client";

import Link from "next/link";
import { ReactNode } from "react";

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
    px-8 py-4 rounded-xl
    bg-gradient-to-r from-indigo-500 to-purple-600
    dark:from-indigo-400 dark:to-purple-500
    hover:from-indigo-600 hover:to-purple-700
    dark:hover:from-indigo-300 dark:hover:to-purple-400
    transition-colors duration-200
    text-lg font-semibold
    inline-flex items-center justify-center
    shadow-lg
    text-white
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        <span className="flex items-center gap-2">
          {children}
        </span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
    >
      <span className="flex items-center gap-2">
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
      </span>
    </button>
  );
}
