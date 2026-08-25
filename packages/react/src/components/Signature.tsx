import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  classNames,
  clampSignatureLineWidth,
  cloneSignatureStrokes,
  drawSignatureStrokes,
  getSignatureCanvasDataUrl,
  getSignatureCanvasWrapClasses,
  getSignaturePoint,
  isSignatureEmpty,
  mergeTigerLocale,
  resolveLocaleText,
  signatureCanvasClasses,
  signatureClearButtonClasses,
  signatureRootClasses,
  signatureStrokesToSvg,
  signatureSvgToDataUrl,
  signatureToolbarClasses,
  type SignatureChangePayload,
  type SignatureExportType,
  type SignatureProps as CoreSignatureProps,
  type SignatureStroke
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface SignatureRef {
  clear: () => void
  isEmpty: () => boolean
  toDataURL: (type?: SignatureExportType, quality?: number) => string
  toSVG: () => string
}

export interface SignatureProps
  extends CoreSignatureProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  onChange?: (payload: SignatureChangePayload) => void
  onBegin?: () => void
  onEnd?: (payload: SignatureChangePayload) => void
  onClear?: () => void
}

const DEFAULT_WIDTH = 480
const DEFAULT_HEIGHT = 180

export const Signature = forwardRef<SignatureRef, SignatureProps>(
  (
    {
      width = DEFAULT_WIDTH,
      height = DEFAULT_HEIGHT,
      penColor = '#111827',
      backgroundColor,
      lineWidth = 2,
      disabled = false,
      readonly = false,
      clearable = true,
      exportType = 'image/png',
      quality = 0.92,
      ariaLabel = 'Signature pad',
      clearText,
      locale,
      className,
      onChange,
      onBegin,
      onEnd,
      onClear,
      style,
      ...rest
    },
    ref
  ) => {
    const config = useTigerConfig()
    const mergedLocale = useMemo(
      () => mergeTigerLocale(config.locale, locale),
      [config.locale, locale]
    )
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const strokesRef = useRef<SignatureStroke[]>([])
    const activeStrokeRef = useRef<SignatureStroke | null>(null)
    const capturedPointerIdRef = useRef<number | null>(null)
    const documentPointerListeningRef = useRef(false)
    const finishStrokeRef = useRef<() => void>(() => {})
    const [strokes, setStrokes] = useState<SignatureStroke[]>([])
    const isDisabled = disabled || readonly

    const normalizedLineWidth = clampSignatureLineWidth(lineWidth)

    const draw = useCallback(
      (nextStrokes: readonly SignatureStroke[]) => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')
        if (!canvas || !context) return

        const ratio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
        canvas.width = width * ratio
        canvas.height = height * ratio
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        context.setTransform(ratio, 0, 0, ratio, 0, 0)
        drawSignatureStrokes(context, nextStrokes, { width, height, backgroundColor })
      },
      [backgroundColor, height, width]
    )

    useEffect(() => {
      draw(strokes)
    }, [draw, strokes])

    const toSVG = useCallback(
      () => signatureStrokesToSvg(strokesRef.current, { width, height, backgroundColor }),
      [backgroundColor, height, width]
    )

    const toDataURL = useCallback(
      (type: SignatureExportType = exportType, nextQuality: number = quality) => {
        if (type === 'image/svg+xml') return signatureSvgToDataUrl(toSVG())
        return getSignatureCanvasDataUrl(canvasRef.current, type, nextQuality)
      },
      [exportType, quality, toSVG]
    )

    const createPayload = useCallback(
      (
        nextStrokes: SignatureStroke[],
        type: SignatureExportType = exportType
      ): SignatureChangePayload => {
        const value =
          type === 'image/svg+xml'
            ? signatureSvgToDataUrl(
                signatureStrokesToSvg(nextStrokes, { width, height, backgroundColor })
              )
            : getSignatureCanvasDataUrl(canvasRef.current, type, quality)

        return {
          value,
          empty: isSignatureEmpty(nextStrokes),
          strokes: cloneSignatureStrokes(nextStrokes),
          exportType: type
        }
      },
      [backgroundColor, exportType, height, quality, width]
    )

    const emitChange = useCallback(
      (nextStrokes: SignatureStroke[]) => {
        const payload = createPayload(nextStrokes)
        onChange?.(payload)
        return payload
      },
      [createPayload, onChange]
    )

    const handleDocumentPointerEnd = useRef(() => {
      finishStrokeRef.current()
    }).current

    const detachDocumentPointerListeners = () => {
      if (!documentPointerListeningRef.current || typeof document === 'undefined') return
      document.removeEventListener('pointerup', handleDocumentPointerEnd)
      document.removeEventListener('pointercancel', handleDocumentPointerEnd)
      documentPointerListeningRef.current = false
    }

    const attachDocumentPointerListeners = () => {
      if (documentPointerListeningRef.current || typeof document === 'undefined') return
      document.addEventListener('pointerup', handleDocumentPointerEnd)
      document.addEventListener('pointercancel', handleDocumentPointerEnd)
      documentPointerListeningRef.current = true
    }

    const captureCanvasPointer = (pointerId: number) => {
      capturedPointerIdRef.current = pointerId
      const canvas = canvasRef.current
      if (!canvas || typeof canvas.setPointerCapture !== 'function') return
      try {
        canvas.setPointerCapture(pointerId)
      } catch {
        // happy-dom / detached node
      }
    }

    const releaseCanvasPointer = () => {
      const canvas = canvasRef.current
      const pointerId = capturedPointerIdRef.current
      capturedPointerIdRef.current = null
      if (!canvas || pointerId == null || typeof canvas.releasePointerCapture !== 'function') return
      if (typeof canvas.hasPointerCapture === 'function') {
        try {
          if (!canvas.hasPointerCapture(pointerId)) return
        } catch {
          return
        }
      }
      try {
        canvas.releasePointerCapture(pointerId)
      } catch {
        // already released / happy-dom
      }
    }

    const clear = useCallback(() => {
      strokesRef.current = []
      activeStrokeRef.current = null
      detachDocumentPointerListeners()
      releaseCanvasPointer()
      setStrokes([])
      draw([])
      emitChange([])
      onClear?.()
    }, [draw, emitChange, onClear])

    useImperativeHandle(
      ref,
      () => ({
        clear,
        isEmpty: () => isSignatureEmpty(strokesRef.current),
        toDataURL,
        toSVG
      }),
      [clear, toDataURL, toSVG]
    )

    const getPointFromEvent = (event: { clientX: number; clientY: number }) => {
      const canvas = canvasRef.current
      const rect = canvas?.getBoundingClientRect() ?? {
        left: 0,
        top: 0,
        width,
        height
      }
      return getSignaturePoint(event.clientX, event.clientY, rect, width, height)
    }

    const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (isDisabled) return
      event.preventDefault()
      event.currentTarget.focus()

      const pointerId = event.pointerId
      if (typeof pointerId === 'number') {
        captureCanvasPointer(pointerId)
      }

      const stroke: SignatureStroke = {
        color: penColor,
        lineWidth: normalizedLineWidth,
        points: [getPointFromEvent(event)]
      }

      const nextStrokes = [...strokesRef.current, stroke]
      activeStrokeRef.current = stroke
      strokesRef.current = nextStrokes
      setStrokes(nextStrokes)
      attachDocumentPointerListeners()
      onBegin?.()
    }

    const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
      const activeStroke = activeStrokeRef.current
      if (!activeStroke || isDisabled) return
      event.preventDefault()

      activeStroke.points.push(getPointFromEvent(event))
      const nextStrokes = [...strokesRef.current]
      strokesRef.current = nextStrokes
      setStrokes(nextStrokes)
    }

    const finishStroke = () => {
      if (!activeStrokeRef.current) return
      activeStrokeRef.current = null
      const payload = emitChange(strokesRef.current)
      onEnd?.(payload)
      detachDocumentPointerListeners()
      releaseCanvasPointer()
    }
    finishStrokeRef.current = finishStroke

    useEffect(() => {
      return () => {
        detachDocumentPointerListeners()
        releaseCanvasPointer()
      }
    }, [])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
      if (!clearable || isDisabled) return
      if (event.key !== 'Delete' && event.key !== 'Backspace') return

      event.preventDefault()
      clear()
    }

    return (
      <div className={classNames(signatureRootClasses, className)} style={style} {...rest}>
        <div className={getSignatureCanvasWrapClasses(disabled, readonly)}>
          <canvas
            ref={canvasRef}
            className={signatureCanvasClasses}
            width={width}
            height={height}
            tabIndex={isDisabled ? -1 : 0}
            role="img"
            aria-label={ariaLabel}
            aria-disabled={isDisabled || undefined}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishStroke}
            onPointerCancel={finishStroke}
            onLostPointerCapture={finishStroke}
            onKeyDown={handleKeyDown}
          />
        </div>
        {clearable && (
          <div className={signatureToolbarClasses}>
            <button
              type="button"
              className={signatureClearButtonClasses}
              disabled={isDisabled || isSignatureEmpty(strokesRef.current)}
              onClick={clear}>
              {resolveLocaleText('Clear', clearText, mergedLocale?.common?.clearText)}
            </button>
          </div>
        )}
      </div>
    )
  }
)

Signature.displayName = 'Signature'

export default Signature
