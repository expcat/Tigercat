import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  classNames,
  imagePreviewMaskClasses,
  imagePreviewWrapperClasses,
  imagePreviewImgClasses,
  imagePreviewToolbarClasses,
  imagePreviewToolbarBtnClasses,
  imagePreviewNavBtnClasses,
  imagePreviewCloseBtnClasses,
  imagePreviewCounterClasses,
  zoomInIconPath,
  zoomOutIconPath,
  resetIconPath,
  prevIconPath,
  nextIconPath,
  previewCloseIconPath,
  clampScale,
  calculateTransform,
  getPreviewNavState,
  type ImagePreviewProps as CoreImagePreviewProps
} from '@expcat/tigercat-core'
import { useEscapeKey } from '../utils/overlay'

export interface ImagePreviewProps extends CoreImagePreviewProps {
  /**
   * Callback when visibility changes
   */
  onVisibleChange?: (visible: boolean) => void
  /**
   * Callback when current index changes
   */
  onCurrentIndexChange?: (index: number) => void
  /**
   * Callback when scale changes
   */
  onScaleChange?: (scale: number) => void
}

const SvgIcon: React.FC<{ d: string; cls?: string }> = ({ d, cls = 'w-5 h-5' }) => (
  <svg
    className={cls}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
)

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  visible,
  images,
  currentIndex = 0,
  zIndex = 1050,
  maskClosable = true,
  scaleStep = 0.5,
  minScale = 0.25,
  maxScale = 5,
  onVisibleChange,
  onCurrentIndexChange,
  onScaleChange
}) => {
  const [scale, setScale] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [index, setIndex] = useState(currentIndex)
  const draggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 })

  const resetTransform = useCallback(() => {
    setScale(1)
    setOffsetX(0)
    setOffsetY(0)
  }, [])

  useEffect(() => {
    setIndex(currentIndex)
    resetTransform()
  }, [currentIndex, resetTransform])

  useEffect(() => {
    if (visible) {
      resetTransform()
      setIndex(currentIndex)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [visible, currentIndex, resetTransform])

  const handleClose = useCallback(() => {
    onVisibleChange?.(false)
  }, [onVisibleChange])

  useEscapeKey({ enabled: !!visible, onEscape: handleClose })

  const navState = useMemo(() => getPreviewNavState(index, images.length), [index, images.length])

  const handleZoomIn = useCallback(() => {
    setScale((s) => {
      const next = clampScale(s + scaleStep, minScale, maxScale)
      onScaleChange?.(next)
      return next
    })
  }, [scaleStep, minScale, maxScale, onScaleChange])

  const handleZoomOut = useCallback(() => {
    setScale((s) => {
      const next = clampScale(s - scaleStep, minScale, maxScale)
      onScaleChange?.(next)
      return next
    })
  }, [scaleStep, minScale, maxScale, onScaleChange])

  const handleReset = useCallback(() => {
    resetTransform()
    onScaleChange?.(1)
  }, [resetTransform, onScaleChange])

  const handlePrev = useCallback(() => {
    if (index > 0) {
      const next = index - 1
      setIndex(next)
      resetTransform()
      onCurrentIndexChange?.(next)
    }
  }, [index, resetTransform, onCurrentIndexChange])

  const handleNext = useCallback(() => {
    if (index < images.length - 1) {
      const next = index + 1
      setIndex(next)
      resetTransform()
      onCurrentIndexChange?.(next)
    }
  }, [index, images.length, resetTransform, onCurrentIndexChange])

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [visible, handlePrev, handleNext])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -scaleStep : scaleStep
      setScale((s) => {
        const next = clampScale(s + delta, minScale, maxScale)
        onScaleChange?.(next)
        return next
      })
    },
    [scaleStep, minScale, maxScale, onScaleChange]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      draggingRef.current = true
      dragStartRef.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY }
    },
    [offsetX, offsetY]
  )

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingRef.current) return
    setOffsetX(dragStartRef.current.ox + (e.clientX - dragStartRef.current.x))
    setOffsetY(dragStartRef.current.oy + (e.clientY - dragStartRef.current.y))
  }, [])

  const handleMouseUp = useCallback(() => {
    draggingRef.current = false
  }, [])

  const handleMaskClick = useCallback(
    (e: React.MouseEvent) => {
      if (maskClosable && e.target === e.currentTarget) {
        handleClose()
      }
    },
    [maskClosable, handleClose]
  )

  const transform = useMemo(
    () => calculateTransform(scale, offsetX, offsetY),
    [scale, offsetX, offsetY]
  )

  if (!visible || !images.length) return null

  const currentSrc = images[index] || images[0]

  return createPortal(
    <div
      className={imagePreviewWrapperClasses}
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={handleMaskClick}
      onWheel={handleWheel}>
      <div className={imagePreviewMaskClasses} aria-hidden="true" />
      <img
        src={currentSrc}
        className={imagePreviewImgClasses}
        style={{ transform }}
        alt={`Preview image ${index + 1}`}
        draggable={false}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <button
        className={imagePreviewCloseBtnClasses}
        onClick={handleClose}
        aria-label="Close preview"
        type="button">
        <SvgIcon d={previewCloseIconPath} />
      </button>
      {images.length > 1 && (
        <button
          className={classNames(imagePreviewNavBtnClasses, 'left-4')}
          onClick={handlePrev}
          disabled={!navState.hasPrev}
          aria-label="Previous image"
          type="button">
          <SvgIcon d={prevIconPath} />
        </button>
      )}
      {images.length > 1 && (
        <button
          className={classNames(imagePreviewNavBtnClasses, 'right-4')}
          onClick={handleNext}
          disabled={!navState.hasNext}
          aria-label="Next image"
          type="button">
          <SvgIcon d={nextIconPath} />
        </button>
      )}
      <div className={imagePreviewToolbarClasses}>
        <button
          className={imagePreviewToolbarBtnClasses}
          onClick={handleZoomOut}
          aria-label="Zoom out"
          type="button">
          <SvgIcon d={zoomOutIconPath} />
        </button>
        <button
          className={imagePreviewToolbarBtnClasses}
          onClick={handleReset}
          aria-label="Reset"
          type="button">
          <SvgIcon d={resetIconPath} />
        </button>
        <button
          className={imagePreviewToolbarBtnClasses}
          onClick={handleZoomIn}
          aria-label="Zoom in"
          type="button">
          <SvgIcon d={zoomInIconPath} />
        </button>
        {navState.counter && <span className={imagePreviewCounterClasses}>{navState.counter}</span>}
      </div>
    </div>,
    document.body
  )
}
