import type { TigerLocale } from './locale'

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

/**
 * Emitted with `onChange`. Select / deselect goes through `onSelect`.
 * The select tool only selects and deletes — it does not move or resize.
 */
export interface ImageAnnotationChangeMeta {
  type: 'add' | 'remove'
  annotation?: ImageAnnotation
}

export interface ImageAnnotationProps {
  locale?: Partial<TigerLocale>
  src: string
  alt?: string
  value?: ImageAnnotation[]
  defaultValue?: ImageAnnotation[]
  /**
   * Controlled selected id. `undefined` is uncontrolled; `''` is controlled none.
   */
  selectedId?: string
  defaultSelectedId?: string
  tool?: ImageAnnotationTool
  defaultTool?: ImageAnnotationTool
  tools?: ImageAnnotationTool[]
  /**
   * Disables drawing, selection, and tab stops on shapes.
   * `readonly` still allows selection.
   */
  disabled?: boolean
  readonly?: boolean
  minSize?: number
  strokeWidth?: number
  showLabels?: boolean
  className?: string
}
