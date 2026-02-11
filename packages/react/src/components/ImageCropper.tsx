import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef
} from 'react'
import {
  classNames,
  imageCropperContainerClasses,
  imageCropperImgClasses,
  imageCropperMaskClasses,
  imageCropperSelectionClasses,
  imageCropperGuideClasses,
  imageCropperDragAreaClasses,
  getCropperHandleClasses,
  CROP_HANDLES,
  getInitialCropRect,
  resizeCropRect,
  moveCropRect,
  cropCanvas,
  type CropRect,
  type CropResult,
  type CropHandle,
  type ImageCropperProps as CoreImageCropperProps
} from '@expcat/tigercat-core'

export interface ImageCropperProps extends Omit<CoreImageCropperProps, 'className'> {
  className?: string
  style?: React.CSSProperties
  /**
   * Callback when crop area changes
   */
  onCropChange?: (rect: CropRect) => void
  /**
   * Callback when image is loaded and ready
   */
  onReady?: () => void
}

export interface ImageCropperRef {
  getCropResult: () => Promise<CropResult>
}

export const ImageCropper = forwardRef<ImageCropperRef, ImageCropperProps>(
  (
    {
      src,
      aspectRatio,
      minWidth = 20,
      minHeight = 20,
      outputType = 'image/png',
      quality = 0.92,
      guides = true,
      className,
      style,
      onCropChange,
      onReady
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [displayWidth, setDisplayWidth] = useState(0)
    const [displayHeight, setDisplayHeight] = useState(0)
    const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 })

    const dragModeRef = useRef<'none' | 'move' | 'resize'>('none')
    const activeHandleRef = useRef<CropHandle | null>(null)
    const dragStartPosRef = useRef({ x: 0, y: 0 })
    const dragStartRectRef = useRef<CropRect>({ x: 0, y: 0, width: 0, height: 0 })
    // Use refs for latest values in event handlers
    const displayDimsRef = useRef({ w: 0, h: 0 })

    useEffect(() => {
      displayDimsRef.current = { w: displayWidth, h: displayHeight }
    }, [displayWidth, displayHeight])

    // Load image
    useEffect(() => {
      setImageLoaded(false)
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        imageRef.current = img

        const container = containerRef.current
        const containerW = container ? container.clientWidth : img.naturalWidth
        const containerH = container ? container.clientHeight || 400 : img.naturalHeight
        const ratio = Math.min(containerW / img.naturalWidth, containerH / img.naturalHeight, 1)
        const dw = img.naturalWidth * ratio
        const dh = img.naturalHeight * ratio

        setDisplayWidth(dw)
        setDisplayHeight(dh)
        displayDimsRef.current = { w: dw, h: dh }

        const initial = getInitialCropRect(dw, dh, aspectRatio)
        setCropRect(initial)

        setImageLoaded(true)
        onReady?.()
      }
      img.src = src
    }, [src, aspectRatio, onReady])

    // Expose getCropResult
    useImperativeHandle(
      ref,
      () => ({
        getCropResult: (): Promise<CropResult> => {
          return new Promise((resolve, reject) => {
            if (!imageRef.current) {
              reject(new Error('Image not loaded'))
              return
            }
            const { canvas, dataUrl } = cropCanvas(
              imageRef.current,
              cropRect,
              displayWidth,
              displayHeight,
              outputType,
              quality
            )
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve({ canvas, blob, dataUrl, cropRect: { ...cropRect } })
                } else {
                  reject(new Error('Failed to create blob'))
                }
              },
              outputType,
              quality
            )
          })
        }
      }),
      [cropRect, displayWidth, displayHeight, outputType, quality]
    )

    const handleMouseDown = useCallback(
      (e: React.MouseEvent, mode: 'move' | 'resize', handle?: CropHandle) => {
        e.preventDefault()
        e.stopPropagation()
        dragModeRef.current = mode
        activeHandleRef.current = handle || null
        dragStartPosRef.current = { x: e.clientX, y: e.clientY }
        dragStartRectRef.current = { ...cropRect }

        const onMouseMove = (ev: MouseEvent) => {
          const dx = ev.clientX - dragStartPosRef.current.x
          const dy = ev.clientY - dragStartPosRef.current.y
          const dims = displayDimsRef.current

          let newRect: CropRect
          if (dragModeRef.current === 'move') {
            newRect = moveCropRect(dragStartRectRef.current, dx, dy, dims.w, dims.h)
          } else {
            newRect = resizeCropRect(
              dragStartRectRef.current,
              activeHandleRef.current!,
              dx,
              dy,
              dims.w,
              dims.h,
              aspectRatio,
              minWidth,
              minHeight
            )
          }
          setCropRect(newRect)
          onCropChange?.(newRect)
        }

        const onMouseUp = () => {
          dragModeRef.current = 'none'
          activeHandleRef.current = null
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      },
      [cropRect, aspectRatio, minWidth, minHeight, onCropChange]
    )

    const handleTouchStart = useCallback(
      (e: React.TouchEvent, mode: 'move' | 'resize', handle?: CropHandle) => {
        if (e.touches.length !== 1) return
        e.preventDefault()
        e.stopPropagation()
        const touch = e.touches[0]
        dragModeRef.current = mode
        activeHandleRef.current = handle || null
        dragStartPosRef.current = { x: touch.clientX, y: touch.clientY }
        dragStartRectRef.current = { ...cropRect }

        const onTouchMove = (ev: TouchEvent) => {
          if (ev.touches.length !== 1) return
          const t = ev.touches[0]
          const dx = t.clientX - dragStartPosRef.current.x
          const dy = t.clientY - dragStartPosRef.current.y
          const dims = displayDimsRef.current

          let newRect: CropRect
          if (dragModeRef.current === 'move') {
            newRect = moveCropRect(dragStartRectRef.current, dx, dy, dims.w, dims.h)
          } else {
            newRect = resizeCropRect(
              dragStartRectRef.current,
              activeHandleRef.current!,
              dx,
              dy,
              dims.w,
              dims.h,
              aspectRatio,
              minWidth,
              minHeight
            )
          }
          setCropRect(newRect)
          onCropChange?.(newRect)
        }

        const onTouchEnd = () => {
          dragModeRef.current = 'none'
          activeHandleRef.current = null
          document.removeEventListener('touchmove', onTouchMove)
          document.removeEventListener('touchend', onTouchEnd)
        }

        document.addEventListener('touchmove', onTouchMove, { passive: false })
        document.addEventListener('touchend', onTouchEnd)
      },
      [cropRect, aspectRatio, minWidth, minHeight, onCropChange]
    )

    const containerClasses = useMemo(
      () => classNames(imageCropperContainerClasses, className),
      [className]
    )

    const cr = cropRect

    if (!imageLoaded) {
      return (
        <div
          ref={containerRef}
          className={classNames(containerClasses, 'flex items-center justify-center')}
          style={{ ...style, minHeight: '200px' }}
          role="img"
          aria-label="Loading image for cropping">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )
    }

    return (
      <div
        ref={containerRef}
        className={containerClasses}
        style={{
          ...style,
          width: `${displayWidth}px`,
          height: `${displayHeight}px`
        }}
        role="application"
        aria-label="Image cropper"
        aria-roledescription="image cropper">
        {/* Source image */}
        <img
          src={src}
          className={imageCropperImgClasses}
          style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
          draggable={false}
          alt="Image to crop"
        />

        {/* SVG mask with cutout */}
        <svg
          className={imageCropperMaskClasses}
          width={displayWidth}
          height={displayHeight}
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="crop-mask">
              <rect width={displayWidth} height={displayHeight} fill="white" />
              <rect x={cr.x} y={cr.y} width={cr.width} height={cr.height} fill="black" />
            </mask>
          </defs>
          <rect
            width={displayWidth}
            height={displayHeight}
            fill="var(--tiger-image-cropper-mask, rgba(0,0,0,0.55))"
            mask="url(#crop-mask)"
          />
        </svg>

        {/* Selection border */}
        <div
          className={imageCropperSelectionClasses}
          style={{
            left: `${cr.x}px`,
            top: `${cr.y}px`,
            width: `${cr.width}px`,
            height: `${cr.height}px`
          }}
        />

        {/* Drag area */}
        <div
          className={imageCropperDragAreaClasses}
          style={{
            left: `${cr.x}px`,
            top: `${cr.y}px`,
            width: `${cr.width}px`,
            height: `${cr.height}px`
          }}
          onMouseDown={(e) => handleMouseDown(e, 'move')}
          onTouchStart={(e) => handleTouchStart(e, 'move')}
        />

        {/* Guide lines */}
        {guides && (
          <>
            <div
              className={imageCropperGuideClasses}
              style={{
                left: `${cr.x}px`,
                top: `${cr.y + cr.height / 3}px`,
                width: `${cr.width}px`,
                height: 0,
                borderTopWidth: '1px',
                borderTopStyle: 'dashed'
              }}
            />
            <div
              className={imageCropperGuideClasses}
              style={{
                left: `${cr.x}px`,
                top: `${cr.y + (cr.height * 2) / 3}px`,
                width: `${cr.width}px`,
                height: 0,
                borderTopWidth: '1px',
                borderTopStyle: 'dashed'
              }}
            />
            <div
              className={imageCropperGuideClasses}
              style={{
                left: `${cr.x + cr.width / 3}px`,
                top: `${cr.y}px`,
                width: 0,
                height: `${cr.height}px`,
                borderLeftWidth: '1px',
                borderLeftStyle: 'dashed'
              }}
            />
            <div
              className={imageCropperGuideClasses}
              style={{
                left: `${cr.x + (cr.width * 2) / 3}px`,
                top: `${cr.y}px`,
                width: 0,
                height: `${cr.height}px`,
                borderLeftWidth: '1px',
                borderLeftStyle: 'dashed'
              }}
            />
          </>
        )}

        {/* Resize handles */}
        {CROP_HANDLES.map((handle) => {
          const pos: React.CSSProperties = {}
          if (handle.includes('n')) pos.top = `${cr.y}px`
          if (handle.includes('s')) pos.top = `${cr.y + cr.height}px`
          if (handle === 'e' || handle === 'w') pos.top = `${cr.y + cr.height / 2}px`
          if (handle.includes('w')) pos.left = `${cr.x}px`
          if (handle.includes('e')) pos.left = `${cr.x + cr.width}px`
          if (handle === 'n' || handle === 's') pos.left = `${cr.x + cr.width / 2}px`

          return (
            <div
              key={handle}
              className={getCropperHandleClasses(handle)}
              style={pos}
              onMouseDown={(e) => handleMouseDown(e, 'resize', handle)}
              onTouchStart={(e) => handleTouchStart(e, 'resize', handle)}
            />
          )
        })}
      </div>
    )
  }
)

ImageCropper.displayName = 'ImageCropper'
