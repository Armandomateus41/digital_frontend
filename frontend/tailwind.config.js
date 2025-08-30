/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#030213',
          foreground: '#ffffff',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontSize: {
        'base': '14px',
      },
      fontWeight: {
        'medium': '500',
        'normal': '400',
      },
      borderRadius: {
        'DEFAULT': '0.625rem', // 10px
      },
      boxShadow: {
        'glow': '0 0 20px rgba(3, 2, 19, 0.1)',
      }
    },
  },
  plugins: [],
}

