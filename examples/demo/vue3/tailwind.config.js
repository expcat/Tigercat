/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',

    // Scan workspace packages so Tailwind generates component styles.
    '../../../packages/vue/src/**/*.{vue,js,ts,jsx,tsx}',
    '../../../packages/vue/dist/**/*.{js,mjs,cjs}',
    '../../../packages/core/src/**/*.{js,ts}',
    '../../../packages/core/dist/**/*.{js,mjs,cjs}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
