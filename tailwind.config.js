/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E1F5EE',
          100: '#9FE1CB',
          200: '#5DCAA5',
          400: '#1D9E75',
          600: '#0F6E56',
          800: '#085041',
          900: '#04342C',
        },
        accent: {
          50: '#FAEEDA',
          200: '#FAC775',
          400: '#EF9F27',
          600: '#BA7517',
        },
        neutral: {
          50: '#F5F4F0',
          100: '#E8E7E1',
          400: '#8B8A84',
          600: '#6B6B66',
          900: '#1A1A1A',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
