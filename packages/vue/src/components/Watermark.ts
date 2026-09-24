import { defineComponent, computed, h, onMounted, onBeforeUnmount, ref, watch, PropType } from 'vue'
import { useTigerConfig } from './ConfigProvider'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  watermarkDefaults,
  watermarkWrapperClasses,
  resolveWatermarkFont,
  createWatermarkRenderController,
  getWatermarkLabels,
  getWatermarkOverlayStyle,
  mergeTigerLocale,
  paintWatermark,
  watermarkOverlayClasses,
  type WatermarkRenderController,
  type WatermarkFont
} from '@expcat/tigercat-core'

export interface VueWatermarkProps {
  content?: string | string[]
  image?: string
  width?: number
  height?: number
  rotate?: number
  zIndex?: number
  gapX?: number
  gapY?: number
  offsetX?: number
  offsetY?: number
  font?: WatermarkFont
  className?: string
  style?: Record<string, string | number>
}

export const Watermark = defineComponent({
  name: 'TigerWatermark',
  inheritAttrs: false,
  props: {
    content: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined
    },
    image: {
      type: String,
      default: undefined
    },
    width: { type: Number, default: watermarkDefaults.width },
    height: { type: Number, default: watermarkDefaults.height },
    rotate: { type: Number, default: watermarkDefaults.rotate },
    zIndex: { type: Number, default: watermarkDefaults.zIndex },
    gapX: { type: Number, default: watermarkDefaults.gapX },
    gapY: { type: Number, default: watermarkDefaults.gapY },
    offsetX: { type: Number, default: watermarkDefaults.offsetX },
    offsetY: { type: Number, default: watermarkDefaults.offsetY },
    font: {
      type: Object as PropType<WatermarkFont>,
      default: undefined
    },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const base64 = ref<string | undefined>()
    const imageFailed = ref(false)
    const config = useTigerConfig()
    const wrapperRef = ref<HTMLElement | null>(null)
    let renderController: WatermarkRenderController | undefined

    onMounted(() => {
      if (!wrapperRef.value) return

      renderController = createWatermarkRenderController({
        getRenderOptions: () => ({
          content: props.content,
          image: props.image,
          width: props.width,
          height: props.height,
          gapX: props.gapX,
          gapY: props.gapY,
          rotate: props.rotate,
          font: resolveWatermarkFont(props.font)
        }),
        render: async (options) => {
          const painted = await paintWatermark(options)
          imageFailed.value = painted.imageFailed
          return painted.url
        },
        onRender: (base64Url) => {
          base64.value = base64Url
        }
      })
      renderController.observe(wrapperRef.value)
      renderController.render()
    })

    watch(
      () => [
        props.content,
        props.image,
        props.width,
        props.height,
        props.rotate,
        props.gapX,
        props.gapY,
        props.font?.color,
        props.font?.fontSize,
        props.font?.fontFamily,
        props.font?.fontWeight
      ],
      () => {
        renderController?.render()
      }
    )

    onBeforeUnmount(() => {
      renderController?.disconnect()
      renderController = undefined
    })

    const overlayStyle = computed(() =>
      getWatermarkOverlayStyle({
        base64Url: base64.value,
        width: props.width,
        height: props.height,
        gapX: props.gapX,
        gapY: props.gapY,
        offsetX: props.offsetX,
        offsetY: props.offsetY,
        zIndex: props.zIndex
      })
    )

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      return h(
        'div',
        {
          ...attrs,
          ref: wrapperRef,
          class: classNames(
            watermarkWrapperClasses,
            props.className,
            coerceClassValue(attrsRecord.class)
          ),
          style: mergeStyleValues(attrsRecord.style, props.style)
        },
        [
          slots.default?.(),
          h('div', {
            'data-watermark': 'true',
            class: watermarkOverlayClasses,
            'aria-hidden': 'true',
            style: overlayStyle.value
          }),
          imageFailed.value
            ? h(
                'p',
                { class: 'text-sm text-[var(--tiger-text-secondary)]' },
                getWatermarkLabels(mergeTigerLocale(config.value.locale)).imageErrorText
              )
            : null
        ]
      )
    }
  }
})

export default Watermark
