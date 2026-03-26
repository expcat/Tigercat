import type { ThemePreset } from '../../types/theme'

/**
 * Minimal theme — minimalist aesthetic, black/white/gray high-contrast.
 * Suitable for design tools, dev tools, and creative applications.
 */
export const minimalTheme: ThemePreset = {
  name: 'minimal',
  label: 'Minimal',
  light: {
    colors: {
      primary: '#18181b',
      primaryHover: '#09090b',
      primaryActive: '#000000',
      primaryDisabled: '#a1a1aa',
      secondary: '#52525b',
      secondaryHover: '#3f3f46',
      secondaryActive: '#27272a',
      secondaryDisabled: '#a1a1aa',
      outlineBgHover: '#fafafa',
      ghostBgHover: '#f4f4f5',
      focusRing: '#18181b',
      surface: '#ffffff',
      surfaceMuted: '#fafafa',
      surfaceRaised: '#ffffff',
      text: '#09090b',
      textSecondary: '#71717a',
      textDisabled: '#d4d4d8',
      border: '#e4e4e7',
      borderStrong: '#a1a1aa',
      success: '#16a34a',
      warning: '#ca8a04',
      error: '#dc2626',
      info: '#18181b',
      chart1: '#18181b',
      chart2: '#71717a',
      chart3: '#a1a1aa',
      chart4: '#d4d4d8',
      chart5: '#3f3f46',
      chart6: '#52525b'
    },
    radius: { sm: '0', md: '2px', lg: '4px', xl: '6px', none: '0', full: '9999px' },
    shadows: {
      xs: '0 1px 2px 0 rgba(0,0,0,0.03)',
      sm: '0 1px 2px 0 rgba(0,0,0,0.06)',
      md: '0 2px 4px -1px rgba(0,0,0,0.06)',
      lg: '0 4px 6px -2px rgba(0,0,0,0.06)',
      xl: '0 8px 16px -4px rgba(0,0,0,0.08)'
    }
  },
  dark: {
    colors: {
      primary: '#fafafa',
      primaryHover: '#e4e4e7',
      primaryActive: '#d4d4d8',
      primaryDisabled: '#3f3f46',
      secondary: '#a1a1aa',
      secondaryHover: '#d4d4d8',
      secondaryActive: '#e4e4e7',
      secondaryDisabled: '#3f3f46',
      outlineBgHover: '#27272a',
      ghostBgHover: '#27272a',
      focusRing: '#fafafa',
      surface: '#09090b',
      surfaceMuted: '#18181b',
      surfaceRaised: '#27272a',
      text: '#fafafa',
      textSecondary: '#a1a1aa',
      textDisabled: '#3f3f46',
      border: '#27272a',
      borderStrong: '#52525b',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#fafafa',
      chart1: '#fafafa',
      chart2: '#a1a1aa',
      chart3: '#71717a',
      chart4: '#52525b',
      chart5: '#d4d4d8',
      chart6: '#e4e4e7'
    },
    shadows: {
      xs: '0 1px 2px 0 rgba(0,0,0,0.3)',
      sm: '0 1px 2px 0 rgba(0,0,0,0.4)',
      md: '0 2px 4px -1px rgba(0,0,0,0.4)',
      lg: '0 4px 6px -2px rgba(0,0,0,0.4)',
      xl: '0 8px 16px -4px rgba(0,0,0,0.5)'
    }
  }
}
