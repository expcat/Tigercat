import plugin from 'tailwindcss/plugin'

/**
 * Default theme colors for Tigercat
 */
export const tigercatTheme = {
  '--tiger-primary': '#2563eb', // blue-600
  '--tiger-primary-hover': '#1d4ed8', // blue-700
  '--tiger-primary-disabled': '#93c5fd', // blue-300
  '--tiger-secondary': '#6b7280', // gray-500
  '--tiger-secondary-hover': '#374151', // gray-700
  '--tiger-secondary-disabled': '#9ca3af', // gray-400
  '--tiger-outline-bg-hover': '#eff6ff', // blue-50
  '--tiger-ghost-bg-hover': '#eff6ff', // blue-50
  '--tiger-border': '#e5e7eb', // gray-200
  '--tiger-surface': '#ffffff', // white
  '--tiger-surface-muted': '#f3f4f6' // gray-100
}

/**
 * Tailwind CSS plugin for Tigercat
 * Injects the default CSS variables into the root scope
 */
export const tigercatPlugin = plugin(function ({ addBase }) {
  addBase({
    ':root': tigercatTheme
  })
})
