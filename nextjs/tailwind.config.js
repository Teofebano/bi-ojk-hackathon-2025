module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bi-blue': {
          DEFAULT: '#00529B', // Bank Indonesia blue
          dark: '#003366',
          light: '#0072CE',
        },
        'bi-gray': {
          DEFAULT: '#F5F6FA',
          dark: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [
    function ({ addBase, theme }) {
      addBase({
        'input, textarea': {
          color: theme('colors.black'),
        },
      });
    },
  ],
}; 