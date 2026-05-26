export type ImageAnnotationTool = 'select' | 'rectangle' | 'ellipse' | 'polygon' | 'freehand'

export type ImageAnnotationShape = Exclude<ImageAnnotationTool, 'select'>

export interface ImageAnnotationPoint {
  x: number
  y: number
}

export interface ImageAnnotationBase {
  id: string
  type: ImageAnnotationShape
  label?: string
  color?: string
  data?: Record<string, unknown>
}

export interface ImageAnnotationBox extends ImageAnnotationBase {
  type: 'rectangle' | 'ellipse'
  x: number
  y: number
  width: number
  height: number
}

export interface ImageAnnotationPath extends ImageAnnotationBase {
  type: 'polygon' | 'freehand'
  points: ImageAnnotationPoint[]
}

export type ImageAnnotation = ImageAnnotationBox | ImageAnnotationPath

export interface ImageAnnotationChangeMeta {
  type: 'add' | 'update' | 'remove' | 'select' | 'clear'
  annotation?: ImageAnnotation
}

export interface ImageAnnotationProps {
  src: string
  alt?: string
  value?: ImageAnnotation[]
  defaultValue?: ImageAnnotation[]
  selectedId?: string
  defaultSelectedId?: string
  tool?: ImageAnnotationTool
  defaultTool?: ImageAnnotationTool
  tools?: ImageAnnotationTool[]
  disabled?: boolean
  readonly?: boolean
  minSize?: number
  strokeWidth?: number
  showLabels?: boolean
  className?: string
}
