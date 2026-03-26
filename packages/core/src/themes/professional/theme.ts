import type { ThemePreset } from '../../types/theme'

/**
 * Professional theme — corporate & premium, deep gray/blue.
 * Suitable for finance, healthcare, and enterprise portals.
 */
export const professionalTheme: ThemePreset = {
  name: 'professional',
  label: 'Professional',
  light: {
    colors: {
      primary: '#1e40af',
      primaryHover: '#1e3a8a',
      primaryActive: '#172554',
      primaryDisabled: '#93c5fd',
      secondary: '#334155',
      secondaryHover: '#1e293b',
      secondaryActive: '#0f172a',
      secondaryDisabled: '#94a3b8',
      outlineBgHover: '#eff6ff',
      ghostBgHover: '#f1f5f9',
      focusRing: '#1e40af',
      surface: '#ffffff',
      surfaceMuted: '#f8fafc',
      surfaceRaised: '#ffffff',
      text: '#0f172a',
      textSecondary: '#475569',
      textDisabled: '#cbd5e1',
      border: '#e2e8f0',
      borderStrong: '#94a3b8',
      success: '#15803d',
      warning: '#b45309',
      error: '#b91c1c',
      info: '#1d4ed8',
      chart1: '#1e40af',
      chart2: '#15803d',
      chart3: '#b45309',
      chart4: '#7e22ce',
      chart5: '#0e7490',
      chart6: '#b91c1c'
    },
    radius: { sm: '2px', md: '4px', lg: '6px', xl: '8px', none: '0', full: '9999px' },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontFamilyMono: "'JetBrains Mono', 'SF Mono', monospace",
      fontSizeBase: '15px',
      fontSizeSm: '13px',
      fontSizeLg: '17px',
      fontWeightNormal: '400',
      fontWeightMedium: '500',
      fontWeightSemibold: '600',
      fontWeightBold: '700',
      lineHeightNormal: '1.5',
      lineHeightTight: '1.25'
    }
  },
  dark: {
    colors: {
      primary: '#60a5fa',
      primaryHover: '#93c5fd',
      primaryActive: '#bfdbfe',
      primaryDisabled: '#1e3a8a',
      secondary: '#94a3b8',
      secondaryHover: '#cbd5e1',
      secondaryActive: '#e2e8f0',
      secondaryDisabled: '#334155',
      outlineBgHover: '#172554',
      ghostBgHover: '#1e293b',
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
      info: '#60a5fa',
      chart1: '#60a5fa',
      chart2: '#4ade80',
      chart3: '#fbbf24',
      chart4: '#c084fc',
      chart5: '#22d3ee',
      chart6: '#f87171'
    }
  }
}
