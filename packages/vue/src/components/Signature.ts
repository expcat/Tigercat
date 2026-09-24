import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type PropType
} from 'vue'
import type {
  InputStatus,
  SignatureChangePayload,
  SignatureExportType,
  SignatureSession,
  TigerLocale,
  TigerLocaleSignature
} from '@expcat/tigercat-core'
import {
  SHAKE_CLASS,
  appendSignaturePoint,
  beginSignatureStroke,
  classNames,
  SIGNATURE_INVALID_VALUE,
  cancelSignatureStroke,
  clampSignatureLineWidth,
  clearSignatureStrokes,
  coerceClassValue,
  sanitizeSignatureValue,
  createDocumentDragSession,
  createSignatureChangePayload,
  createSignatureSession,
  drawSignatureStrokes,
  exportSignatureDataUrl,
  finishSignatureStroke,
  getSignatureCanvasStatusClasses,
  getSignatureCanvasWrapClasses,
  getSignatureDevicePixelRatio,
  getSignatureLabels,
  getSignaturePoint,
  isSignatureEmpty,
  mergeAriaDescribedBy,
  mergeStyleValues,
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
  syncSignatureCanvasBackingStore,
  undoSignatureStroke
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export type VueSignatureProps = InstanceType<typeof Signature>['$props']
export type SignatureProps = VueSignatureProps
export type { SignatureChangePayload, SignatureExportType }

const DEFAULT_HEIGHT = 180

export const Signature = defineComponent({
  name: 'TigerSignature',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    width: { type: Number, default: undefined },
    height: { type: Number, default: DEFAULT_HEIGHT },
    penColor: { type: String, default: undefined },
    backgroundColor: { type: String, default: undefined },
    lineWidth: { type: Number, default: 2 },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    exportType: {
      type: String as PropType<SignatureExportType>,
      default: 'image/png'
    },
    quality: { type: Number, default: 0.92 },
    ariaLabel: { type: String, default: undefined },
    clearText: { type: String, default: undefined },
    undoText: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<TigerLocaleSignature>>, default: undefined },
    name: { type: String, default: undefined },
    id: { type: String, default: undefined },
    status: { type: String as PropType<InputStatus>, default: undefined },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'begin', 'end', 'clear', 'undo', 'blur'],
  setup(props, { attrs, emit, expose }) {
    const config = useTigerConfig()
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    provide(FORM_ITEM_CONTROL_INJECTION_KEY, null)

    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() =>
      getSignatureLabels(mergedLocale.value, {
        ...props.labels,
        ariaLabel: props.ariaLabel?.trim() || props.labels?.ariaLabel,
        undoText: props.undoText?.trim() || props.labels?.undoText,
        clearText: props.clearText?.trim() || undefined
      })
    )

    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
    const effectiveName = computed(() => props.name ?? formItemControl?.name.value)
    const isReadOnly = computed(() => Boolean(props.readOnly))
    const explained = ref(false)

    const innerValue = ref(sanitizeSignatureValue(props.defaultValue ?? '').value)
    const observedWidth = ref(0)
    const logicalWidth = computed(() => props.width ?? observedWidth.value)
    const isInteractive = computed(() => !effectiveDisabled.value && !isReadOnly.value)
    const normalizedLineWidth = computed(() => clampSignatureLineWidth(props.lineWidth))

    const externalRaw = computed(() => {
      if (props.modelValue !== undefined) return props.modelValue
      if (formItemControl?.name.value) return formItemControl.value.value
      return undefined
    })
    const externalState = computed(() =>
      externalRaw.value === undefined ? undefined : sanitizeSignatureValue(externalRaw.value)
    )
    const committed = computed(() => {
      if (externalState.value) return externalState.value.value
      return innerValue.value
    })

    watch(
      () => externalState.value?.invalid,
      (invalid) => {
        if (invalid) {
          formItemControl?.setError(SIGNATURE_INVALID_VALUE)
          if (!explained.value) {
            explained.value = true
            emit('update:modelValue', '')
            formItemControl?.onChange('')
          }
          return
        }
        if (explained.value && committed.value) {
          explained.value = false
          formItemControl?.setError(null)
        }
      },
      { immediate: true }
    )

    const session = ref<SignatureSession>(
      createSignatureSession(signatureValueToStrokes(committed.value))
    )
    const strokes = ref(signatureValueToStrokes(committed.value))
    const rootRef = ref<HTMLDivElement | null>(null)
    const wrapRef = ref<HTMLDivElement | null>(null)
    const canvasRef = ref<HTMLCanvasElement | null>(null)
    let dragDispose: (() => void) | undefined
    let widthObserver: ResizeObserver | undefined

    watch(
      () => committed.value,
      (value) => {
        if (session.value.activeStroke) return
        const next = signatureValueToStrokes(value)
        session.value = createSignatureSession(next)
        strokes.value = next
      }
    )

    function exportOptions() {
      return {
        width: Math.max(1, logicalWidth.value || props.width || 1),
        height: props.height,
        backgroundColor: props.backgroundColor,
        surfaceColor: resolveSignatureSurfaceColor(canvasRef.value),
        quality: props.quality,
        exportType: props.exportType
      }
    }

    function draw(nextStrokes = strokes.value) {
      const canvas = canvasRef.value
      if (!canvas || logicalWidth.value <= 0 || props.height <= 0) return
      const context = syncSignatureCanvasBackingStore(
        canvas,
        logicalWidth.value,
        props.height,
        getSignatureDevicePixelRatio()
      )
      if (!context) return
      drawSignatureStrokes(context, nextStrokes, {
        width: logicalWidth.value,
        height: props.height,
        backgroundColor: props.backgroundColor
      })
    }

    watch([strokes, logicalWidth, () => props.height, () => props.backgroundColor], () => draw(), {
      flush: 'post'
    })

    function observeWidth() {
      widthObserver?.disconnect()
      widthObserver = undefined
      if (props.width != null) return
      const wrap = wrapRef.value
      if (!wrap || typeof ResizeObserver === 'undefined') {
        if (wrap && wrap.clientWidth > 0) observedWidth.value = Math.floor(wrap.clientWidth)
        return
      }
      widthObserver = new ResizeObserver((entries) => {
        const next = Math.floor(entries[0]?.contentRect.width ?? wrap.clientWidth)
        if (next > 0) observedWidth.value = next
      })
      widthObserver.observe(wrap)
      const initial = Math.floor(wrap.clientWidth)
      if (initial > 0) observedWidth.value = initial
    }

    onMounted(() => {
      observeWidth()
      draw()
    })

    watch(
      () => props.width,
      () => observeWidth()
    )

    watch(
      () => [status.value, formItemControl?.shakeTrigger.value] as const,
      () => {
        if (status.value === 'error') runShakeAnimation(rootRef.value)
      }
    )

    function writeCommitted(payload: SignatureChangePayload) {
      if (payload.value === committed.value) return
      if (props.modelValue === undefined) innerValue.value = payload.value
      emit('update:modelValue', payload.value, payload)
      formItemControl?.onChange(payload.value)
    }

    function emitPayload(next: SignatureSession, extra?: { clear?: boolean; undo?: boolean }) {
      const payload = createSignatureChangePayload(next.strokes, exportOptions())
      session.value = createSignatureSession(next.strokes)
      strokes.value = next.strokes
      writeCommitted(payload)
      if (extra?.clear) emit('clear')
      if (extra?.undo) emit('undo')
      return payload
    }

    function clear() {
      if (effectiveDisabled.value || isReadOnly.value) return
      dragDispose?.()
      dragDispose = undefined
      emitPayload(clearSignatureStrokes(), { clear: true })
    }

    function undo() {
      if (effectiveDisabled.value || isReadOnly.value) return
      dragDispose?.()
      dragDispose = undefined
      emitPayload(undoSignatureStroke(session.value), { undo: true })
    }

    const toSVG = () => signatureStrokesToSvg(session.value.strokes, exportOptions())

    const toDataURL = (
      type: SignatureExportType = props.exportType,
      nextQuality = props.quality
    ) => {
      if (type === 'image/svg+xml') return signatureSvgToDataUrl(toSVG())
      return exportSignatureDataUrl(session.value.strokes, type, {
        ...exportOptions(),
        quality: nextQuality
      })
    }

    function getPoint(clientX: number, clientY: number) {
      const canvas = canvasRef.value
      const rect = canvas?.getBoundingClientRect() ?? {
        left: 0,
        top: 0,
        width: logicalWidth.value,
        height: props.height
      }
      return getSignaturePoint(
        clientX,
        clientY,
        rect,
        logicalWidth.value || rect.width,
        props.height
      )
    }

    const activePointerId = ref<number | null>(null)

    function dropActiveStroke(id: number) {
      dragDispose?.()
      dragDispose = undefined
      if (activePointerId.value !== id) return
      activePointerId.value = null
      const next = cancelSignatureStroke(session.value)
      session.value = next
      strokes.value = next.strokes
    }

    function endDrawing(id: number) {
      dragDispose?.()
      dragDispose = undefined
      if (activePointerId.value !== id) return
      activePointerId.value = null
      if (!session.value.activeStroke) return
      const finished = finishSignatureStroke(session.value, id)
      session.value = finished
      const payload = emitPayload(finished)
      if (payload) emit('end', payload)
    }

    function handlePointerDown(event: PointerEvent) {
      canvasRef.value?.focus()
      if (!isInteractive.value) return
      event.preventDefault()
      const pointerId = event.pointerId
      const canvas = canvasRef.value
      const color = resolveSignaturePenColor(canvas, props.penColor)
      const next = beginSignatureStroke(
        session.value,
        getPoint(event.clientX, event.clientY),
        pointerId,
        color,
        normalizedLineWidth.value
      )
      if (next.pointerId !== pointerId) return
      session.value = next
      activePointerId.value = pointerId
      strokes.value = next.strokes
      emit('begin')
      dragDispose?.()
      const handle = createDocumentDragSession({
        startX: event.clientX,
        startY: event.clientY,
        pointerId,
        pointerTarget: canvas,
        dragThreshold: 0,
        onMove: (payload) => {
          const moved = appendSignaturePoint(
            session.value,
            getPoint(payload.currentX, payload.currentY),
            pointerId
          )
          session.value = moved
          strokes.value = moved.strokes
        },
        onEnd: (payload) => {
          if (payload.cancelled) {
            dropActiveStroke(pointerId)
            return
          }
          endDrawing(pointerId)
        }
      })
      dragDispose = () => handle.dispose()
    }

    onBeforeUnmount(() => {
      dragDispose?.()
      widthObserver?.disconnect()
    })

    function handleKeyDown(event: KeyboardEvent) {
      if (!props.clearable || effectiveDisabled.value || isReadOnly.value) return
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
        return
      }
      if (event.key === 'Escape' && session.value.activeStroke && activePointerId.value != null) {
        event.preventDefault()
        dropActiveStroke(activePointerId.value)
      }
    }

    function handleFocusOut(event: FocusEvent) {
      const next = event.relatedTarget as Node | null
      if (rootRef.value && next && rootRef.value.contains(next)) return
      formItemControl?.onBlur()
      emit('blur', event)
    }

    expose({
      clear,
      undo,
      isEmpty: () => isSignatureEmpty(session.value.strokes),
      toDataURL,
      toSVG,
      focus: () => canvasRef.value?.focus()
    })

    const rootClasses = computed(() =>
      classNames(
        signatureRootClasses,
        props.className,
        coerceClassValue(attrs.class),
        status.value === 'error' && SHAKE_CLASS
      )
    )
    const rootStyle = computed(() =>
      mergeStyleValues(props.style, (attrs as Record<string, unknown>).style)
    )

    return () => {
      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(
          ([key]) => key !== 'class' && key !== 'style' && key !== 'id' && !key.startsWith('aria-')
        )
      )
      const attrDescribedBy =
        typeof attrs['aria-describedby'] === 'string' ? attrs['aria-describedby'] : undefined
      const attrLabelledby =
        typeof attrs['aria-labelledby'] === 'string' ? attrs['aria-labelledby'] : undefined
      const labelledby = attrLabelledby?.trim() ? attrLabelledby : formItemControl?.labelId.value
      const describedBy = mergeAriaDescribedBy(attrDescribedBy, formItemControl?.describedBy.value)
      const empty = isSignatureEmpty(strokes.value) && !committed.value

      return h(
        'div',
        {
          ...forwardedAttrs,
          ref: rootRef,
          class: rootClasses.value,
          style: rootStyle.value,
          onFocusout: handleFocusOut
        },
        [
          effectiveName.value
            ? h('input', {
                type: 'hidden',
                name: effectiveName.value,
                value: committed.value ?? '',
                disabled: effectiveDisabled.value || undefined
              })
            : null,
          h(
            'div',
            {
              ref: wrapRef,
              class: classNames(
                getSignatureCanvasWrapClasses(effectiveDisabled.value, isReadOnly.value),
                getSignatureCanvasStatusClasses(status.value)
              )
            },
            [
              h('canvas', {
                ref: canvasRef,
                class: signatureCanvasClasses,
                style:
                  props.width != null
                    ? { width: `${props.width}px`, height: `${props.height}px` }
                    : {
                        width: logicalWidth.value > 0 ? `${logicalWidth.value}px` : '100%',
                        height: `${props.height}px`
                      },
                tabindex: effectiveDisabled.value ? -1 : 0,
                role: 'textbox',
                'aria-multiline': 'true',
                id: effectiveId.value,
                'aria-label': labelledby ? undefined : labels.value.ariaLabel,
                'aria-labelledby': labelledby,
                'aria-describedby': describedBy,
                'aria-disabled': effectiveDisabled.value || undefined,
                'aria-readonly': isReadOnly.value || undefined,
                'aria-invalid': status.value === 'error' ? true : undefined,
                'aria-required': formItemControl?.required.value ? true : undefined,
                onPointerdown: handlePointerDown,
                onLostpointercapture: () => {
                  const id = activePointerId.value
                  if (id != null) endDrawing(id)
                },
                onKeydown: handleKeyDown
              })
            ]
          ),
          props.clearable
            ? h('div', { class: signatureToolbarClasses }, [
                h(
                  'button',
                  {
                    type: 'button',
                    class: signatureToolbarButtonClasses,
                    disabled: effectiveDisabled.value || isReadOnly.value || empty,
                    onClick: undo
                  },
                  labels.value.undoText
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    class: signatureToolbarButtonClasses,
                    disabled: effectiveDisabled.value || isReadOnly.value || empty,
                    onClick: clear
                  },
                  labels.value.clearText
                )
              ])
            : null
        ]
      )
    }
  }
})

export default Signature
