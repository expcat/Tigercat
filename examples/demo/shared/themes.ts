// Shared theme configuration for both Vue3 and React demos
export interface ThemeColors {
  primary: string
  primaryHover: string
  primaryDisabled: string
  secondary: string
  secondaryHover: string
  secondaryDisabled: string
}

export interface Theme {
  name: string
  value: string
  colors: ThemeColors
}

export const themes: Theme[] = [
  {
    name: '默认蓝色',
    value: 'default',
    colors: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      primaryDisabled: '#93c5fd',
      secondary: '#4b5563',
      secondaryHover: '#374151',
      secondaryDisabled: '#9ca3af',
    }
  },
  {
    name: '绿色主题',
    value: 'green',
    colors: {
      primary: '#10b981',
      primaryHover: '#059669',
      primaryDisabled: '#6ee7b7',
      secondary: '#059669',
      secondaryHover: '#047857',
      secondaryDisabled: '#6ee7b7',
    }
  },
  {
    name: '紫色主题',
    value: 'purple',
    colors: {
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      primaryDisabled: '#c4b5fd',
      secondary: '#7c3aed',
      secondaryHover: '#6d28d9',
      secondaryDisabled: '#c4b5fd',
    }
  },
  {
    name: '橙色主题',
    value: 'orange',
    colors: {
      primary: '#f59e0b',
      primaryHover: '#d97706',
      primaryDisabled: '#fcd34d',
      secondary: '#d97706',
      secondaryHover: '#b45309',
      secondaryDisabled: '#fcd34d',
    }
  },
  {
    name: '粉色主题',
    value: 'pink',
    colors: {
      primary: '#ec4899',
      primaryHover: '#db2777',
      primaryDisabled: '#f9a8d4',
      secondary: '#db2777',
      secondaryHover: '#be185d',
      secondaryDisabled: '#f9a8d4',
    }
  }
]

// Utility to convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Apply theme to document
export const applyTheme = (themeValue: string) => {
  const theme = themes.find(t => t.value === themeValue)
  if (!theme) return

  const root = document.documentElement
  root.style.setProperty('--tiger-primary', theme.colors.primary)
  root.style.setProperty('--tiger-primary-hover', theme.colors.primaryHover)
  root.style.setProperty('--tiger-primary-disabled', theme.colors.primaryDisabled)
  root.style.setProperty('--tiger-secondary', theme.colors.secondary)
  root.style.setProperty('--tiger-secondary-hover', theme.colors.secondaryHover)
  root.style.setProperty('--tiger-secondary-disabled', theme.colors.secondaryDisabled)
  
  // Update outline and ghost variants based on primary color
  const primaryRgb = hexToRgb(theme.colors.primary)
  if (primaryRgb) {
    const rgbaValue = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`
    root.style.setProperty('--tiger-outline-bg-hover', rgbaValue)
    root.style.setProperty('--tiger-ghost-bg-hover', rgbaValue)
  }
}
