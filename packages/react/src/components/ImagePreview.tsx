import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes
} from 'react'
import {
  applyWheelZoom,
  captureActiveElement,
  classNames,
  createDefaultTransform,
  createLightboxGestureSession,
  focusFirst,
  formatLightboxImageAlt,
  getImageTransformStyle,
  getImageViewerLabels,
  getLightboxNavState,
  clampLightboxIndex,
  imagePreviewCloseBtnClasses,
  imagePreviewCounterClasses,
  imagePreviewImgClasses,
  imagePreviewImgMotionClasses,
  imagePreviewMaskClasses,
  imagePreviewNavNextClasses,
  imagePreviewNavPrevClasses,
  imagePreviewToolbarBtnClasses,
  imagePreviewToolbarClasses,
  imagePreviewWrapperClasses,
  imageViewerIcons,
  LIGHTBOX_SCALE_STEP,
  lightboxShouldClose,
  mergeTigerLocale,
  nextIconPath,
  normalizeRotation,
  OVERLAY_Z_INDEX,
  previewCloseIconPath,
  prevIconPath,
  resetIconPath,
  resolveLightboxImages,
  resolveLightboxKeyAction,
  resolveLightboxNavIndex,
  resolveLightboxScaleRange,
  restoreFocus,
  zoomInIconPath,
  zoomOutIconPath,
  type GestureTransform,
  type ImagePreviewProps as CoreImagePreviewProps
} from '@expcat/tigercat-core'
import { renderBodyPortal, useBodyScrollLock, useEscapeKey, useFocusTrap } from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'

export interface ImagePreviewProps
  extends CoreImagePreviewProps, Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  onOpenChange?: (open: boolean) => void
  onCurrentIndexChange?: (index: number) => void
  onScaleChange?: (scale: number) => void
}

const SvgIcon: React.FC<{ d: string; cls?: string }> = ({ d, cls = 'w-5 h-5' }) => (
  <svg
    className={cls}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
)

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  open,
  images,
  currentIndex = 0,
  zIndex,
  maskClosable = true,
  scaleStep = LIGHTBOX_SCALE_STEP,
  minScale,
  maxScale,
  touchSwipeable = true,
  touchSwipeThreshold = 48,
  zoomable = true,
  rotatable = true,
  showNav = true,
  showCounter = true,
  locale,
  className,
  style,
  onOpenChange,
  onCurrentIndexChange,
  onScaleChange,
  onKeyDown,
  ...rest
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(() => getImageViewerLabels(mergedLocale), [mergedLocale])
  const scaleRange = useMemo(
    () => resolveLightboxScaleRange({ minScale, maxScale }),
    [minScale, maxScale]
  )
  const resolved = useMemo(() => resolveLightboxImages(images), [images])
  const isOpen = open ?? false
  const shouldRender = isOpen && resolved.length > 0

  const [transform, setTransform] = useState<GestureTransform>(createDefaultTransform)
  const [index, setIndex] = useState(() =>
    resolved.length ? Math.min(Math.max(0, currentIndex), resolved.length - 1) : 0
  )
  const [dragging, setDragging] = useState(false)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)
  const transformRef = useRef(transform)
  const indexRef = useRef(index)
  const resolvedRef = useRef(resolved)
  const onCurrentIndexChangeRef = useRef(onCurrentIndexChange)
  const onScaleChangeRef = useRef(onScaleChange)
  const gestureRef = useRef<ReturnType<typeof createLightboxGestureSession> | null>(null)

  transformRef.current = transform
  indexRef.current = index
  resolvedRef.current = resolved
  onCurrentIndexChangeRef.current = onCurrentIndexChange
  onScaleChangeRef.current = onScaleChange

  const resetTransform = useCallback(() => {
    setTransform(createDefaultTransform())
    setDragging(false)
  }, [])

  useEffect(() => {
    if (lightboxShouldClose(isOpen, resolved.length)) {
      onOpenChange?.(false)
    }
  }, [isOpen, resolved.length, onOpenChange])

  useEffect(() => {
    if (!isOpen) return
    const nextIndex =
      resolved.length === 0
        ? 0
        : Math.min(Math.max(0, Math.floor(currentIndex)), resolved.length - 1)
    setIndex(nextIndex)
    resetTransform()
  }, [isOpen, currentIndex, resolved.length, resetTransform])

  useBodyScrollLock({ enabled: shouldRender })
  useFocusTrap({ enabled: shouldRender, containerRef: rootRef, inert: true })

  const handleClose = useCallback(() => {
    onOpenChange?.(false)
  }, [onOpenChange])

  useEscapeKey({ enabled: shouldRender, onEscape: handleClose, layerRef: rootRef })

  const applyIndex = useCallback(
    (next: number) => {
      setIndex(next)
      resetTransform()
      onCurrentIndexChangeRef.current?.(next)
    },
    [resetTransform]
  )

  const handlePrev = useCallback(() => {
    const next = resolveLightboxNavIndex(indexRef.current, resolvedRef.current.length, 'prev')
    if (next === null) return
    applyIndex(next)
  }, [applyIndex])

  const handleNext = useCallback(() => {
    const next = resolveLightboxNavIndex(indexRef.current, resolvedRef.current.length, 'next')
    if (next === null) return
    applyIndex(next)
  }, [applyIndex])

  const setScale = useCallback((next: number) => {
    setTransform((current) => ({ ...current, scale: next }))
    onScaleChangeRef.current?.(next)
  }, [])

  const handleZoomIn = useCallback(() => {
    const current = transformRef.current.scale
    setScale(Math.min(current + scaleStep, scaleRange.maxScale))
  }, [scaleRange.maxScale, scaleStep, setScale])

  const handleZoomOut = useCallback(() => {
    const current = transformRef.current.scale
    setScale(Math.max(current - scaleStep, scaleRange.minScale))
  }, [scaleRange.minScale, scaleStep, setScale])

  const handleReset = useCallback(() => {
    resetTransform()
    onScaleChangeRef.current?.(1)
  }, [resetTransform])

  const handleRotateLeft = useCallback(() => {
    setTransform((current) => ({ ...current, rotation: normalizeRotation(current.rotation - 90) }))
  }, [])

  const handleRotateRight = useCallback(() => {
    setTransform((current) => ({ ...current, rotation: normalizeRotation(current.rotation + 90) }))
  }, [])

  useEffect(() => {
    if (!shouldRender) return
    previousActiveRef.current = captureActiveElement()
    const timer = window.setTimeout(() => {
      focusFirst([closeButtonRef.current, rootRef.current])
    }, 0)
    return () => {
      window.clearTimeout(timer)
      restoreFocus(previousActiveRef.current)
    }
  }, [shouldRender])

  useEffect(() => {
    if (!shouldRender) return
    const handler = (event: KeyboardEvent) => {
      const action = resolveLightboxKeyAction(event.key, {
        canNavigate: showNav && resolvedRef.current.length > 1,
        zoomable,
        rotatable,
        rtl: config.direction === 'rtl'
      })
      if (!action) return
      event.preventDefault()
      switch (action) {
        case 'prev':
          handlePrev()
          break
        case 'next':
          handleNext()
          break
        case 'zoomIn':
          handleZoomIn()
          break
        case 'zoomOut':
          handleZoomOut()
          break
        case 'rotateLeft':
          handleRotateLeft()
          break
        case 'rotateRight':
          handleRotateRight()
          break
        case 'reset':
          handleReset()
          break
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [
    config.direction,
    handleNext,
    handlePrev,
    handleReset,
    handleRotateLeft,
    handleRotateRight,
    handleZoomIn,
    handleZoomOut,
    rotatable,
    shouldRender,
    showNav,
    zoomable
  ])

  useEffect(() => {
    if (!shouldRender) return
    const root = rootRef.current
    if (!root) return
    const handler = (event: WheelEvent) => {
      if (!zoomable) return
      event.preventDefault()
      const next = applyWheelZoom(transformRef.current.scale, event.deltaY, scaleRange)
      setScale(next)
    }
    root.addEventListener('wheel', handler, { passive: false })
    return () => root.removeEventListener('wheel', handler)
  }, [scaleRange, setScale, shouldRender, zoomable])

  useEffect(() => {
    if (!shouldRender) {
      gestureRef.current?.dispose()
      gestureRef.current = null
      return
    }
    const session = createLightboxGestureSession({
      getScale: () => transformRef.current.scale,
      getTranslate: () => ({
        x: transformRef.current.translateX,
        y: transformRef.current.translateY
      }),
      minScale: scaleRange.minScale,
      maxScale: scaleRange.maxScale,
      zoomable,
      swipeable: touchSwipeable,
      swipeThreshold: touchSwipeThreshold,
      imageCount: resolved.length,
      onTransform: (next) => {
        setTransform((current) => ({ ...current, ...next }))
        if (next.scale != null) onScaleChangeRef.current?.(next.scale)
      },
      onSwipe: (direction) => {
        if (direction === 'prev') handlePrev()
        else handleNext()
      },
      onDraggingChange: setDragging
    })
    gestureRef.current = session
    return () => {
      session.dispose()
      if (gestureRef.current === session) gestureRef.current = null
    }
  }, [
    handleNext,
    handlePrev,
    resolved.length,
    scaleRange.maxScale,
    scaleRange.minScale,
    shouldRender,
    touchSwipeThreshold,
    touchSwipeable,
    zoomable
  ])

  const displayIndex = clampLightboxIndex(index, resolved.length)
  const navState = getLightboxNavState(displayIndex, resolved.length)
  const current = resolved[displayIndex]
  const currentAlt = formatLightboxImageAlt(
    current,
    displayIndex,
    resolved.length,
    labels.previewImageAriaLabel
  )
  const canZoomOut = transform.scale <= scaleRange.minScale + 1e-6
  const canZoomIn = transform.scale >= scaleRange.maxScale - 1e-6
  const showNavigation = showNav && resolved.length > 1
  const showCount = showCounter && resolved.length > 1

  const handleMaskClick = useCallback(() => {
    if (maskClosable) handleClose()
  }, [handleClose, maskClosable])

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLImageElement>) => {
    gestureRef.current?.pointerDown(event.nativeEvent)
  }, [])

  if (!shouldRender || !current) return null

  const rootStyle =
    zIndex != null && zIndex !== OVERLAY_Z_INDEX.modal ? { ...style, zIndex } : style

  return renderBodyPortal(
    <div
      {...rest}
      ref={rootRef}
      className={classNames(imagePreviewWrapperClasses, className)}
      style={rootStyle}
      role="dialog"
      aria-modal="true"
      aria-label={labels.previewDialogAriaLabel}
      tabIndex={-1}
      data-tiger-overlay-host=""
      data-tiger-image-preview=""
      onKeyDown={onKeyDown}>
      <div className={imagePreviewMaskClasses} aria-hidden="true" onClick={handleMaskClick} />
      <img
        src={current.src}
        className={classNames(imagePreviewImgClasses, !dragging && imagePreviewImgMotionClasses)}
        style={{ transform: getImageTransformStyle(transform) }}
        alt={currentAlt}
        draggable={false}
        onPointerDown={handlePointerDown}
      />
      <button
        ref={closeButtonRef}
        className={imagePreviewCloseBtnClasses}
        onClick={handleClose}
        aria-label={labels.closePreviewAriaLabel}
        type="button">
        <SvgIcon d={previewCloseIconPath} />
      </button>
      {showNavigation && (
        <button
          className={imagePreviewNavPrevClasses}
          onClick={handlePrev}
          disabled={!navState.hasPrev}
          aria-label={labels.previousImageAriaLabel}
          type="button">
          <SvgIcon d={prevIconPath} />
        </button>
      )}
      {showNavigation && (
        <button
          className={imagePreviewNavNextClasses}
          onClick={handleNext}
          disabled={!navState.hasNext}
          aria-label={labels.nextImageAriaLabel}
          type="button">
          <SvgIcon d={nextIconPath} />
        </button>
      )}
      {(zoomable || rotatable || showCount) && (
        <div className={imagePreviewToolbarClasses}>
          {zoomable && (
            <>
              <button
                className={imagePreviewToolbarBtnClasses}
                onClick={handleZoomOut}
                disabled={canZoomOut}
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
                disabled={canZoomIn}
                aria-label={labels.zoomInAriaLabel}
                type="button">
                <SvgIcon d={zoomInIconPath} />
              </button>
            </>
          )}
          {rotatable && (
            <>
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
            </>
          )}
          {showCount && navState.counter ? (
            <span className={imagePreviewCounterClasses} aria-live="polite">
              {navState.counter}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}
