/**
 * Theme configuration types for Tigercat Design System
 *
 * Three-level structure:
 *  - ThemeColorScale: primitive color palette (50–950 shades)
 *  - ThemeSemanticColors: semantic mappings (primary, surface, text, border, status)
 *  - ThemeConfig: full configuration (colors + typography + radius + shadows + spacing)
 *
 * @module types/theme
 * @since 0.7.0
 */

// ---------------------------------------------------------------------------
// Color primitives
// ---------------------------------------------------------------------------

/**
 * A 10-step color shade scale (Tailwind-compatible).
 * Shade 900 is optional since tokens.json uses 950 only.
 */
export interface ThemeColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900?: string
  950: string
}

// ---------------------------------------------------------------------------
// Semantic colors
// ---------------------------------------------------------------------------

/** Colors for a single interactive/status hue (light **and** dark) */
export interface ThemeSemanticColors {
  /** Core interactive colors */
  primary: string
  primaryHover: string
  primaryActive: string
  primaryDisabled: string

  secondary: string
  secondaryHover: string
  secondaryActive: string
  secondaryDisabled: string

  /** Button-specific hover backgrounds */
  outlineBgHover: string
  ghostBgHover: string

  /** Focus ring color */
  focusRing: string

  /** Surface / background */
  surface: string
  surfaceMuted: string
  surfaceRaised: string

  /** Text */
  text: string
  textSecondary: string
  textDisabled: string

  /** Border */
  border: string
  borderStrong: string

  /** Status (semantic) */
  success: string
  warning: string
  error: string
  info: string

  /** Chart palette (6 colors) */
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
  chart6: string
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export interface ThemeTypography {
  fontFamily: string
  fontFamilyMono: string
  fontSizeBase: string
  fontSizeSm: string
  fontSizeLg: string
  fontWeightNormal: string
  fontWeightMedium: string
  fontWeightSemibold: string
  fontWeightBold: string
  lineHeightNormal: string
  lineHeightTight: string
}

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------

export interface ThemeRadius {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  full: string
}

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

export interface ThemeShadows {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
}

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
}

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

export interface ThemeMotion {
  durationFast: string
  durationBase: string
  durationSlow: string
  easing: string
}

// ---------------------------------------------------------------------------
// Full theme config
// ---------------------------------------------------------------------------

/**
 * Complete theme configuration.
 * All sections are optional — missing values fall back to the default theme.
 */
export interface ThemeConfig {
  colors?: Partial<ThemeSemanticColors>
  typography?: Partial<ThemeTypography>
  radius?: Partial<ThemeRadius>
  shadows?: Partial<ThemeShadows>
  spacing?: Partial<ThemeSpacing>
  motion?: Partial<ThemeMotion>
}

// ---------------------------------------------------------------------------
// Theme preset
// ---------------------------------------------------------------------------

/** Name of a built-in preset theme */
export type ThemePresetName =
  | 'default'
  | 'vibrant'
  | 'professional'
  | 'minimal'
  | 'natural'
  | 'modern'

/**
 * A fully defined preset theme.
 * Both `light` and `dark` are required; they will be merged with defaults at runtime.
 */
export interface ThemePreset {
  name: ThemePresetName | string
  label: string
  light: ThemeConfig
  dark: ThemeConfig
}

// ---------------------------------------------------------------------------
// Color scheme
// ---------------------------------------------------------------------------

/** Controls which colour scheme the ThemeManager applies */
export type ColorScheme = 'light' | 'dark' | 'auto'
