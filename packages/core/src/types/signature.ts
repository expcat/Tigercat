export type SignatureExportType = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/svg+xml'

export interface SignaturePoint {
  x: number
  y: number
  time?: number
}

export interface SignatureStroke {
  points: SignaturePoint[]
  color: string
  lineWidth: number
}

export interface SignatureChangePayload {
  value: string
  empty: boolean
  strokes: SignatureStroke[]
  exportType: SignatureExportType
}

export interface SignatureProps {
  width?: number
  height?: number
  penColor?: string
  backgroundColor?: string
  lineWidth?: number
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  exportType?: SignatureExportType
  quality?: number
  ariaLabel?: string
  clearText?: string
  className?: string
}
