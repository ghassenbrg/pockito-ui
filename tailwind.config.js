/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      spacing: {
        'safe-bottom': 'calc(1rem + var(--safe-area-inset-bottom))',
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
        '26': '6.5rem', // 104px
        '30': '7.5rem', // 120px
        '34': '8.5rem', // 136px
      },
      padding: {
        'safe-bottom': 'calc(1rem + var(--safe-area-inset-bottom))',
      }
    },
  },
  plugins: [],
};
