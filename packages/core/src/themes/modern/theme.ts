import type { ThemePreset } from '../../types/theme'

/**
 * Modern theme — opt-in visual refresh.
 *
 * Pairs the default color palette with rounder corners, layered shadows
 * and refined motion easings. Activates the "modern" token layer when
 * combined with `createTigercatPlugin({ modern: true })` or by setting
 * `data-tiger-style="modern"` on `<html>`.
 *
 * @since 1.1.0
 */
export const modernTheme: ThemePreset = {
  name: 'modern',
  label: 'Modern',
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
      surfaceMuted: '#f8fafc',
      surfaceRaised: '#ffffff',
      text: '#0f172a',
      textSecondary: '#475569',
      textDisabled: '#cbd5e1',
      border: '#e2e8f0',
      borderStrong: '#94a3b8',
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0ea5e9',
      chart1: '#2563eb',
      chart2: '#16a34a',
      chart3: '#d97706',
      chart4: '#a855f7',
      chart5: '#0ea5e9',
      chart6: '#ef4444'
    },
    radius: { none: '0', sm: '8px', md: '12px', lg: '16px', xl: '20px', full: '9999px' },
    shadows: {
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
      md: '0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -1px rgb(0 0 0 / 0.04)',
      lg: '0 12px 24px -4px rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.04)',
      xl: '0 24px 48px -8px rgb(0 0 0 / 0.1), 0 8px 16px -4px rgb(0 0 0 / 0.05)'
    },
    motion: {
      durationFast: '150ms',
      durationBase: '200ms',
      durationSlow: '300ms',
      easing: 'cubic-bezier(0.2, 0, 0, 1)'
    }
  },
  dark: {
    colors: {
      primary: '#60a5fa',
      primaryHover: '#93c5fd',
      primaryActive: '#bfdbfe',
      primaryDisabled: '#1e40af',
      secondary: '#94a3b8',
      secondaryHover: '#cbd5e1',
      secondaryActive: '#e2e8f0',
      secondaryDisabled: '#475569',
      outlineBgHover: '#1e3a5f',
      ghostBgHover: '#1e3a5f',
      focusRing: '#60a5fa',
      surface: '#0f172a',
      surfaceMuted: '#1e293b',
      surfaceRaised: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textDisabled: '#475569',
      border: '#334155',
      borderStrong: '#64748b',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#38bdf8',
      chart1: '#60a5fa',
      chart2: '#4ade80',
      chart3: '#fbbf24',
      chart4: '#c084fc',
      chart5: '#38bdf8',
      chart6: '#f87171'
    },
    shadows: {
      xs: '0 1px 2px 0 rgb(2 6 23 / 0.4)',
      sm: '0 1px 2px 0 rgb(2 6 23 / 0.5)',
      md: '0 4px 8px -2px rgb(2 6 23 / 0.55), 0 2px 4px -1px rgb(2 6 23 / 0.4)',
      lg: '0 12px 24px -4px rgb(2 6 23 / 0.55), 0 4px 8px -2px rgb(2 6 23 / 0.4)',
      xl: '0 24px 48px -8px rgb(2 6 23 / 0.6), 0 8px 16px -4px rgb(2 6 23 / 0.45)'
    }
  }
}
