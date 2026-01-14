/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',

    // Scan workspace packages so Tailwind generates component styles.
    '../../../packages/vue/src/**/*.{vue,js,ts,jsx,tsx}',
    '../../../packages/core/src/**/*.{js,ts}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
