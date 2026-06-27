import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
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
  normalizeRotation,
  createDefaultTransform,
  getImageTransformStyle,
  applyWheelZoom,
  createPanState,
  startPan,
  movePan,
  createPinchState,
  startPinch,
  movePinch,
  getImageViewerLabels,
  mergeTigerLocale,
  type GestureTransform,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface ImageViewerProps {
  locale?: Partial<TigerLocale>
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
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  onCurrentIndexChange?: (index: number) => void
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
  locale,
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
  onOpenChange,
  onClose,
  onCurrentIndexChange
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(() => getImageViewerLabels(mergedLocale), [mergedLocale])
  const [index, setIndex] = useState(currentIndex)
  const [transform, setTransform] = useState<GestureTransform>(createDefaultTransform)
  const panRef = useRef(createPanState())
  const pinchRef = useRef(createPinchState())

  useEffect(() => {
    setIndex(currentIndex)
  }, [currentIndex])

  const resetTransform = useCallback(() => {
    setTransform(createDefaultTransform())
    panRef.current = createPanState()
    pinchRef.current = createPinchState()
  }, [])

  const handleClose = useCallback(() => {
    onOpenChange?.(false)
    onClose?.()
  }, [onOpenChange, onClose])

  const handlePrev = useCallback(() => {
    const newIndex = (index - 1 + images.length) % images.length
    setIndex(newIndex)
    resetTransform()
    onCurrentIndexChange?.(newIndex)
  }, [index, images.length, onCurrentIndexChange, resetTransform])

  const handleNext = useCallback(() => {
    const newIndex = (index + 1) % images.length
    setIndex(newIndex)
    resetTransform()
    onCurrentIndexChange?.(newIndex)
  }, [index, images.length, onCurrentIndexChange, resetTransform])

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
      aria-label={labels.dialogAriaLabel}
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
        aria-label={labels.closeAriaLabel}
        type="button">
        <SvgIcon pathD={imageViewerIcons.close} label={labels.closeAriaLabel} />
      </button>

      {showNav && images.length > 1 && (
        <>
          <button
            className={classNames(imageViewerNavBtnClasses, 'left-4')}
            onClick={handlePrev}
            aria-label={labels.previousImageAriaLabel}
            type="button">
            <SvgIcon pathD={imageViewerIcons.prev} label={labels.previousImageAriaLabel} />
          </button>
          <button
            className={classNames(imageViewerNavBtnClasses, 'right-4')}
            onClick={handleNext}
            aria-label={labels.nextImageAriaLabel}
            type="button">
            <SvgIcon pathD={imageViewerIcons.next} label={labels.nextImageAriaLabel} />
          </button>
        </>
      )}

      <img
        className={imageViewerImgClasses}
        src={images[index]}
        alt={`Image ${index + 1}`}
        style={{ transform: getImageTransformStyle(transform), touchAction: 'none' }}
        draggable={false}
        onWheel={(e) => {
          if (!zoomable) return
          e.preventDefault()
          const newScale = applyWheelZoom(transform.scale, e.deltaY, { minZoom, maxZoom })
          setTransform((t) => ({ ...t, scale: newScale }))
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return
          e.preventDefault()
          panRef.current = startPan(
            e.clientX,
            e.clientY,
            transform.translateX,
            transform.translateY
          )
        }}
        onMouseMove={(e) => {
          if (!panRef.current.isPanning) return
          const result = movePan(panRef.current, e.clientX, e.clientY)
          setTransform((t) => ({ ...t, ...result }))
        }}
        onMouseUp={() => {
          panRef.current = createPanState()
        }}
        onMouseLeave={() => {
          panRef.current = createPanState()
        }}
        onTouchStart={(e) => {
          if (e.touches.length === 2 && zoomable) {
            e.preventDefault()
            pinchRef.current = startPinch(e.touches[0], e.touches[1], transform.scale)
          } else if (e.touches.length === 1) {
            panRef.current = startPan(
              e.touches[0].clientX,
              e.touches[0].clientY,
              transform.translateX,
              transform.translateY
            )
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 2 && pinchRef.current.isPinching) {
            e.preventDefault()
            const newScale = movePinch(
              pinchRef.current,
              e.touches[0],
              e.touches[1],
              minZoom,
              maxZoom
            )
            setTransform((t) => ({ ...t, scale: newScale }))
          } else if (e.touches.length === 1 && panRef.current.isPanning) {
            const result = movePan(panRef.current, e.touches[0].clientX, e.touches[0].clientY)
            setTransform((t) => ({ ...t, ...result }))
          }
        }}
        onTouchEnd={() => {
          pinchRef.current = createPinchState()
          panRef.current = createPanState()
        }}
        onTouchCancel={() => {
          pinchRef.current = createPinchState()
          panRef.current = createPanState()
        }}
      />

      {(zoomable || rotatable) && (
        <div className={imageViewerToolbarClasses}>
          {zoomable && (
            <>
              <button
                className={imageViewerToolbarBtnClasses}
                onClick={() =>
                  setTransform((t) => ({
                    ...t,
                    scale: clampZoom(t.scale - 0.25, minZoom, maxZoom)
                  }))
                }
                aria-label={labels.zoomOutAriaLabel}
                type="button">
                <SvgIcon pathD={imageViewerIcons.zoomOut} label={labels.zoomOutAriaLabel} />
              </button>
              <button
                className={imageViewerToolbarBtnClasses}
                onClick={() =>
                  setTransform((t) => ({
                    ...t,
                    scale: clampZoom(t.scale + 0.25, minZoom, maxZoom)
                  }))
                }
                aria-label={labels.zoomInAriaLabel}
                type="button">
                <SvgIcon pathD={imageViewerIcons.zoomIn} label={labels.zoomInAriaLabel} />
              </button>
            </>
          )}
          {rotatable && (
            <>
              <button
                className={imageViewerToolbarBtnClasses}
                onClick={() =>
                  setTransform((t) => ({ ...t, rotation: normalizeRotation(t.rotation - 90) }))
                }
                aria-label={labels.rotateLeftAriaLabel}
                type="button">
                <SvgIcon pathD={imageViewerIcons.rotateLeft} label={labels.rotateLeftAriaLabel} />
              </button>
              <button
                className={imageViewerToolbarBtnClasses}
                onClick={() =>
                  setTransform((t) => ({ ...t, rotation: normalizeRotation(t.rotation + 90) }))
                }
                aria-label={labels.rotateRightAriaLabel}
                type="button">
                <SvgIcon pathD={imageViewerIcons.rotateRight} label={labels.rotateRightAriaLabel} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
