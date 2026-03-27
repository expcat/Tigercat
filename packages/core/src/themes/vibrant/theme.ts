import type { ThemePreset } from '../../types/theme'

/**
 * Vibrant theme — young & energetic, multi-color gradients.
 * Suitable for consumer apps, social media, and content platforms.
 */
export const vibrantTheme: ThemePreset = {
  name: 'vibrant',
  label: 'Vibrant',
  light: {
    colors: {
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      primaryActive: '#6d28d9',
      primaryDisabled: '#c4b5fd',
      secondary: '#ec4899',
      secondaryHover: '#db2777',
      secondaryActive: '#be185d',
      secondaryDisabled: '#f9a8d4',
      outlineBgHover: '#f5f3ff',
      ghostBgHover: '#fdf2f8',
      focusRing: '#8b5cf6',
      surface: '#ffffff',
      surfaceMuted: '#faf5ff',
      surfaceRaised: '#ffffff',
      text: '#1e1b4b',
      textSecondary: '#6b21a8',
      textDisabled: '#c4b5fd',
      border: '#e9d5ff',
      borderStrong: '#a78bfa',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      chart1: '#8b5cf6',
      chart2: '#ec4899',
      chart3: '#f59e0b',
      chart4: '#06b6d4',
      chart5: '#10b981',
      chart6: '#f43f5e'
    },
    radius: { sm: '6px', md: '10px', lg: '14px', xl: '18px', none: '0', full: '9999px' }
  },
  dark: {
    colors: {
      primary: '#a78bfa',
      primaryHover: '#c4b5fd',
      primaryActive: '#ddd6fe',
      primaryDisabled: '#4c1d95',
      secondary: '#f472b6',
      secondaryHover: '#f9a8d4',
      secondaryActive: '#fbcfe8',
      secondaryDisabled: '#831843',
      outlineBgHover: '#2e1065',
      ghostBgHover: '#500724',
      focusRing: '#a78bfa',
      surface: '#0f0a1e',
      surfaceMuted: '#1a1035',
      surfaceRaised: '#231848',
      text: '#f5f3ff',
      textSecondary: '#c4b5fd',
      textDisabled: '#4c1d95',
      border: '#3b2070',
      borderStrong: '#7c3aed',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#22d3ee',
      chart1: '#a78bfa',
      chart2: '#f472b6',
      chart3: '#fbbf24',
      chart4: '#22d3ee',
      chart5: '#34d399',
      chart6: '#fb7185'
    }
  }
}
