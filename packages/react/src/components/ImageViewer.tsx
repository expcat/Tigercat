import React, { useState, useCallback, useEffect, useMemo } from 'react'
import {
  classNames,
  imageViewerBackdropClasses,
  imageViewerImgClasses,
  imageViewerToolbarClasses,
  imageViewerToolbarBtnClasses,
  imageViewerNavBtnClasses,
  imageViewerCloseBtnClasses,
  imageViewerCounterClasses,
  imageViewerIcons,
  clampZoom,
  normalizeRotation
} from '@expcat/tigercat-core'

export interface ImageViewerProps {
  images: string[]
  open?: boolean
  currentIndex?: number
  zoomable?: boolean
  rotatable?: boolean
  showNav?: boolean
  showCounter?: boolean
  maskClosable?: boolean
  minZoom?: number
  maxZoom?: number
  className?: string
  onClose?: () => void
  onIndexChange?: (index: number) => void
}

function SvgIcon({ pathD, label }: { pathD: string; label: string }) {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={label}>
      <path d={pathD} />
    </svg>
  )
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  images,
  open = false,
  currentIndex = 0,
  zoomable = true,
  rotatable = true,
  showNav = true,
  showCounter = true,
  maskClosable = true,
  minZoom = 0.5,
  maxZoom = 3,
  className,
  onClose,
  onIndexChange
}) => {
  const [index, setIndex] = useState(currentIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    setIndex(currentIndex)
  }, [currentIndex])

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  const handlePrev = useCallback(() => {
    const newIndex = (index - 1 + images.length) % images.length
    setIndex(newIndex)
    setZoom(1)
    setRotation(0)
    onIndexChange?.(newIndex)
  }, [index, images.length, onIndexChange])

  const handleNext = useCallback(() => {
    const newIndex = (index + 1) % images.length
    setIndex(newIndex)
    setZoom(1)
    setRotation(0)
    onIndexChange?.(newIndex)
  }, [index, images.length, onIndexChange])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose()
          break
        case 'ArrowLeft':
          handlePrev()
          break
        case 'ArrowRight':
          handleNext()
          break
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, handleClose, handlePrev, handleNext])

  const backdropClasses = useMemo(
    () => classNames(imageViewerBackdropClasses, className),
    [className]
  )

  if (!open || images.length === 0) return null

  return (
    <div
      className={backdropClasses}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={(e) => {
        if (maskClosable && e.target === e.currentTarget) handleClose()
      }}>
      {showCounter && images.length > 1 && (
        <div className={imageViewerCounterClasses}>
          {index + 1} / {images.length}
        </div>
      )}

      <button
        className={imageViewerCloseBtnClasses}
        onClick={handleClose}
        aria-label="Close"
        type="button">
        <SvgIcon pathD={imageViewerIcons.close} label="Close" />
      </button>

      {showNav && images.length > 1 && (
        <>
          <button
            className={classNames(imageViewerNavBtnClasses, 'left-4')}
            onClick={handlePrev}
            aria-label="Previous image"
            type="button">
            <SvgIcon pathD={imageViewerIcons.prev} label="Previous" />
          </button>
          <button
            className={classNames(imageViewerNavBtnClasses, 'right-4')}
            onClick={handleNext}
            aria-label="Next image"
            type="button">
            <SvgIcon pathD={imageViewerIcons.next} label="Next" />
          </button>
        </>
      )}

      <img
        className={imageViewerImgClasses}
        src={images[index]}
        alt={`Image ${index + 1}`}
        style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
        draggable={false}
      />

      {(zoomable || rotatable) && (
        <div className={imageViewerToolbarClasses}>
          {zoomable && (
            <>
              <button
                className={imageViewerToolbarBtnClasses}
                onClick={() => setZoom(clampZoom(zoom - 0.25, minZoom, maxZoom))}
                aria-label="Zoom out"
                type="button">
                <SvgIcon pathD={imageViewerIcons.zoomOut} label="Zoom out" />
              </button>
              <button
                className={imageViewerToolbarBtnClasses}
                onClick={() => setZoom(clampZoom(zoom + 0.25, minZoom, maxZoom))}
                aria-label="Zoom in"
                type="button">
                <SvgIcon pathD={imageViewerIcons.zoomIn} label="Zoom in" />
              </button>
            </>
          )}
          {rotatable && (
            <>
              <button
                className={imageViewerToolbarBtnClasses}
                onClick={() => setRotation(normalizeRotation(rotation - 90))}
                aria-label="Rotate left"
                type="button">
                <SvgIcon pathD={imageViewerIcons.rotateLeft} label="Rotate left" />
              </button>
              <button
                className={imageViewerToolbarBtnClasses}
                onClick={() => setRotation(normalizeRotation(rotation + 90))}
                aria-label="Rotate right"
                type="button">
                <SvgIcon pathD={imageViewerIcons.rotateRight} label="Rotate right" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
