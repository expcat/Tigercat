import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  useId,
  useImperativeHandle,
  forwardRef
} from 'react'
import {
  classNames,
  CROP_HANDLES,
  IMAGE_CROPPER_MASK_FILL,
  constrainCropRect,
  createCropperImageLoader,
  createDocumentDragSession,
  cropCanvas,
  formatCropperResizeAriaLabel,
  getCropperDisplaySize,
  getCropperHandleClasses,
  getCropperHandleName,
  getCropperHandleStyle,
  getImageEditorLabels,
  getInitialCropRect,
  imageCropperContainerClasses,
  imageCropperDragAreaClasses,
  imageCropperFrameClasses,
  imageCropperGuideClasses,
  imageCropperImgClasses,
  imageCropperMaskClasses,
  imageCropperSelectionClasses,
  imageErrorClasses,
  imageErrorIconPath,
  imageLoadingSpinnerClasses,
  imageLoadingSpinnerPath,
  injectImageCropperStyles,
  mergeTigerLocale,
  moveCropRect,
  remapCropRect,
  resizeCropRect,
  type CropHandle,
  type CropRect,
  type CropResult,
  type DocumentDragSession,
  type ImageCropperProps as CoreImageCropperProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'

export interface ImageCropperProps
  extends
    Omit<CoreImageCropperProps, 'className' | 'style'>,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CoreImageCropperProps> {
  className?: string
  style?: React.CSSProperties
  onCropChange?: (rect: CropRect) => void
  onReady?: () => void
}

export interface ImageCropperRef {
  getCropResult: () => Promise<CropResult>
}

type CropperStatus = 'loading' | 'ready' | 'error'

function renderErrorIcon(): React.ReactNode {
  return (
    <svg
      className="w-8 h-8"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={imageErrorIconPath} />
    </svg>
  )
}

function renderLoadingSpinner(): React.ReactNode {
  return (
    <svg
      className={imageLoadingSpinnerClasses}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path className="opacity-75" fill="currentColor" d={imageLoadingSpinnerPath} />
    </svg>
  )
}

export const ImageCropper = forwardRef<ImageCropperRef, ImageCropperProps>(
  (
    {
      src,
      cropRect: controlledCropRect,
      defaultCropRect,
      aspectRatio,
      minWidth = 20,
      minHeight = 20,
      outputType = 'image/png',
      quality = 0.92,
      guides = true,
      locale,
      className,
      style,
      onCropChange,
      onReady,
      ...rest
    },
    ref
  ) => {
    const reactId = useId()
    const maskId = `tiger-crop-mask-${reactId.replace(/:/g, '')}`
    const config = useTigerConfig()
    const mergedLocale = useMemo(
      () => mergeTigerLocale(config.locale, locale),
      [config.locale, locale]
    )
    const labels = useMemo(() => getImageEditorLabels(mergedLocale), [mergedLocale])
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)
    const loaderRef = useRef(createCropperImageLoader())
    const dragSessionRef = useRef<DocumentDragSession | null>(null)
    const displayDimsRef = useRef({ w: 0, h: 0 })
    const naturalSizeRef = useRef({ w: 0, h: 0 })
    const aspectRef = useRef(aspectRatio)
    const defaultCropRectRef = useRef(defaultCropRect)
    const onReadyRef = useRef(onReady)
    aspectRef.current = aspectRatio
    defaultCropRectRef.current = defaultCropRect
    onReadyRef.current = onReady

    const [status, setStatus] = useState<CropperStatus>('loading')
    const [displayWidth, setDisplayWidth] = useState(0)
    const [displayHeight, setDisplayHeight] = useState(0)
    const [cropRect, setCropRect] = useControlledState({
      value: controlledCropRect,
      defaultValue: defaultCropRect ?? { x: 0, y: 0, width: 0, height: 0 },
      onChange: onCropChange,
      postState: (rect) =>
        constrainCropRect(
          rect,
          displayDimsRef.current.w || displayWidth,
          displayDimsRef.current.h || displayHeight,
          aspectRatio,
          minWidth,
          minHeight
        )
    })

    useLayoutEffect(() => {
      injectImageCropperStyles()
    }, [])

    useEffect(() => {
      displayDimsRef.current = { w: displayWidth, h: displayHeight }
    }, [displayWidth, displayHeight])

    useEffect(() => {
      const loader = loaderRef.current
      setStatus('loading')
      imageRef.current = null
      loader.load(src, {
        onLoad: (img, naturalWidth, naturalHeight) => {
          const container = containerRef.current
          const size = getCropperDisplaySize(
            naturalWidth,
            naturalHeight,
            container?.clientWidth ?? 0,
            container?.clientHeight ?? 0
          )
          if (!size) {
            setStatus('error')
            return
          }
          imageRef.current = img
          naturalSizeRef.current = { w: naturalWidth, h: naturalHeight }
          displayDimsRef.current = { w: size.width, h: size.height }
          setDisplayWidth(size.width)
          setDisplayHeight(size.height)
          const initial =
            defaultCropRectRef.current ??
            getInitialCropRect(size.width, size.height, aspectRef.current, minWidth, minHeight)
          setCropRect(initial)
          setStatus('ready')
          onReadyRef.current?.()
        },
        onError: () => {
          imageRef.current = null
          setStatus('error')
        }
      })
      return () => loader.dispose()
    }, [src, minWidth, minHeight, setCropRect])

    const loadedAspectRef = useRef(aspectRatio)
    useEffect(() => {
      if (status !== 'ready') {
        loadedAspectRef.current = aspectRatio
        return
      }
      if (Object.is(loadedAspectRef.current, aspectRatio)) return
      loadedAspectRef.current = aspectRatio
      const dims = displayDimsRef.current
      setCropRect(getInitialCropRect(dims.w, dims.h, aspectRatio, minWidth, minHeight))
    }, [aspectRatio, minHeight, minWidth, setCropRect, status])

    useEffect(() => {
      const container = containerRef.current
      if (!container || status !== 'ready' || typeof ResizeObserver === 'undefined') return
      const observer = new ResizeObserver(() => {
        const natural = naturalSizeRef.current
        const next = getCropperDisplaySize(
          natural.w,
          natural.h,
          container.clientWidth,
          container.clientHeight
        )
        if (!next) return
        const current = displayDimsRef.current
        if (next.width === current.w && next.height === current.h) return
        setCropRect((prev) =>
          remapCropRect(
            prev,
            current.w,
            current.h,
            next.width,
            next.height,
            aspectRatio,
            minWidth,
            minHeight
          )
        )
        displayDimsRef.current = { w: next.width, h: next.height }
        setDisplayWidth(next.width)
        setDisplayHeight(next.height)
      })
      observer.observe(container)
      return () => observer.disconnect()
    }, [aspectRatio, minHeight, minWidth, setCropRect, status])

    useEffect(
      () => () => {
        dragSessionRef.current?.dispose()
        dragSessionRef.current = null
      },
      []
    )

    useImperativeHandle(
      ref,
      () => ({
        getCropResult: (): Promise<CropResult> => {
          return new Promise((resolve, reject) => {
            if (status !== 'ready' || !imageRef.current) {
              reject(new Error('Image not loaded'))
              return
            }
            try {
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
            } catch (error) {
              reject(error)
            }
          })
        }
      }),
      [cropRect, displayHeight, displayWidth, outputType, quality, status]
    )

    const startDrag = useCallback(
      (event: React.PointerEvent, mode: 'move' | 'resize', handle?: CropHandle) => {
        if (event.defaultPrevented) return
        if (event.button !== 0) return
        event.preventDefault()
        event.stopPropagation()
        const startRect = { ...cropRect }
        dragSessionRef.current?.dispose()
        dragSessionRef.current = createDocumentDragSession({
          startX: event.clientX,
          startY: event.clientY,
          ownerDocument: event.currentTarget.ownerDocument,
          pointerId: event.pointerId,
          pointerTarget: event.currentTarget,
          onMove: ({ event: moveEvent, deltaX, deltaY }) => {
            if (moveEvent.cancelable) moveEvent.preventDefault()
            const dims = displayDimsRef.current
            const next =
              mode === 'move'
                ? moveCropRect(startRect, deltaX, deltaY, dims.w, dims.h)
                : resizeCropRect(
                    startRect,
                    handle!,
                    deltaX,
                    deltaY,
                    dims.w,
                    dims.h,
                    aspectRatio,
                    minWidth,
                    minHeight
                  )
            setCropRect(next)
          },
          onEnd: () => {
            dragSessionRef.current = null
          }
        })
      },
      [aspectRatio, cropRect, minHeight, minWidth, setCropRect]
    )

    const handleMoveKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        const step = event.shiftKey ? 10 : 1
        const deltas: Record<string, { dx: number; dy: number } | undefined> = {
          ArrowLeft: { dx: -step, dy: 0 },
          ArrowRight: { dx: step, dy: 0 },
          ArrowUp: { dx: 0, dy: -step },
          ArrowDown: { dx: 0, dy: step }
        }
        const delta = deltas[event.key]
        if (!delta) return
        event.preventDefault()
        setCropRect(
          moveCropRect(
            cropRect,
            delta.dx,
            delta.dy,
            displayDimsRef.current.w,
            displayDimsRef.current.h
          )
        )
      },
      [cropRect, setCropRect]
    )

    const containerClasses = classNames(imageCropperContainerClasses, className)
    const rootStyle: React.CSSProperties = { ...style }
    if (status === 'loading' || status === 'error') {
      if (rootStyle.minHeight == null) rootStyle.minHeight = 200
    } else {
      if (rootStyle.width == null) rootStyle.width = displayWidth
      if (rootStyle.height == null) rootStyle.height = displayHeight
    }

    if (status !== 'ready') {
      return (
        <div
          {...rest}
          ref={containerRef}
          className={classNames(containerClasses, 'flex items-center justify-center')}
          style={rootStyle}
          data-image-cropper=""
          data-image-cropper-status={status}
          role="img"
          aria-label={
            status === 'error' ? labels.loadErrorAriaLabel : labels.loadingCropImageAriaLabel
          }>
          {status === 'error' ? (
            <div className={imageErrorClasses}>{renderErrorIcon()}</div>
          ) : (
            renderLoadingSpinner()
          )}
        </div>
      )
    }

    const cr = cropRect

    return (
      <div
        {...rest}
        ref={containerRef}
        className={containerClasses}
        style={rootStyle}
        data-image-cropper=""
        data-image-cropper-status="ready"
        role="group"
        aria-label={labels.cropperDialogAriaLabel}>
        <div
          className={imageCropperFrameClasses}
          style={{ width: displayWidth, height: displayHeight }}>
          <img
            src={src}
            className={imageCropperImgClasses}
            style={{ width: displayWidth, height: displayHeight }}
            draggable={false}
            alt={labels.imageToCropAriaLabel}
          />
          <svg
            className={imageCropperMaskClasses}
            width={displayWidth}
            height={displayHeight}
            xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id={maskId}>
                <rect width={displayWidth} height={displayHeight} fill="white" />
                <rect x={cr.x} y={cr.y} width={cr.width} height={cr.height} fill="black" />
              </mask>
            </defs>
            <rect
              width={displayWidth}
              height={displayHeight}
              fill={IMAGE_CROPPER_MASK_FILL}
              mask={`url(#${maskId})`}
            />
          </svg>
        </div>

        <div
          className={imageCropperSelectionClasses}
          style={{
            left: cr.x,
            top: cr.y,
            width: cr.width,
            height: cr.height
          }}
        />

        <div
          className={imageCropperDragAreaClasses}
          style={{
            left: cr.x,
            top: cr.y,
            width: cr.width,
            height: cr.height
          }}
          data-crop-move=""
          role="button"
          tabIndex={0}
          aria-label={labels.moveCropAreaAriaLabel}
          onPointerDown={(event) => startDrag(event, 'move')}
          onKeyDown={handleMoveKeyDown}
        />

        {guides && (
          <>
            <div
              className={imageCropperGuideClasses}
              data-guide="true"
              style={{
                left: cr.x,
                top: cr.y + cr.height / 3,
                width: cr.width,
                height: 0,
                borderTopWidth: 1,
                borderTopStyle: 'dashed'
              }}
            />
            <div
              className={imageCropperGuideClasses}
              data-guide="true"
              style={{
                left: cr.x,
                top: cr.y + (cr.height * 2) / 3,
                width: cr.width,
                height: 0,
                borderTopWidth: 1,
                borderTopStyle: 'dashed'
              }}
            />
            <div
              className={imageCropperGuideClasses}
              data-guide="true"
              style={{
                left: cr.x + cr.width / 3,
                top: cr.y,
                width: 0,
                height: cr.height,
                borderLeftWidth: 1,
                borderLeftStyle: 'dashed'
              }}
            />
            <div
              className={imageCropperGuideClasses}
              data-guide="true"
              style={{
                left: cr.x + (cr.width * 2) / 3,
                top: cr.y,
                width: 0,
                height: cr.height,
                borderLeftWidth: 1,
                borderLeftStyle: 'dashed'
              }}
            />
          </>
        )}

        {CROP_HANDLES.map((handle) => (
          <div
            key={handle}
            className={getCropperHandleClasses(handle)}
            style={getCropperHandleStyle(handle, cr)}
            data-crop-handle={handle}
            role="button"
            tabIndex={-1}
            aria-label={formatCropperResizeAriaLabel(
              labels.resizeCropAreaAriaLabel,
              getCropperHandleName(handle, labels)
            )}
            onPointerDown={(event) => startDrag(event, 'resize', handle)}
          />
        ))}
      </div>
    )
  }
)

ImageCropper.displayName = 'ImageCropper'
