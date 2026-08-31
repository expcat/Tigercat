/**
 * Image component types and interfaces
 */

import type { TigerLocale } from './locale'

/**
 * Image object-fit types
 */
export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

/**
 * How the image preview is triggered.
 * - `click`: opens the full-screen preview viewer on click (default).
 * - `hover`: shows an enlarged floating preview overlay on hover.
 */
export type ImagePreviewTrigger = 'click' | 'hover'

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
 * One gallery entry in a fullscreen lightbox.
 * A string is the image URL; an object may carry a per-item `alt`.
 * `alt: ''` marks the bitmap decorative (name stays on the dialog).
 */
export type ImageLightboxItem = string | { src: string; alt?: string }

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
   * Whether the image triggers preview
   * @default true
   */
  preview?: boolean

  /**
   * How the preview is triggered when `preview` is enabled.
   * - `click`: full-screen viewer on click (default).
   * - `hover`: enlarged floating overlay on hover.
   * @default 'click'
   */
  previewTrigger?: ImagePreviewTrigger

  /**
   * Whether to lazy load the image using IntersectionObserver
   * @default false
   */
  lazy?: boolean

  /**
   * Responsive image candidates. Lands on the inner `<img>`, not the host.
   */
  srcSet?: string

  /**
   * Sizes hint for `srcSet`. Lands on the inner `<img>`.
   */
  sizes?: string

  /**
   * CORS mode for the inner `<img>`.
   */
  crossOrigin?: '' | 'anonymous' | 'use-credentials'

  /**
   * Decode hint for the inner `<img>`.
   */
  decoding?: 'async' | 'auto' | 'sync'

  /**
   * Referrer policy for the inner `<img>`.
   */
  referrerPolicy?: string

  /**
   * Fetch priority for the inner `<img>` (LCP).
   */
  fetchPriority?: 'high' | 'low' | 'auto'

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Shared viewer contract used by image preview surfaces.
 */
export interface ImageViewerBaseProps {
  /**
   * Locale override merged on top of ConfigProvider locale.
   */
  locale?: Partial<TigerLocale>

  /**
   * Whether the preview is open
   * @since 0.9.0
   */
  open?: boolean

  /**
   * Gallery entries to preview. Required; an empty list closes the dialog.
   */
  images: ImageLightboxItem[]

  /**
   * Current image index (for multi-image preview)
   * @default 0
   */
  currentIndex?: number

  /**
   * Whether clicking the mask closes the preview
   * @default true
   */
  maskClosable?: boolean
}

/**
 * ImagePreview component props
 */
export interface ImagePreviewProps extends ImageViewerBaseProps {
  /**
   * Custom z-index for the preview overlay
   * @default OVERLAY_Z_INDEX.modal
   */
  zIndex?: number

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

  /**
   * Whether one-finger horizontal swipes navigate images while the preview is not zoomed in.
   * @default true
   */
  touchSwipeable?: boolean

  /**
   * Minimum horizontal movement in pixels before a one-finger swipe changes images.
   * @default 48
   */
  touchSwipeThreshold?: number

  /**
   * Whether zoom controls (toolbar, wheel, pinch, `+`/`-`) are enabled.
   * @default true
   */
  zoomable?: boolean

  /**
   * Whether rotation controls (toolbar, `[`/`]`) are enabled.
   * @default true
   */
  rotatable?: boolean

  /**
   * Whether previous/next controls and arrow-key navigation are shown.
   * Hidden for a single image. `false` also disables keyboard navigation.
   * @default true
   */
  showNav?: boolean

  /**
   * Whether to show the "n / total" counter (multiple images only).
   * @default true
   */
  showCounter?: boolean

  /**
   * Additional CSS classes on the dialog root.
   */
  className?: string
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

  /**
   * Additional CSS classes. Merged with the group base class.
   */
  className?: string
}

/**
 * ImageCropper component props
 */
export interface ImageCropperProps {
  /**
   * Locale override merged on top of ConfigProvider locale.
   */
  locale?: Partial<TigerLocale>

  /**
   * Image source URL to crop
   */
  src: string

  /**
   * Crop rectangle in display pixels (controlled mode).
   */
  cropRect?: CropRect

  /**
   * Initial crop rectangle (uncontrolled mode). When omitted, a centered
   * rect is computed after the image loads.
   */
  defaultCropRect?: CropRect

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
   * Locale override merged on top of ConfigProvider locale.
   */
  locale?: Partial<TigerLocale>

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
