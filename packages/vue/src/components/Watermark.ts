import { defineComponent, computed, h, onMounted, onBeforeUnmount, ref, watch, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  watermarkDefaults,
  watermarkWrapperClasses,
  resolveWatermarkFont,
  createWatermarkRenderController,
  getWatermarkOverlayStyle,
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
    const wrapperRef = ref<HTMLElement | null>(null)
    let renderController: WatermarkRenderController | undefined

    const resolvedFont = computed(() => resolveWatermarkFont(props.font))

    const generate = () => {
      renderController?.render()
    }

    onMounted(() => {
      if (!wrapperRef.value) return

      renderController = createWatermarkRenderController({
        getRenderOptions: () => ({
          content: props.content,
          image: props.image,
          width: props.width,
          height: props.height,
          rotate: props.rotate,
          font: resolvedFont.value
        }),
        onRender: (base64Url) => {
          base64.value = base64Url
        }
      })
      renderController.observe(wrapperRef.value)
      renderController.render()
    })

    watch(
      () => [props.content, props.image, props.width, props.height, props.rotate, props.font],
      generate
    )

    // MutationObserver: re-apply if the overlay is removed externally
    let observer: MutationObserver | undefined
    onMounted(() => {
      if (typeof MutationObserver === 'undefined' || !wrapperRef.value) return
      observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const node of Array.from(m.removedNodes)) {
            if ((node as HTMLElement).dataset?.watermark === 'true') {
              generate()
              return
            }
          }
        }
      })
      observer.observe(wrapperRef.value, { childList: true })
    })
    onBeforeUnmount(() => {
      observer?.disconnect()
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
            'aria-hidden': 'true',
            style: overlayStyle.value
          })
        ]
      )
    }
  }
})

export default Watermark
