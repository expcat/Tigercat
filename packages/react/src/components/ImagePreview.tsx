import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
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
  imageViewerIcons,
  clampScale,
  calculateTransform,
  getPreviewNavState,
  normalizeRotation,
  createPanState,
  startPan,
  movePan,
  createPinchState,
  startPinch,
  movePinch,
  getImageViewerLabels,
  mergeTigerLocale,
  type ImagePreviewProps as CoreImagePreviewProps
} from '@expcat/tigercat-core'
import { useEscapeKey, renderBodyPortal } from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'

export interface ImagePreviewProps extends CoreImagePreviewProps {
  /**
   * Callback when open state changes
   * @since 0.9.0
   */
  onOpenChange?: (open: boolean) => void

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
  open,
  images,
  currentIndex = 0,
  zIndex = 1050,
  maskClosable = true,
  scaleStep = 0.5,
  minScale = 0.25,
  maxScale = 5,
  touchSwipeable = true,
  touchSwipeThreshold = 48,
  locale,
  onOpenChange,

  onCurrentIndexChange,
  onScaleChange
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(() => getImageViewerLabels(mergedLocale), [mergedLocale])
  const isOpen = open ?? false

  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [index, setIndex] = useState(currentIndex)
  const draggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 })
  const panRef = useRef(createPanState())
  const pinchRef = useRef(createPinchState())
  const touchSwipeRef = useRef({
    isTracking: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  })

  const resetTransform = useCallback(() => {
    setScale(1)
    setRotation(0)
    setOffsetX(0)
    setOffsetY(0)
    panRef.current = createPanState()
    pinchRef.current = createPinchState()
    touchSwipeRef.current.isTracking = false
  }, [])

  useEffect(() => {
    setIndex(currentIndex)
    resetTransform()
  }, [currentIndex, resetTransform])

  useEffect(() => {
    if (isOpen) {
      resetTransform()
      setIndex(currentIndex)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, currentIndex, resetTransform])

  const handleClose = useCallback(() => {
    onOpenChange?.(false)
  }, [onOpenChange])

  useEscapeKey({ enabled: !!isOpen, onEscape: handleClose })

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

  const handleRotateLeft = useCallback(() => {
    setRotation((value) => normalizeRotation(value - 90))
  }, [])

  const handleRotateRight = useCallback(() => {
    setRotation((value) => normalizeRotation(value + 90))
  }, [])

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
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, handlePrev, handleNext])

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

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        touchSwipeRef.current.isTracking = false
        pinchRef.current = startPinch(e.touches[0], e.touches[1], scale)
        return
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0]
        if (touchSwipeable && images.length > 1 && scale === 1) {
          touchSwipeRef.current = {
            isTracking: true,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY
          }
          panRef.current = createPanState()
          return
        }

        touchSwipeRef.current.isTracking = false
        panRef.current = startPan(touch.clientX, touch.clientY, offsetX, offsetY)
      }
    },
    [images.length, offsetX, offsetY, scale, touchSwipeable]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current.isPinching) {
        e.preventDefault()
        const next = movePinch(pinchRef.current, e.touches[0], e.touches[1], minScale, maxScale)
        setScale(next)
        onScaleChange?.(next)
        return
      }

      if (e.touches.length === 1 && panRef.current.isPanning) {
        const next = movePan(panRef.current, e.touches[0].clientX, e.touches[0].clientY)
        setOffsetX(next.translateX)
        setOffsetY(next.translateY)
        return
      }

      if (e.touches.length === 1 && touchSwipeRef.current.isTracking) {
        const touch = e.touches[0]
        touchSwipeRef.current.currentX = touch.clientX
        touchSwipeRef.current.currentY = touch.clientY

        const deltaX = touch.clientX - touchSwipeRef.current.startX
        const deltaY = touch.clientY - touchSwipeRef.current.startY
        if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
          e.preventDefault()
        }
      }
    },
    [maxScale, minScale, onScaleChange]
  )

  const handleTouchEnd = useCallback(
    (e?: React.TouchEvent) => {
      if (touchSwipeRef.current.isTracking) {
        const endedTouch = e?.changedTouches?.[0]
        const currentX = endedTouch?.clientX ?? touchSwipeRef.current.currentX
        const currentY = endedTouch?.clientY ?? touchSwipeRef.current.currentY
        const deltaX = currentX - touchSwipeRef.current.startX
        const deltaY = currentY - touchSwipeRef.current.startY
        const threshold = Math.max(0, touchSwipeThreshold)

        if (Math.abs(deltaX) >= threshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
          if (deltaX < 0) {
            handleNext()
          } else {
            handlePrev()
          }
        }
      }

      touchSwipeRef.current.isTracking = false
      panRef.current = createPanState()
      pinchRef.current = createPinchState()
    },
    [handleNext, handlePrev, touchSwipeThreshold]
  )

  const handleMaskClick = useCallback(
    (e: React.MouseEvent) => {
      if (maskClosable && e.target === e.currentTarget) {
        handleClose()
      }
    },
    [maskClosable, handleClose]
  )

  const transform = useMemo(
    () => `${calculateTransform(scale, offsetX, offsetY)} rotate(${rotation}deg)`,
    [scale, offsetX, offsetY, rotation]
  )

  if (!isOpen || !images.length) return null

  const currentSrc = images[index] || images[0]

  return renderBodyPortal(
    <div
      className={imagePreviewWrapperClasses}
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-label={labels.previewDialogAriaLabel}
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />
      <button
        className={imagePreviewCloseBtnClasses}
        onClick={handleClose}
        aria-label={labels.closePreviewAriaLabel}
        type="button">
        <SvgIcon d={previewCloseIconPath} />
      </button>
      {images.length > 1 && (
        <button
          className={classNames(imagePreviewNavBtnClasses, 'left-4')}
          onClick={handlePrev}
          disabled={!navState.hasPrev}
          aria-label={labels.previousImageAriaLabel}
          type="button">
          <SvgIcon d={prevIconPath} />
        </button>
      )}
      {images.length > 1 && (
        <button
          className={classNames(imagePreviewNavBtnClasses, 'right-4')}
          onClick={handleNext}
          disabled={!navState.hasNext}
          aria-label={labels.nextImageAriaLabel}
          type="button">
          <SvgIcon d={nextIconPath} />
        </button>
      )}
      <div className={imagePreviewToolbarClasses}>
        <button
          className={imagePreviewToolbarBtnClasses}
          onClick={handleZoomOut}
          aria-label={labels.zoomOutAriaLabel}
          type="button">
          <SvgIcon d={zoomOutIconPath} />
        </button>
        <button
          className={imagePreviewToolbarBtnClasses}
          onClick={handleReset}
          aria-label={labels.resetAriaLabel}
          type="button">
          <SvgIcon d={resetIconPath} />
        </button>
        <button
          className={imagePreviewToolbarBtnClasses}
          onClick={handleZoomIn}
          aria-label={labels.zoomInAriaLabel}
          type="button">
          <SvgIcon d={zoomInIconPath} />
        </button>
        <button
          className={imagePreviewToolbarBtnClasses}
          onClick={handleRotateLeft}
          aria-label={labels.rotateLeftAriaLabel}
          type="button">
          <SvgIcon d={imageViewerIcons.rotateLeft} />
        </button>
        <button
          className={imagePreviewToolbarBtnClasses}
          onClick={handleRotateRight}
          aria-label={labels.rotateRightAriaLabel}
          type="button">
          <SvgIcon d={imageViewerIcons.rotateRight} />
        </button>
        {navState.counter && <span className={imagePreviewCounterClasses}>{navState.counter}</span>}
      </div>
    </div>
  )
}
