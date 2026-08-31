import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import type {
  SignatureChangePayload,
  SignatureExportType,
  SignatureProps as CoreSignatureProps,
  SignatureSession,
  InputStatus
} from '@expcat/tigercat-core'
import {
  SHAKE_CLASS,
  appendSignaturePoint,
  beginSignatureStroke,
  classNames,
  clampSignatureLineWidth,
  clearSignatureStrokes,
  createDocumentDragSession,
  createSignatureChangePayload,
  createSignatureSession,
  exportSignatureDataUrl,
  finishSignatureStroke,
  getSignatureCanvasStatusClasses,
  getSignatureCanvasWrapClasses,
  getSignatureDevicePixelRatio,
  getSignatureLabels,
  getSignaturePoint,
  isSignatureEmpty,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  resolveSignaturePenColor,
  resolveSignatureSurfaceColor,
  runShakeAnimation,
  signatureCanvasClasses,
  signatureRootClasses,
  signatureStrokesToSvg,
  signatureSvgToDataUrl,
  signatureToolbarButtonClasses,
  signatureToolbarClasses,
  signatureValueToStrokes,
  drawSignatureStrokes,
  syncSignatureCanvasBackingStore,
  undoSignatureStroke
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'
import { useFormItemControlContext } from './FormItemContext'

export interface SignatureRef {
  clear: () => void
  undo: () => void
  isEmpty: () => boolean
  toDataURL: (type?: SignatureExportType, quality?: number) => string
  toSVG: () => string
  focus: () => void
}

export interface SignatureProps
  extends
    Omit<CoreSignatureProps, 'className'>,
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'onChange' | 'defaultValue' | 'children' | 'onBlur'
    > {
  onBegin?: () => void
  onEnd?: (payload: SignatureChangePayload) => void
  onClear?: () => void
  onUndo?: () => void
  onBlur?: React.FocusEventHandler<HTMLElement>
}

const DEFAULT_HEIGHT = 180

export const Signature = forwardRef<SignatureRef, SignatureProps>(function Signature(
  {
    value,
    defaultValue,
    width: widthProp,
    height = DEFAULT_HEIGHT,
    penColor,
    backgroundColor,
    lineWidth = 2,
    disabled = false,
    readonly = false,
    clearable = true,
    exportType = 'image/png',
    quality = 0.92,
    ariaLabel,
    clearText,
    undoText,
    locale,
    labels: labelsOverride,
    name,
    id,
    status: statusProp,
    className,
    onChange,
    onBegin,
    onEnd,
    onClear,
    onUndo,
    onBlur,
    style,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const formItemControl = useFormItemControlContext()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () =>
      getSignatureLabels(mergedLocale, {
        ...labelsOverride,
        ariaLabel: ariaLabel?.trim() || labelsOverride?.ariaLabel,
        undoText: undoText?.trim() || labelsOverride?.undoText,
        clearText: clearText?.trim() || labelsOverride?.clearText
      }),
    [ariaLabel, clearText, labelsOverride, mergedLocale, undoText]
  )

  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const describedBy = mergeAriaDescribedBy(
    typeof rest['aria-describedby'] === 'string' ? rest['aria-describedby'] : undefined,
    formItemControl?.describedBy
  )
  const labelledby =
    typeof rest['aria-labelledby'] === 'string' && rest['aria-labelledby'].trim()
      ? rest['aria-labelledby']
      : formItemControl?.labelId
  const parsedValue = value !== undefined ? value : (formItemControl?.value as string | undefined)

  const [committed, setCommitted] = useControlledState<string, [SignatureChangePayload]>({
    value: value !== undefined || formItemControl?.value !== undefined ? parsedValue : undefined,
    defaultValue: defaultValue ?? '',
    onChange: (next, payload) => {
      onChange?.(next, payload)
      formItemControl?.onChange?.(next)
    }
  })

  const rootRef = useRef<HTMLDivElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sessionRef = useRef<SignatureSession>(
    createSignatureSession(signatureValueToStrokes(committed))
  )
  const dragDisposeRef = useRef<(() => void) | undefined>(undefined)
  const activePointerRef = useRef<number | null>(null)
  const [strokes, setStrokes] = useState(() => signatureValueToStrokes(committed))
  const [observedWidth, setObservedWidth] = useState(0)
  const logicalWidth = widthProp ?? observedWidth
  const isInteractive = !effectiveDisabled && !readonly
  const normalizedLineWidth = clampSignatureLineWidth(lineWidth)

  const exportOptions = useCallback(
    () => ({
      width: Math.max(1, logicalWidth || widthProp || 1),
      height,
      backgroundColor,
      surfaceColor: resolveSignatureSurfaceColor(canvasRef.current),
      quality,
      exportType
    }),
    [backgroundColor, exportType, height, logicalWidth, quality, widthProp]
  )

  const draw = useCallback(
    (nextStrokes: typeof strokes) => {
      const canvas = canvasRef.current
      if (!canvas || logicalWidth <= 0 || height <= 0) return
      const context = syncSignatureCanvasBackingStore(
        canvas,
        logicalWidth,
        height,
        getSignatureDevicePixelRatio()
      )
      if (!context) return
      drawSignatureStrokes(context, nextStrokes, {
        width: logicalWidth,
        height,
        backgroundColor
      })
    },
    [backgroundColor, height, logicalWidth]
  )

  useLayoutEffect(() => {
    draw(strokes)
  }, [draw, strokes])

  useEffect(() => {
    if (sessionRef.current.activeStroke) return
    const next = signatureValueToStrokes(committed)
    sessionRef.current = createSignatureSession(next)
    setStrokes(next)
  }, [committed])

  useEffect(() => {
    if (widthProp != null) return
    const wrap = wrapRef.current
    if (!wrap || typeof ResizeObserver === 'undefined') {
      if (wrap) setObservedWidth(Math.floor(wrap.clientWidth))
      return
    }
    const observer = new ResizeObserver((entries) => {
      const next = Math.floor(entries[0]?.contentRect.width ?? wrap.clientWidth)
      if (next > 0) setObservedWidth(next)
    })
    observer.observe(wrap)
    const initial = Math.floor(wrap.clientWidth)
    if (initial > 0) setObservedWidth(initial)
    return () => observer.disconnect()
  }, [widthProp])

  useEffect(() => {
    if (status === 'error') runShakeAnimation(rootRef.current)
  }, [status, formItemControl?.shakeTrigger])

  const emitPayload = useCallback(
    (session: SignatureSession, extra?: { clear?: boolean; undo?: boolean }) => {
      const payload = createSignatureChangePayload(session.strokes, exportOptions())
      sessionRef.current = createSignatureSession(session.strokes)
      setStrokes(session.strokes)
      setCommitted(payload.value, payload)
      formItemControl?.onChange?.(payload.value)
      if (extra?.clear) onClear?.()
      if (extra?.undo) onUndo?.()
      return payload
    },
    [exportOptions, onClear, onUndo, setCommitted]
  )

  const clear = useCallback(() => {
    if (effectiveDisabled || readonly) return
    dragDisposeRef.current?.()
    dragDisposeRef.current = undefined
    const session = clearSignatureStrokes()
    emitPayload(session, { clear: true })
  }, [effectiveDisabled, emitPayload, readonly])

  const undo = useCallback(() => {
    if (effectiveDisabled || readonly) return
    dragDisposeRef.current?.()
    dragDisposeRef.current = undefined
    const session = undoSignatureStroke(sessionRef.current)
    emitPayload(session, { undo: true })
  }, [effectiveDisabled, emitPayload, readonly])

  const toSVG = useCallback(
    () => signatureStrokesToSvg(sessionRef.current.strokes, exportOptions()),
    [exportOptions]
  )

  const toDataURL = useCallback(
    (type: SignatureExportType = exportType, nextQuality: number = quality) => {
      if (type === 'image/svg+xml') return signatureSvgToDataUrl(toSVG())
      return exportSignatureDataUrl(sessionRef.current.strokes, type, {
        ...exportOptions(),
        quality: nextQuality
      })
    },
    [exportOptions, exportType, quality, toSVG]
  )

  useImperativeHandle(
    ref,
    () => ({
      clear,
      undo,
      isEmpty: () => isSignatureEmpty(sessionRef.current.strokes),
      toDataURL,
      toSVG,
      focus: () => canvasRef.current?.focus()
    }),
    [clear, toDataURL, toSVG, undo]
  )

  const getPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    const rect = canvas?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      width: logicalWidth,
      height
    }
    return getSignaturePoint(clientX, clientY, rect, logicalWidth || rect.width, height)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isInteractive) return
    event.preventDefault()
    const pointerId = event.pointerId
    const color = resolveSignaturePenColor(event.currentTarget, penColor)
    const next = beginSignatureStroke(
      sessionRef.current,
      getPoint(event.clientX, event.clientY),
      pointerId,
      color,
      normalizedLineWidth
    )
    if (next.pointerId !== pointerId) return
    sessionRef.current = next
    activePointerRef.current = pointerId
    setStrokes(next.strokes)
    onBegin?.()
    dragDisposeRef.current?.()
    const session = createDocumentDragSession({
      startX: event.clientX,
      startY: event.clientY,
      pointerId,
      pointerTarget: event.currentTarget,
      dragThreshold: 0,
      onMove: (payload) => {
        const moved = appendSignaturePoint(
          sessionRef.current,
          getPoint(payload.currentX, payload.currentY),
          pointerId
        )
        sessionRef.current = moved
        setStrokes(moved.strokes)
      },
      onEnd: () => endDrawing(pointerId)
    })
    dragDisposeRef.current = () => session.dispose()
  }

  const endDrawing = (id: number) => {
    dragDisposeRef.current?.()
    dragDisposeRef.current = undefined
    if (activePointerRef.current !== id) return
    activePointerRef.current = null
    if (!sessionRef.current.activeStroke) return
    const finished = finishSignatureStroke(sessionRef.current, id)
    sessionRef.current = finished
    const payload = emitPayload(finished)
    if (payload) onEnd?.(payload)
  }

  useEffect(() => () => dragDisposeRef.current?.(), [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!clearable || effectiveDisabled || readonly) return
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault()
      undo()
      return
    }
    if (event.key === 'Backspace') {
      event.preventDefault()
      undo()
      return
    }
    if (event.key === 'Delete') {
      event.preventDefault()
      clear()
    }
  }

  const handleFocusOut = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null
    if (rootRef.current && next && rootRef.current.contains(next)) return
    formItemControl?.onBlur?.()
    onBlur?.(event)
  }

  const empty = isSignatureEmpty(strokes) && !committed
  const { 'aria-describedby': _describedBy, 'aria-labelledby': _labelledby, ...rootRest } = rest

  return (
    <div
      ref={rootRef}
      className={classNames(signatureRootClasses, className, status === 'error' && SHAKE_CLASS)}
      style={style}
      onBlur={handleFocusOut}
      {...rootRest}>
      {effectiveName ? <input type="hidden" name={effectiveName} value={committed ?? ''} /> : null}
      <div
        ref={wrapRef}
        className={classNames(
          getSignatureCanvasWrapClasses(effectiveDisabled, readonly),
          getSignatureCanvasStatusClasses(status)
        )}>
        <canvas
          ref={canvasRef}
          className={signatureCanvasClasses}
          width={Math.max(1, logicalWidth)}
          height={height}
          tabIndex={effectiveDisabled ? -1 : 0}
          role="textbox"
          aria-multiline="true"
          id={effectiveId}
          aria-label={labelledby ? undefined : labels.ariaLabel}
          aria-labelledby={labelledby}
          aria-describedby={describedBy}
          aria-disabled={effectiveDisabled || undefined}
          aria-readonly={readonly || undefined}
          aria-invalid={status === 'error' ? true : undefined}
          aria-required={formItemControl?.required || undefined}
          onPointerDown={handlePointerDown}
          onLostPointerCapture={() => {
            const id = activePointerRef.current
            if (id != null) endDrawing(id)
          }}
          onKeyDown={handleKeyDown}
        />
      </div>
      {clearable ? (
        <div className={signatureToolbarClasses}>
          <button
            type="button"
            className={signatureToolbarButtonClasses}
            disabled={effectiveDisabled || readonly || empty}
            onClick={undo}>
            {labels.undoText}
          </button>
          <button
            type="button"
            className={signatureToolbarButtonClasses}
            disabled={effectiveDisabled || readonly || empty}
            onClick={clear}>
            {labels.clearText}
          </button>
        </div>
      ) : null}
    </div>
  )
})

Signature.displayName = 'Signature'

export default Signature
