import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  onUpdated,
  PropType,
  type CSSProperties
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  shouldLoadMore,
  createInfiniteScrollObserver,
  resolveLocaleText,
  mergeTigerLocale,
  getInfiniteScrollContainerClasses,
  getInfiniteScrollSentinelStyle,
  getInfiniteScrollChromeClasses,
  infiniteScrollLoaderClasses,
  infiniteScrollEndClasses,
  infiniteScrollSentinelClasses,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export type VueInfiniteScrollProps = InstanceType<typeof InfiniteScroll>['$props']
export type InfiniteScrollProps = VueInfiniteScrollProps

export const InfiniteScroll = defineComponent({
  name: 'TigerInfiniteScroll',
  inheritAttrs: false,
  props: {
    hasMore: { type: Boolean, default: true },
    loading: { type: Boolean, default: false },
    threshold: { type: Number, default: 100 },
    loadingText: { type: String, default: undefined },
    endText: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    direction: {
      type: String as PropType<'vertical' | 'horizontal'>,
      default: 'vertical'
    },
    inverse: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    height: { type: Number, default: undefined },
    root: {
      type: [Object, String] as PropType<Element | null | 'container'>,
      default: 'container'
    },
    className: { type: String, default: undefined }
  },
  emits: ['load-more'],
  setup(props, { emit, slots, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const dir = computed(() => (config.value.direction === 'rtl' ? 'rtl' : 'ltr'))
    const containerRef = ref<HTMLElement | null>(null)
    const sentinelRef = ref<HTMLElement | null>(null)
    let cleanupObserver: (() => void) | null = null
    let pending = false
    let wasLoading = props.loading
    let prevScrollHeight: number | null = null

    const containerClasses = computed(() =>
      classNames(
        getInfiniteScrollContainerClasses(props.direction, props.className),
        coerceClassValue(attrs.class)
      )
    )

    function requestLoad() {
      if (props.disabled || props.loading || !props.hasMore || pending) return
      pending = true
      emit('load-more')
    }

    function syncPendingFromLoading() {
      if (wasLoading && !props.loading) pending = false
      if (props.loading) pending = true
      wasLoading = props.loading
    }

    function resolveObserverRoot(): Element | null {
      if (props.root === 'container' || props.root === undefined) return containerRef.value
      return props.root
    }

    function checkScroll() {
      const el = containerRef.value
      if (!el) return
      if (shouldLoadMore(el, props.threshold, props.direction, props.inverse, dir.value)) {
        requestLoad()
      }
    }

    function setupObserver() {
      cleanupObserver?.()
      cleanupObserver = null
      syncPendingFromLoading()
      if (props.disabled || !props.hasMore) return

      const sentinel = sentinelRef.value
      if (!sentinel) return

      const observerRoot = resolveObserverRoot()
      const teardown = createInfiniteScrollObserver(sentinel, {
        threshold: props.threshold,
        direction: props.direction,
        root: observerRoot,
        inverse: props.inverse,
        onLoadMore: requestLoad
      })

      if (teardown) {
        cleanupObserver = teardown
        if (observerRoot && observerRoot === containerRef.value) checkScroll()
        return
      }

      containerRef.value?.addEventListener('scroll', checkScroll, { passive: true })
      checkScroll()
      cleanupObserver = () => {
        containerRef.value?.removeEventListener('scroll', checkScroll)
      }
    }

    function restoreInverseScroll() {
      if (!props.inverse) return
      const el = containerRef.value
      if (!el) return
      const next = el.scrollHeight
      if (prevScrollHeight != null && next !== prevScrollHeight) {
        el.scrollTop += next - prevScrollHeight
      }
      prevScrollHeight = next
    }

    onMounted(setupObserver)
    onUpdated(restoreInverseScroll)

    watch(
      () => [
        props.hasMore,
        props.disabled,
        props.loading,
        props.threshold,
        props.direction,
        props.inverse,
        props.root
      ],
      setupObserver,
      { flush: 'post' }
    )

    onBeforeUnmount(() => {
      cleanupObserver?.()
    })

    return () => {
      const { class: _attrClass, style: attrStyle, ...restAttrs } = attrs as Record<string, unknown>
      const content = slots.default?.()

      const sentinel = props.hasMore
        ? h('div', {
            ref: sentinelRef,
            class: infiniteScrollSentinelClasses,
            'aria-hidden': 'true',
            style: getInfiniteScrollSentinelStyle(props.direction)
          })
        : null

      const loader = props.loading
        ? h(
            'div',
            {
              class: getInfiniteScrollChromeClasses(props.direction, infiniteScrollLoaderClasses),
              role: 'status',
              'aria-live': 'polite'
            },
            slots.loader?.() ??
              resolveLocaleText(
                'Loading...',
                props.loadingText,
                mergedLocale.value?.common?.loadingText
              )
          )
        : null

      const end =
        !props.hasMore && !props.loading
          ? h(
              'div',
              {
                class: getInfiniteScrollChromeClasses(props.direction, infiniteScrollEndClasses),
                'aria-live': 'polite'
              },
              slots.end?.() ??
                resolveLocaleText(
                  'No more data',
                  props.endText,
                  mergedLocale.value?.common?.noMoreText
                )
            )
          : null

      const chrome = [sentinel, loader, end]
      const children = props.inverse ? [...chrome, content] : [content, ...chrome]

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          class: containerClasses.value,
          style: mergeStyleValues(
            attrStyle,
            props.height !== undefined ? { height: `${props.height}px` } : undefined
          ) as CSSProperties,
          'aria-busy': props.loading || undefined
        },
        children
      )
    }
  }
})

export default InfiniteScroll
