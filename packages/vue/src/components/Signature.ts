import { computed, defineComponent, h, onMounted, ref, watch, type PropType } from 'vue'
import {
  classNames,
  clampSignatureLineWidth,
  cloneSignatureStrokes,
  coerceClassValue,
  drawSignatureStrokes,
  getSignatureCanvasDataUrl,
  getSignatureCanvasWrapClasses,
  getSignaturePoint,
  isBrowser,
  isSignatureEmpty,
  mergeStyleValues,
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
  type SignatureStroke,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export type VueSignatureProps = InstanceType<typeof Signature>['$props']

const DEFAULT_WIDTH = 480
const DEFAULT_HEIGHT = 180

export const Signature = defineComponent({
  name: 'TigerSignature',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    width: { type: Number, default: DEFAULT_WIDTH },
    height: { type: Number, default: DEFAULT_HEIGHT },
    penColor: { type: String, default: '#111827' },
    backgroundColor: { type: String, default: undefined },
    lineWidth: { type: Number, default: 2 },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    exportType: {
      type: String as PropType<SignatureExportType>,
      default: 'image/png'
    },
    quality: { type: Number, default: 0.92 },
    ariaLabel: { type: String, default: 'Signature pad' },
    clearText: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'change', 'begin', 'end', 'clear'],
  setup(props, { attrs, emit, expose }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const canvasRef = ref<HTMLCanvasElement | null>(null)
    const strokes = ref<SignatureStroke[]>([])
    const activeStroke = ref<SignatureStroke | null>(null)
    const isDisabled = computed(() => props.disabled || props.readonly)
    const normalizedLineWidth = computed(() => clampSignatureLineWidth(props.lineWidth))

    const draw = (nextStrokes: readonly SignatureStroke[]) => {
      const canvas = canvasRef.value
      const context = canvas?.getContext('2d')
      if (!canvas || !context) return

      const ratio = !isBrowser() ? 1 : window.devicePixelRatio || 1
      canvas.width = props.width * ratio
      canvas.height = props.height * ratio
      canvas.style.width = `${props.width}px`
      canvas.style.height = `${props.height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      drawSignatureStrokes(context, nextStrokes, {
        width: props.width,
        height: props.height,
        backgroundColor: props.backgroundColor
      })
    }

    watch(
      [strokes, () => props.width, () => props.height, () => props.backgroundColor],
      () => draw(strokes.value),
      { deep: true, flush: 'post' }
    )

    watch(
      () => props.modelValue,
      (value) => {
        if (value === '' && !isSignatureEmpty(strokes.value)) {
          strokes.value = []
          activeStroke.value = null
          draw([])
        }
      }
    )

    onMounted(() => {
      draw(strokes.value)
    })

    const toSVG = () =>
      signatureStrokesToSvg(strokes.value, {
        width: props.width,
        height: props.height,
        backgroundColor: props.backgroundColor
      })

    const toDataURL = (type: SignatureExportType = props.exportType, quality = props.quality) => {
      if (type === 'image/svg+xml') return signatureSvgToDataUrl(toSVG())
      return getSignatureCanvasDataUrl(canvasRef.value, type, quality)
    }

    const createPayload = (nextStrokes: SignatureStroke[]): SignatureChangePayload => {
      const value =
        props.exportType === 'image/svg+xml'
          ? signatureSvgToDataUrl(
              signatureStrokesToSvg(nextStrokes, {
                width: props.width,
                height: props.height,
                backgroundColor: props.backgroundColor
              })
            )
          : getSignatureCanvasDataUrl(canvasRef.value, props.exportType, props.quality)

      return {
        value,
        empty: isSignatureEmpty(nextStrokes),
        strokes: cloneSignatureStrokes(nextStrokes),
        exportType: props.exportType
      }
    }

    const emitChange = (nextStrokes: SignatureStroke[]) => {
      const payload = createPayload(nextStrokes)
      emit('update:modelValue', payload.value)
      emit('change', payload)
      return payload
    }

    const clear = () => {
      strokes.value = []
      activeStroke.value = null
      draw([])
      emitChange([])
      emit('clear')
    }

    const getPointFromEvent = (event: PointerEvent) => {
      const canvas = canvasRef.value
      const rect = canvas?.getBoundingClientRect() ?? {
        left: 0,
        top: 0,
        width: props.width,
        height: props.height
      }
      return getSignaturePoint(event.clientX, event.clientY, rect, props.width, props.height)
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (isDisabled.value) return
      event.preventDefault()
      canvasRef.value?.focus()

      const stroke: SignatureStroke = {
        color: props.penColor,
        lineWidth: normalizedLineWidth.value,
        points: [getPointFromEvent(event)]
      }

      activeStroke.value = stroke
      strokes.value = [...strokes.value, stroke]
      emit('begin')
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!activeStroke.value || isDisabled.value) return
      event.preventDefault()
      activeStroke.value.points.push(getPointFromEvent(event))
      strokes.value = [...strokes.value]
    }

    const finishStroke = () => {
      if (!activeStroke.value) return
      activeStroke.value = null
      const payload = emitChange(strokes.value)
      emit('end', payload)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!props.clearable || isDisabled.value) return
      if (event.key !== 'Delete' && event.key !== 'Backspace') return

      event.preventDefault()
      clear()
    }

    expose({
      clear,
      isEmpty: () => isSignatureEmpty(strokes.value),
      toDataURL,
      toSVG
    })

    const rootClasses = computed(() =>
      classNames(signatureRootClasses, props.className, coerceClassValue(attrs.class))
    )

    const rootStyle = computed(() =>
      mergeStyleValues(props.style, (attrs as Record<string, unknown>).style)
    )

    return () => {
      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )

      return h(
        'div',
        {
          ...forwardedAttrs,
          class: rootClasses.value,
          style: rootStyle.value
        },
        [
          h('div', { class: getSignatureCanvasWrapClasses(props.disabled, props.readonly) }, [
            h('canvas', {
              ref: canvasRef,
              class: signatureCanvasClasses,
              width: props.width,
              height: props.height,
              tabindex: isDisabled.value ? -1 : 0,
              role: 'img',
              'aria-label': props.ariaLabel,
              'aria-disabled': isDisabled.value || undefined,
              onPointerdown: handlePointerDown,
              onPointermove: handlePointerMove,
              onPointerup: finishStroke,
              onPointercancel: finishStroke,
              onKeydown: handleKeyDown
            })
          ]),
          props.clearable
            ? h('div', { class: signatureToolbarClasses }, [
                h(
                  'button',
                  {
                    type: 'button',
                    class: signatureClearButtonClasses,
                    disabled: isDisabled.value || isSignatureEmpty(strokes.value),
                    onClick: clear
                  },
                  resolveLocaleText('Clear', props.clearText, mergedLocale.value?.common?.clearText)
                )
              ])
            : null
        ]
      )
    }
  }
})

export default Signature
