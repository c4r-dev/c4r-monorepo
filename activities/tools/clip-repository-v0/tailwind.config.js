/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'ui-violet': '#854ABE',
        'ui-dark': '#171819',
        'ui-card-bg': '#907B9A',
        'ui-gray-1': '#C7C7C7',
        'ui-gray-2': '#828282',
        'ui-gray-3': '#4F4F4F',
        'ui-gray-4': '#404040',
        'ui-orange': '#DD8B3C',
        'ui-dark-orange': '#6E3822',
        'ui-blue': '#00BBFF',
        'ui-violet': '#854ABE',
        'ui-medium-violet': '#532688',
        'ui-dark-violet': '#5A3A69',
        'ui-light-blue-shade': '#D9D9D9',
        'ui-light-blue': '#b0ddff',
        'ui-light-gray': '#D9D9D9',
        'ui-medium-gray': '#282b30',
        'ui-dark-gray': '#1e2124',
      },
    },
  },
  plugins: [],
}
