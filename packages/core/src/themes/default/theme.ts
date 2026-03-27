import type { ThemePreset } from '../../types/theme'

/**
 * Default theme — modern & clean, blue-based.
 * Suitable for enterprise apps, SaaS dashboards, and admin panels.
 */
export const defaultTheme: ThemePreset = {
  name: 'default',
  label: 'Default',
  light: {
    colors: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      primaryActive: '#1e40af',
      primaryDisabled: '#93c5fd',
      secondary: '#4b5563',
      secondaryHover: '#374151',
      secondaryActive: '#1f2937',
      secondaryDisabled: '#9ca3af',
      outlineBgHover: '#eff6ff',
      ghostBgHover: '#eff6ff',
      focusRing: '#2563eb',
      surface: '#ffffff',
      surfaceMuted: '#f9fafb',
      surfaceRaised: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      textDisabled: '#d1d5db',
      border: '#e5e7eb',
      borderStrong: '#9ca3af',
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      info: '#3b82f6',
      chart1: '#2563eb',
      chart2: '#16a34a',
      chart3: '#d97706',
      chart4: '#a855f7',
      chart5: '#0ea5e9',
      chart6: '#ef4444'
    },
    radius: { sm: '4px', md: '6px', lg: '10px', xl: '14px', none: '0', full: '9999px' },
    shadows: {
      xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
      sm: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
      md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
      lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
      xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
    }
  },
  dark: {
    colors: {
      primary: '#60a5fa',
      primaryHover: '#93c5fd',
      primaryActive: '#bfdbfe',
      primaryDisabled: '#1e40af',
      secondary: '#9ca3af',
      secondaryHover: '#d1d5db',
      secondaryActive: '#e5e7eb',
      secondaryDisabled: '#4b5563',
      outlineBgHover: '#1e3a5f',
      ghostBgHover: '#1e3a5f',
      focusRing: '#60a5fa',
      surface: '#111827',
      surfaceMuted: '#1f2937',
      surfaceRaised: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      textDisabled: '#4b5563',
      border: '#374151',
      borderStrong: '#6b7280',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      chart1: '#60a5fa',
      chart2: '#4ade80',
      chart3: '#fbbf24',
      chart4: '#c084fc',
      chart5: '#38bdf8',
      chart6: '#f87171'
    },
    shadows: {
      xs: '0 1px 2px 0 rgba(0,0,0,0.2)',
      sm: '0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px -1px rgba(0,0,0,0.25)',
      md: '0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -2px rgba(0,0,0,0.25)',
      lg: '0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -4px rgba(0,0,0,0.25)',
      xl: '0 20px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.25)'
    }
  }
}
