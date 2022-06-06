module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './common/**/*.{js,ts,jsx,tsx}',
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
  },
  plugins: [],
}
