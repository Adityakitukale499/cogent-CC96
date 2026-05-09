/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#dbe7ff',
          200: '#bcd1ff',
          300: '#8eb1ff',
          400: '#5a85ff',
          500: '#3361f5',
          600: '#1f44dd',
          700: '#1a36b5',
          800: '#1a3092',
          900: '#1c2d75',
        },
        accent: {
          500: '#ff6b35',
          600: '#e85a25',
        },
      },
      boxShadow: {
        soft: '0 8px 24px rgba(15, 30, 80, 0.08)',
        card: '0 12px 32px rgba(15, 30, 80, 0.10)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
