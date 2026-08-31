import React from 'react'
import {
  resolveLightboxScaleRange,
  type ImageViewerProps as CoreImageViewerProps
} from '@expcat/tigercat-core'
import { ImagePreview, type ImagePreviewProps } from './ImagePreview'

export interface ImageViewerProps extends CoreImageViewerProps {
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  onCurrentIndexChange?: (index: number) => void
  onScaleChange?: (scale: number) => void
}

/**
 * Configuration alias of ImagePreview. Same dialog tree; `minZoom`/`maxZoom`
 * map onto `minScale`/`maxScale`.
 */
export const ImageViewer: React.FC<ImageViewerProps> = ({
  minZoom,
  maxZoom,
  minScale,
  maxScale,
  onOpenChange,
  onClose,
  onCurrentIndexChange,
  onScaleChange,
  ...rest
}) => {
  const scaleRange = resolveLightboxScaleRange({ minScale, maxScale, minZoom, maxZoom })

  const handleOpenChange = (next: boolean) => {
    onOpenChange?.(next)
    if (!next) onClose?.()
  }

  return (
    <ImagePreview
      {...(rest as ImagePreviewProps)}
      minScale={scaleRange.minScale}
      maxScale={scaleRange.maxScale}
      onOpenChange={handleOpenChange}
      onCurrentIndexChange={onCurrentIndexChange}
      onScaleChange={onScaleChange}
    />
  )
}
