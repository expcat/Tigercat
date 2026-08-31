/**
 * ImageViewer component types and interfaces
 * @since 0.9.0
 *
 * ImageViewer is a configuration alias of ImagePreview (one dialog tree).
 * `minZoom` / `maxZoom` map onto `minScale` / `maxScale`.
 */

import type { ImagePreviewProps } from './image'

/**
 * Public ImageViewer surface. Same chrome as ImagePreview.
 */
export interface ImageViewerProps extends ImagePreviewProps {
  /**
   * Alias of `minScale`. Prefer `minScale` on new call sites.
   */
  minZoom?: number

  /**
   * Alias of `maxScale`. Prefer `maxScale` on new call sites.
   */
  maxZoom?: number
}
