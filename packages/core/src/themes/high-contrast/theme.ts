import type { ThemePreset } from '../../types/theme'

/**
 * High Contrast theme — maximum legibility for low-vision and forced-contrast use cases.
 * Uses near-binary surfaces plus saturated accents that pass WCAG AA contrast checks.
 */
export const highContrastTheme: ThemePreset = {
  name: 'high-contrast',
  label: 'High Contrast',
  light: {
    colors: {
      primary: '#0033cc',
      primaryHover: '#002699',
      primaryActive: '#001f80',
      primaryDisabled: '#7f8fcf',
      secondary: '#000000',
      secondaryHover: '#1f1f1f',
      secondaryActive: '#333333',
      secondaryDisabled: '#767676',
      outlineBgHover: '#e6eeff',
      ghostBgHover: '#f2f2f2',
      focusRing: '#000000',
      surface: '#ffffff',
      surfaceMuted: '#f2f2f2',
      surfaceRaised: '#ffffff',
      text: '#000000',
      textSecondary: '#000000',
      textDisabled: '#595959',
      border: '#000000',
      borderStrong: '#000000',
      success: '#006400',
      warning: '#7a4b00',
      error: '#b00020',
      info: '#0033cc',
      chart1: '#0033cc',
      chart2: '#006400',
      chart3: '#7a4b00',
      chart4: '#6b00b9',
      chart5: '#005f73',
      chart6: '#b00020'
    },
    radius: { sm: '2px', md: '4px', lg: '6px', xl: '8px', none: '0', full: '9999px' },
    shadows: {
      xs: '0 0 0 1px #000000',
      sm: '0 0 0 1px #000000',
      md: '0 0 0 2px #000000',
      lg: '0 0 0 2px #000000',
      xl: '0 0 0 3px #000000'
    }
  },
  dark: {
    colors: {
      primary: '#66b2ff',
      primaryHover: '#99ccff',
      primaryActive: '#cce5ff',
      primaryDisabled: '#335c85',
      secondary: '#ffffff',
      secondaryHover: '#e6e6e6',
      secondaryActive: '#cccccc',
      secondaryDisabled: '#8c8c8c',
      outlineBgHover: '#001f3f',
      ghostBgHover: '#1a1a1a',
      focusRing: '#ffff00',
      surface: '#000000',
      surfaceMuted: '#111111',
      surfaceRaised: '#000000',
      text: '#ffffff',
      textSecondary: '#ffffff',
      textDisabled: '#a6a6a6',
      border: '#ffffff',
      borderStrong: '#ffffff',
      success: '#00e676',
      warning: '#ffd54f',
      error: '#ff8a80',
      info: '#80d8ff',
      chart1: '#66b2ff',
      chart2: '#00e676',
      chart3: '#ffd54f',
      chart4: '#d7a5ff',
      chart5: '#80d8ff',
      chart6: '#ff8a80'
    },
    shadows: {
      xs: '0 0 0 1px #ffffff',
      sm: '0 0 0 1px #ffffff',
      md: '0 0 0 2px #ffffff',
      lg: '0 0 0 2px #ffffff',
      xl: '0 0 0 3px #ffffff'
    }
  }
}
