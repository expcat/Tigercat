import {
  defineComponent,
  h,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  inject,
  PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  imageBaseClasses,
  getImageImgClasses,
  imageErrorClasses,
  imageLoadingClasses,
  imagePreviewCursorClass,
  imageErrorIconPath,
  toCSSSize,
  type ImageFit
} from '@expcat/tigercat-core'
import type { ImageGroupContext } from './ImageGroup'

export interface VueImageProps {
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
  fit?: ImageFit
  fallbackSrc?: string
  preview?: boolean
  lazy?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const IMAGE_GROUP_INJECTION_KEY = 'tiger-image-group'

export const Image = defineComponent({
  name: 'TigerImage',
  inheritAttrs: false,
  props: {
    src: { type: String, default: undefined },
    alt: { type: String, default: '' },
    width: { type: [Number, String] as PropType<number | string>, default: undefined },
    height: { type: [Number, String] as PropType<number | string>, default: undefined },
    fit: { type: String as PropType<ImageFit>, default: 'cover' as ImageFit },
    fallbackSrc: { type: String, default: undefined },
    preview: { type: Boolean, default: true },
    lazy: { type: Boolean, default: false },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['load', 'error', 'preview-visible-change'],
  setup(props, { slots, emit, attrs }) {
    const loading = ref(true)
    const error = ref(false)
    const actualSrc = ref(props.lazy ? '' : props.src)
    const containerRef = ref<HTMLElement | null>(null)
    const previewVisible = ref(false)
    let observer: IntersectionObserver | null = null

    const group = inject<ImageGroupContext | null>(IMAGE_GROUP_INJECTION_KEY, null)

    // Registration with ImageGroup
    const registeredIndex = ref(-1)

    onMounted(() => {
      if (group && props.src) {
        registeredIndex.value = group.register(props.src)
      }

      if (props.lazy && containerRef.value) {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries[0]?.isIntersecting) {
              actualSrc.value = props.src
              observer?.disconnect()
              observer = null
            }
          },
          { threshold: 0.01 }
        )
        observer.observe(containerRef.value)
      }
    })

    onBeforeUnmount(() => {
      observer?.disconnect()
      if (group && props.src) {
        group.unregister(props.src)
      }
    })

    const handleLoad = () => {
      loading.value = false
      error.value = false
      emit('load')
    }

    const handleError = () => {
      loading.value = false
      error.value = true
      if (props.fallbackSrc && actualSrc.value !== props.fallbackSrc) {
        actualSrc.value = props.fallbackSrc
        error.value = false
        loading.value = true
      }
      emit('error')
    }

    const handleClick = () => {
      if (!props.preview) return
      if (group) {
        group.openPreview(registeredIndex.value >= 0 ? registeredIndex.value : 0)
      } else {
        previewVisible.value = true
        emit('preview-visible-change', true)
      }
    }

    const containerClasses = computed(() =>
      classNames(
        imageBaseClasses,
        props.preview && imagePreviewCursorClass,
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    const containerStyle = computed(() => {
      const base: Record<string, string | number | undefined> = {}
      const w = toCSSSize(props.width)
      const ht = toCSSSize(props.height)
      if (w) base.width = w
      if (ht) base.height = ht
      return mergeStyleValues((attrs as Record<string, unknown>).style, props.style, base)
    })

    const imgClasses = computed(() => getImageImgClasses(props.fit!))

    return () => {
      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )

      let content
      if (error.value && !props.fallbackSrc) {
        // Error state
        content = slots.error
          ? slots.error()
          : h('div', { class: imageErrorClasses }, [
              h(
                'svg',
                {
                  class: 'w-8 h-8',
                  xmlns: 'http://www.w3.org/2000/svg',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  stroke: 'currentColor'
                },
                [
                  h('path', {
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': '1.5',
                    d: imageErrorIconPath
                  })
                ]
              )
            ])
      } else if (loading.value && !actualSrc.value) {
        // Loading placeholder
        content = slots.placeholder
          ? slots.placeholder()
          : h('div', { class: imageLoadingClasses }, [
              h(
                'svg',
                {
                  class: 'w-8 h-8',
                  xmlns: 'http://www.w3.org/2000/svg',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  stroke: 'currentColor'
                },
                [
                  h('path', {
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': '1.5',
                    d: imageErrorIconPath
                  })
                ]
              )
            ])
      } else {
        // Image
        content = h('img', {
          src: actualSrc.value,
          alt: props.alt,
          class: imgClasses.value,
          onLoad: handleLoad,
          onError: handleError
        })
      }

      // Standalone preview (only when not in group)
      const previewEl =
        !group && previewVisible.value && props.src
          ? (() => {
              const { ImagePreview } = require('./ImagePreview')
              return h(ImagePreview, {
                visible: previewVisible.value,
                images: [props.src!],
                currentIndex: 0,
                'onUpdate:visible': (val: boolean) => {
                  previewVisible.value = val
                  emit('preview-visible-change', val)
                }
              })
            })()
          : null

      return h(
        'div',
        {
          ...forwardedAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: containerStyle.value,
          role: props.preview ? 'button' : undefined,
          tabindex: props.preview ? 0 : undefined,
          'aria-label': props.preview ? `Preview ${props.alt || 'image'}` : undefined,
          onClick: handleClick,
          onKeydown: (e: KeyboardEvent) => {
            if (props.preview && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              handleClick()
            }
          }
        },
        [content, previewEl]
      )
    }
  }
})

export default Image
