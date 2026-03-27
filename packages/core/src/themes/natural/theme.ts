import type { ThemePreset } from '../../types/theme'

/**
 * Natural theme — warm & friendly, earth tones.
 * Suitable for education, lifestyle, and content management platforms.
 */
export const naturalTheme: ThemePreset = {
  name: 'natural',
  label: 'Natural',
  light: {
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      primaryActive: '#065f46',
      primaryDisabled: '#6ee7b7',
      secondary: '#78716c',
      secondaryHover: '#57534e',
      secondaryActive: '#44403c',
      secondaryDisabled: '#a8a29e',
      outlineBgHover: '#ecfdf5',
      ghostBgHover: '#f5f5f4',
      focusRing: '#059669',
      surface: '#fffbf5',
      surfaceMuted: '#faf5ee',
      surfaceRaised: '#ffffff',
      text: '#1c1917',
      textSecondary: '#57534e',
      textDisabled: '#d6d3d1',
      border: '#e7e5e4',
      borderStrong: '#a8a29e',
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7',
      chart1: '#059669',
      chart2: '#d97706',
      chart3: '#0284c7',
      chart4: '#a16207',
      chart5: '#0d9488',
      chart6: '#be123c'
    },
    radius: { sm: '6px', md: '8px', lg: '12px', xl: '16px', none: '0', full: '9999px' },
    typography: {
      fontFamily: "'Source Sans 3', 'Georgia', -apple-system, sans-serif",
      fontFamilyMono: "'Source Code Pro', 'Menlo', monospace",
      fontSizeBase: '16px',
      fontSizeSm: '14px',
      fontSizeLg: '18px',
      fontWeightNormal: '400',
      fontWeightMedium: '500',
      fontWeightSemibold: '600',
      fontWeightBold: '700',
      lineHeightNormal: '1.6',
      lineHeightTight: '1.3'
    }
  },
  dark: {
    colors: {
      primary: '#34d399',
      primaryHover: '#6ee7b7',
      primaryActive: '#a7f3d0',
      primaryDisabled: '#064e3b',
      secondary: '#a8a29e',
      secondaryHover: '#d6d3d1',
      secondaryActive: '#e7e5e4',
      secondaryDisabled: '#44403c',
      outlineBgHover: '#064e3b',
      ghostBgHover: '#292524',
      focusRing: '#34d399',
      surface: '#1c1917',
      surfaceMuted: '#292524',
      surfaceRaised: '#292524',
      text: '#fafaf9',
      textSecondary: '#d6d3d1',
      textDisabled: '#44403c',
      border: '#44403c',
      borderStrong: '#78716c',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#38bdf8',
      chart1: '#34d399',
      chart2: '#fbbf24',
      chart3: '#38bdf8',
      chart4: '#fcd34d',
      chart5: '#2dd4bf',
      chart6: '#fb7185'
    }
  }
}
