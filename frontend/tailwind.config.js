/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,0.06)',
      },
      colors: {
        brand: { 600: '#2563eb', 700: '#1d4ed8' },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
