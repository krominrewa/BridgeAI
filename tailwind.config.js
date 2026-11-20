/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8ecdff',
          400: '#5ab2f7',
          500: '#2f92e8',
          600: '#1a73e0',
          700: '#1558bb',
          800: '#164a97',
          900: '#173f79',
        },
        lagoon: {
          50: '#effcf9',
          100: '#c9faf0',
          200: '#96f3e2',
          300: '#5ae6cd',
          400: '#2ecfad',
          500: '#14b495',
          600: '#0d9078',
          700: '#0d7261',
          800: '#0e5a4f',
          900: '#0e4a42',
        },
        ink: {
          DEFAULT: '#0f2338',
          soft: '#3d5670',
          muted: '#54688a',
        },
        paper: '#f5f8fb',
      },
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Hiragino Sans GB"',
          '"Source Han Sans SC"',
          '"Noto Sans SC"',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 10px 30px -14px rgba(15, 35, 56, 0.20)',
        'card-hover': '0 20px 46px -16px rgba(21, 88, 187, 0.32)',
        phone: '0 30px 60px -24px rgba(15, 35, 56, 0.40)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.7)' },
          '70%': { transform: 'scale(1.06)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
        'pop-in': 'pop-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
