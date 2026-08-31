import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  inject,
  useId,
  PropType
} from 'vue'
import {
  applyImageLoadError,
  applyImageLoadSuccess,
  classNames,
  coerceClassValue,
  createImageLoadState,
  formatImagePreviewAriaLabel,
  getImageImgClasses,
  getImageLabels,
  imageBaseClasses,
  imageErrorClasses,
  imageErrorIconPath,
  imageFrameClasses,
  imageLoadingClasses,
  imageLoadingOverlayClasses,
  imageLoadingSpinnerClasses,
  imageLoadingSpinnerPath,
  imagePreviewCursorClass,
  imagePreviewHostClasses,
  isImageHoverPreviewEnabled,
  mergeStyleValues,
  resetImageLoadState,
  resolveImageHoverPlacement,
  resolveImagePreviewEnabled,
  resolveImagePreviewSrc,
  toCSSSize,
  type ImageFit,
  type ImagePreviewTrigger
} from '@expcat/tigercat-core'
import { usePopup } from '../utils/use-popup'
import { renderVueOverlayTeleport } from '../utils/overlay'
import { IMAGE_GROUP_INJECTION_KEY, type ImageGroupContext } from './ImageGroup'
import { ImagePreview } from './ImagePreview'
import { useTigerConfig } from './ConfigProvider'

export interface VueImageProps {
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
  fit?: ImageFit
  fallbackSrc?: string
  preview?: boolean
  previewTrigger?: ImagePreviewTrigger
  lazy?: boolean
  srcSet?: string
  sizes?: string
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
  decoding?: 'async' | 'auto' | 'sync'
  referrerPolicy?: string
  fetchPriority?: 'high' | 'low' | 'auto'
  className?: string
  style?: Record<string, string | number>
}

function invokeListener(handler: unknown, event: Event): void {
  if (typeof handler === 'function') {
    handler(event)
    return
  }
  if (Array.isArray(handler)) {
    for (const fn of handler) {
      if (typeof fn === 'function') fn(event)
    }
  }
}

function renderErrorIcon() {
  return h(
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
}

function renderLoadingSpinner() {
  return h(
    'svg',
    {
      class: imageLoadingSpinnerClasses,
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      'aria-hidden': true
    },
    [
      h('circle', {
        class: 'opacity-25',
        cx: '12',
        cy: '12',
        r: '10',
        stroke: 'currentColor',
        'stroke-width': '4',
        fill: 'none'
      }),
      h('path', {
        class: 'opacity-75',
        fill: 'currentColor',
        d: imageLoadingSpinnerPath
      })
    ]
  )
}

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
    previewTrigger: {
      type: String as PropType<ImagePreviewTrigger>,
      default: 'click' as ImagePreviewTrigger
    },
    lazy: { type: Boolean, default: false },
    srcSet: { type: String, default: undefined },
    sizes: { type: String, default: undefined },
    crossOrigin: {
      type: String as PropType<'' | 'anonymous' | 'use-credentials'>,
      default: undefined
    },
    decoding: { type: String as PropType<'async' | 'auto' | 'sync'>, default: undefined },
    referrerPolicy: { type: String, default: undefined },
    fetchPriority: { type: String as PropType<'high' | 'low' | 'auto'>, default: undefined },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['load', 'error', 'preview-open-change', 'click', 'keydown', 'focus', 'blur'],
  setup(props, { slots, emit, attrs, expose }) {
    const config = useTigerConfig()
    const loadState = ref(createImageLoadState(props.src, props.lazy))
    const containerRef = ref<HTMLElement | null>(null)
    const imgRef = ref<HTMLImageElement | null>(null)
    const previewVisible = ref(false)
    const inView = ref(!props.lazy)
    let observer: IntersectionObserver | null = null
    const instanceId = `tiger-image-${useId()}`

    const group = inject<ImageGroupContext | null>(IMAGE_GROUP_INJECTION_KEY, null)

    const previewEnabled = computed(() => resolveImagePreviewEnabled(props.preview, group?.preview))
    const hoverPreviewEnabled = computed(() =>
      isImageHoverPreviewEnabled(previewEnabled.value, props.previewTrigger, Boolean(group))
    )
    const clickPreviewEnabled = computed(() => previewEnabled.value)
    const hoverPlacement = computed(() => resolveImageHoverPlacement(config.value.direction))

    const floatingPopupProps = {
      get trigger() {
        return 'hover' as const
      },
      get placement() {
        return hoverPlacement.value
      },
      get offset() {
        return 12
      },
      get disabled() {
        return !hoverPreviewEnabled.value
      }
    }
    const {
      currentVisible: hoverVisible,
      triggerRef: hoverTriggerRef,
      floatingRef: hoverFloatingRef,
      floatingStyles: hoverFloatingStyles,
      floatingClasses: hoverFloatingClasses,
      positioned: hoverPositioned,
      overlayTarget: hoverOverlayTarget,
      setVisible: setHoverVisible,
      triggerHandlers: hoverTriggerHandlers
    } = usePopup({
      props: floatingPopupProps,
      emit: () => {}
    })

    const setContainerRef = (el: unknown) => {
      containerRef.value = el as HTMLElement | null
      hoverTriggerRef.value = el as HTMLElement | null
    }

    const disconnectObserver = () => {
      observer?.disconnect()
      observer = null
    }

    const observeLazy = () => {
      disconnectObserver()
      if (!props.lazy || inView.value || !containerRef.value) return
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) return
          inView.value = true
          loadState.value = resetImageLoadState(props.src, true, true)
          disconnectObserver()
        },
        { threshold: 0.01 }
      )
      observer.observe(containerRef.value)
    }

    watch(
      () => [props.src, props.lazy] as const,
      () => {
        if (!props.lazy) {
          inView.value = true
          loadState.value = resetImageLoadState(props.src, false, true)
          disconnectObserver()
          return
        }
        loadState.value = resetImageLoadState(props.src, true, inView.value)
        if (!inView.value) observeLazy()
      }
    )

    watch(
      () => [group, props.src, props.alt] as const,
      () => {
        if (!group) return
        if (!props.src) {
          group.unregister(instanceId)
          return
        }
        group.register({ id: instanceId, src: props.src, alt: props.alt })
      },
      { immediate: true }
    )

    watch(containerRef, () => {
      if (props.lazy && !inView.value) observeLazy()
    })

    onMounted(() => {
      if (props.lazy && !inView.value) observeLazy()
    })

    onBeforeUnmount(() => {
      disconnectObserver()
      group?.unregister(instanceId)
    })

    expose({
      img: imgRef
    })

    const handleLoad = (event: Event) => {
      loadState.value = applyImageLoadSuccess(loadState.value)
      emit('load', event)
    }

    const handleError = (event: Event) => {
      loadState.value = applyImageLoadError(loadState.value, props.fallbackSrc)
      emit('error', event)
    }

    const handleClick = (event: MouseEvent) => {
      invokeListener(attrs.onClick, event)
      emit('click', event)
      if (event.defaultPrevented || !clickPreviewEnabled.value) return
      if (group) {
        group.openPreview(instanceId)
        return
      }
      previewVisible.value = true
      emit('preview-open-change', true)
    }

    const handleKeydown = (event: KeyboardEvent) => {
      invokeListener(attrs.onKeydown, event)
      emit('keydown', event)
    }

    const handleFocus = (event: FocusEvent) => {
      invokeListener(attrs.onFocus, event)
      emit('focus', event)
      if (hoverPreviewEnabled.value) setHoverVisible(true)
    }

    const handleBlur = (event: FocusEvent) => {
      invokeListener(attrs.onBlur, event)
      emit('blur', event)
      if (hoverPreviewEnabled.value) setHoverVisible(false)
    }

    const containerClasses = computed(() =>
      classNames(
        previewEnabled.value ? imagePreviewHostClasses : imageBaseClasses,
        previewEnabled.value && imagePreviewCursorClass,
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

    const imgClasses = computed(() => getImageImgClasses(props.fit ?? 'cover'))

    return () => {
      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(
          ([key]) =>
            key !== 'class' &&
            key !== 'style' &&
            key !== 'onClick' &&
            key !== 'onKeydown' &&
            key !== 'onFocus' &&
            key !== 'onBlur' &&
            key !== 'onFocusin' &&
            key !== 'onFocusout'
        )
      )

      const labels = getImageLabels(config.value.locale)
      const previewSrc = resolveImagePreviewSrc(loadState.value, props.src)
      const previewName = formatImagePreviewAriaLabel(
        labels.previewAriaLabel,
        props.alt,
        labels.previewFallbackAlt
      )
      const loadingPlaceholder = slots.placeholder
        ? slots.placeholder()
        : [
            h(
              'div',
              {
                class: loadState.value.actualSrc ? imageLoadingOverlayClasses : imageLoadingClasses
              },
              [renderLoadingSpinner()]
            )
          ]
      const errorPlaceholder = slots.error
        ? slots.error()
        : [h('div', { class: imageErrorClasses }, [renderErrorIcon()])]

      let content
      if (loadState.value.error) {
        content = errorPlaceholder
      } else if (!loadState.value.actualSrc) {
        content = loadingPlaceholder
      } else {
        content = [
          h('img', {
            ref: imgRef,
            src: loadState.value.actualSrc,
            alt: previewEnabled.value ? '' : props.alt,
            class: imgClasses.value,
            srcset: props.srcSet,
            sizes: props.sizes,
            crossorigin: props.crossOrigin,
            decoding: props.decoding,
            referrerpolicy: props.referrerPolicy,
            fetchpriority: props.fetchPriority,
            onLoad: handleLoad,
            onError: handleError
          }),
          loadState.value.loading ? loadingPlaceholder : null
        ]
      }

      const previewEl =
        !group && previewVisible.value && previewSrc
          ? h(ImagePreview, {
              open: previewVisible.value,
              images: [{ src: previewSrc, alt: props.alt }],
              currentIndex: 0,
              'onUpdate:open': (val: boolean) => {
                previewVisible.value = val
                emit('preview-open-change', val)
              }
            })
          : null

      const hoverPreviewEl =
        hoverPreviewEnabled.value && hoverVisible.value && previewSrc
          ? renderVueOverlayTeleport(
              h(
                'div',
                {
                  ref: hoverFloatingRef,
                  style: hoverFloatingStyles.value,
                  'data-positioned': hoverPositioned.value,
                  'aria-hidden': true,
                  class: classNames(
                    hoverFloatingClasses.value,
                    'rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] p-1 shadow-lg'
                  )
                },
                [
                  h('img', {
                    src: previewSrc,
                    alt: '',
                    class: 'block max-w-[16rem] max-h-[16rem] object-contain'
                  })
                ]
              ),
              hoverOverlayTarget.value
            )
          : null

      const hostTag = previewEnabled.value ? 'button' : 'div'
      const inner = previewEnabled.value
        ? h('span', { class: imageFrameClasses }, content)
        : content

      return h(
        hostTag,
        {
          ...forwardedAttrs,
          ref: setContainerRef,
          class: containerClasses.value,
          style: containerStyle.value,
          type: previewEnabled.value ? 'button' : undefined,
          'aria-label': previewEnabled.value ? previewName : undefined,
          onClick: handleClick,
          onKeydown: handleKeydown,
          onFocus: handleFocus,
          onBlur: handleBlur,
          ...(hoverPreviewEnabled.value ? hoverTriggerHandlers.value : {})
        },
        [inner, previewEl, hoverPreviewEl]
      )
    }
  }
})

export default Image
