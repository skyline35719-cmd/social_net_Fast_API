/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Шрифт Inter
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // Фирменный цвет (индиго)
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // основной
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      // Мягкие тени для карточек
      boxShadow: {
        'soft': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 0 3px rgba(99, 102, 241, 0.15)',
      },
      // Анимации появления
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}