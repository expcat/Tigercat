export type ColorSwatchSize = 'sm' | 'md' | 'lg'

export interface ColorSwatchOption {
  value: string
  label?: string
  disabled?: boolean
}

export type ColorSwatchOptionInput = string | ColorSwatchOption

export interface ColorSwatchGroup {
  label?: string
  colors: ColorSwatchOptionInput[]
}

export interface ColorSwatchNormalizedOption extends ColorSwatchOption {
  index: number
  groupIndex: number
}

export interface ColorSwatchNormalizedGroup {
  label?: string
  colors: ColorSwatchNormalizedOption[]
}

export interface ColorSwatchProps {
  disabled?: boolean
  size?: ColorSwatchSize
  colors?: ColorSwatchOptionInput[]
  groups?: ColorSwatchGroup[]
  columns?: number
  ariaLabel?: string
  className?: string
}
