module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './common/**/*.{js,ts,jsx,tsx}',
    './honeyland/**/*.{js,ts,jsx,tsx}',
    './rental-components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    /* #honeyland: change container size */
    container: {
      center: true,
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1170px',
      },
    },
    extend: {
      backgroundColor: '#000000',
      colors: {
        primary: '#F2A93C',
        'primary-hover': '#b77f2b',
        'primary-light': 'rgba(200, 138, 244, 0.12)',
        'primary-2': '#CE81F4',
        border: 'rgba(221, 218, 218, 0.2)',
        secondary: '#7EFFE8',
        blue: '#49DEFF',
        'blue-500': 'rgb(59 130 246)',
        accent: '#CE81F4',
        glow: '#F2A93C',
        accent: '#FFA500',
        'light-0': '#FFFFFF',
        'light-1': '#F0F1F3',
        'light-2': '#B1AFBB',
        'light-4': '#697b89',
        'medium-3': '#8D8B9B',
        'medium-4': '#6D6C7C',
        'dark-3': '#333333',
        'dark-4': '#161616',
        'dark-5': '#0B0B0B',
        'dark-6': '#000000',
        twitter: '#1DA1F2',
      },
    },
  },
  plugins: [],
}
