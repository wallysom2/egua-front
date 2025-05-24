"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GradientButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function GradientButton({ href, children, className = "" }: GradientButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Link 
        href={href}
        className={`
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
          ${className}
        `}
      >
        <motion.span 
          className="relative z-10 drop-shadow-sm flex items-center gap-2 group-hover:gap-3 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
        >
          {children}
        </motion.span>
      </Link>
    </motion.div>
  );
}