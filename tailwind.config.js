/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cores customizadas do tema - podem ser referenciadas via CSS variables
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'border-custom': 'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',
        'header-bg': 'var(--color-header-bg)',
        'header-border': 'var(--color-header-border)',
        'footer-bg': 'var(--color-footer-bg)',
        'footer-bg-opacity': 'var(--color-footer-bg-opacity)',
        'footer-border': 'var(--color-footer-border)',
        
        // Cores específicas do projeto
        slate: {
          950: '#0a0e17',
          900: '#111827',
          800: '#1e293b',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        indigo: {
          500: '#6366f1',
          600: '#4f46e5',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 