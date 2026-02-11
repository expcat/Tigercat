/**
 * Image component types and interfaces
 */

/**
 * Image object-fit types
 */
export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

/**
 * Crop rectangle describing the cropped area
 */
export interface CropRect {
  /** X offset from left edge */
  x: number
  /** Y offset from top edge */
  y: number
  /** Width of the crop area */
  width: number
  /** Height of the crop area */
  height: number
}

/**
 * Result returned by the cropper after cropping
 */
export interface CropResult {
  /** The canvas element with the cropped image */
  canvas: HTMLCanvasElement
  /** Blob of the cropped image */
  blob: Blob
  /** Data URL of the cropped image */
  dataUrl: string
  /** The crop rectangle used */
  cropRect: CropRect
}

/**
 * Resize handle direction for cropper
 */
export type CropHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

/**
 * Image preview toolbar action types
 */
export type ImagePreviewToolbarAction = 'zoomIn' | 'zoomOut' | 'reset' | 'prev' | 'next' | 'close'

/**
 * Navigation state for preview with multiple images
 */
export interface PreviewNavState {
  hasPrev: boolean
  hasNext: boolean
  counter: string
}

/**
 * Base Image component props
 */
export interface ImageProps {
  /**
   * Image source URL
   */
  src?: string

  /**
   * Alternative text for image
   */
  alt?: string

  /**
   * Image width (CSS value)
   */
  width?: number | string

  /**
   * Image height (CSS value)
   */
  height?: number | string

  /**
   * Object-fit behavior for the image
   * @default 'cover'
   */
  fit?: ImageFit

  /**
   * Fallback image source when loading fails
   */
  fallbackSrc?: string

  /**
   * Whether clicking the image triggers preview
   * @default true
   */
  preview?: boolean

  /**
   * Whether to lazy load the image using IntersectionObserver
   * @default false
   */
  lazy?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * ImagePreview component props
 */
export interface ImagePreviewProps {
  /**
   * Whether the preview is visible
   */
  visible: boolean

  /**
   * Array of image URLs to preview
   */
  images: string[]

  /**
   * Current image index (for multi-image preview)
   * @default 0
   */
  currentIndex?: number

  /**
   * Custom z-index for the preview overlay
   * @default 1050
   */
  zIndex?: number

  /**
   * Whether clicking the mask closes the preview
   * @default true
   */
  maskClosable?: boolean

  /**
   * Scale step for zoom in/out
   * @default 0.5
   */
  scaleStep?: number

  /**
   * Minimum scale factor
   * @default 0.25
   */
  minScale?: number

  /**
   * Maximum scale factor
   * @default 5
   */
  maxScale?: number
}

/**
 * ImageGroup component props
 */
export interface ImageGroupProps {
  /**
   * Whether to enable preview for all child images
   * @default true
   */
  preview?: boolean
}

/**
 * ImageCropper component props
 */
export interface ImageCropperProps {
  /**
   * Image source URL to crop
   */
  src: string

  /**
   * Fixed aspect ratio (width / height). Leave undefined for free cropping.
   * @example 1 for square, 16/9 for widescreen
   */
  aspectRatio?: number

  /**
   * Minimum crop width in pixels
   * @default 20
   */
  minWidth?: number

  /**
   * Minimum crop height in pixels
   * @default 20
   */
  minHeight?: number

  /**
   * Output image MIME type
   * @default 'image/png'
   */
  outputType?: 'image/png' | 'image/jpeg' | 'image/webp'

  /**
   * Output image quality (0-1, only for jpeg/webp)
   * @default 0.92
   */
  quality?: number

  /**
   * Whether to show crop guide lines (rule of thirds)
   * @default true
   */
  guides?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * CropUpload component props
 */
export interface CropUploadProps {
  /**
   * Accepted file types
   * @default 'image/*'
   */
  accept?: string

  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Maximum file size in bytes
   */
  maxSize?: number

  /**
   * Props to pass to the internal ImageCropper
   */
  cropperProps?: Partial<Omit<ImageCropperProps, 'src'>>

  /**
   * Title for the crop modal
   * @default '裁剪图片'
   */
  modalTitle?: string

  /**
   * Width of the crop modal
   * @default 520
   */
  modalWidth?: number

  /**
   * Additional CSS classes
   */
  className?: string
}
