import { defineComponent, h, type PropType } from 'vue'
import {
  coerceClassValue,
  resolveLightboxScaleRange,
  type ImageLightboxItem,
  type ImageViewerProps as CoreImageViewerProps,
  type TigerLocale
} from '@expcat/tigercat-core'
import { ImagePreview } from './ImagePreview'

export interface VueImageViewerProps extends Omit<CoreImageViewerProps, 'images'> {
  images?: ImageLightboxItem[]
}

/**
 * Configuration alias of ImagePreview. Same dialog tree; `minZoom`/`maxZoom`
 * map onto `minScale`/`maxScale`.
 */
export const ImageViewer = defineComponent({
  name: 'TigerImageViewer',
  inheritAttrs: false,
  props: {
    images: {
      type: Array as PropType<ImageLightboxItem[]>,
      required: true
    },
    open: { type: Boolean, default: undefined },
    currentIndex: { type: Number, default: 0 },
    zIndex: { type: Number, default: undefined },
    maskClosable: { type: Boolean, default: true },
    scaleStep: { type: Number, default: undefined },
    minScale: { type: Number, default: undefined },
    maxScale: { type: Number, default: undefined },
    minZoom: { type: Number, default: undefined },
    maxZoom: { type: Number, default: undefined },
    touchSwipeable: { type: Boolean, default: true },
    touchSwipeThreshold: { type: Number, default: 48 },
    zoomable: { type: Boolean, default: true },
    rotatable: { type: Boolean, default: true },
    showNav: { type: Boolean, default: true },
    showCounter: { type: Boolean, default: true },
    className: { type: String, default: undefined },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  emits: ['update:open', 'update:currentIndex', 'close', 'scale-change'],
  setup(props, { emit, attrs }) {
    return () => {
      const scaleRange = resolveLightboxScaleRange({
        minScale: props.minScale,
        maxScale: props.maxScale,
        minZoom: props.minZoom,
        maxZoom: props.maxZoom
      })

      return h(ImagePreview, {
        ...attrs,
        images: props.images,
        open: props.open,
        currentIndex: props.currentIndex,
        zIndex: props.zIndex,
        maskClosable: props.maskClosable,
        scaleStep: props.scaleStep,
        minScale: scaleRange.minScale,
        maxScale: scaleRange.maxScale,
        touchSwipeable: props.touchSwipeable,
        touchSwipeThreshold: props.touchSwipeThreshold,
        zoomable: props.zoomable,
        rotatable: props.rotatable,
        showNav: props.showNav,
        showCounter: props.showCounter,
        className: props.className,
        locale: props.locale,
        class: coerceClassValue(attrs.class),
        'onUpdate:open': (next: boolean) => {
          emit('update:open', next)
          if (!next) emit('close')
        },
        'onUpdate:currentIndex': (next: number) => {
          emit('update:currentIndex', next)
        },
        onScaleChange: (next: number) => {
          emit('scale-change', next)
        }
      })
    }
  }
})

export default ImageViewer
