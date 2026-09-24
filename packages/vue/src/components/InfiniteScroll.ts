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
  createInfiniteScrollFlight,
  infiniteScrollContainerCanAdvance,
  compensateInverseScrollStart,
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
    error: { type: Boolean, default: false },
    errorText: { type: String, default: undefined },
    retryText: { type: String, default: undefined },
    threshold: { type: Number, default: 100 },
    loadingText: { type: String, default: undefined },
    endText: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    orientation: {
      type: String as PropType<'vertical' | 'horizontal'>,
      default: 'vertical'
    },
    inverse: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    height: { type: Number, default: undefined },
    root: {
      type: [Object, String] as PropType<Element | null | 'container'>,
      default: null
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
    const flight = createInfiniteScrollFlight()
    const anchorStart = ref<number | null>(null)
    let cleanupObserver: (() => void) | null = null

    const containerClasses = computed(() =>
      classNames(
        getInfiniteScrollContainerClasses(props.orientation, props.className),
        coerceClassValue(attrs.class)
      )
    )

    function beginLoad() {
      const returned = emit('load-more') as unknown
      const tasks = Array.isArray(returned) ? returned : [returned]
      const pending = tasks.filter(
        (task) => task && typeof (task as { then?: unknown }).then === 'function'
      )
      flight.begin(pending.length > 0 ? Promise.all(pending) : undefined)
    }

    function requestLoad() {
      const el = containerRef.value
      const containerRoot = props.root === 'container' || props.root === undefined
      if (containerRoot && el && !infiniteScrollContainerCanAdvance(el, props.orientation)) return
      if (
        !flight.canRequest({
          disabled: props.disabled,
          hasMore: props.hasMore,
          error: props.error,
          loading: props.loading
        })
      ) {
        return
      }
      beginLoad()
    }

    function resolveObserverRoot(): Element | null {
      if (props.root === 'container' || props.root === undefined) return containerRef.value
      return props.root
    }

    function checkScroll() {
      const el = containerRef.value
      if (!el) return
      if (shouldLoadMore(el, props.threshold, props.orientation, props.inverse, dir.value)) {
        requestLoad()
      }
    }

    function setupObserver() {
      cleanupObserver?.()
      cleanupObserver = null
      if (props.disabled || !props.hasMore) return

      const sentinel = sentinelRef.value
      if (!sentinel) return

      const observerRoot = resolveObserverRoot()
      const teardown = createInfiniteScrollObserver(sentinel, {
        threshold: props.threshold,
        orientation: props.orientation,
        root: observerRoot,
        inverse: props.inverse,
        dir: dir.value,
        onLoadMore: () => {
          flight.noteSentinel(true)
          requestLoad()
        },
        onLeave: () => flight.noteSentinel(false)
      })

      if (teardown) {
        cleanupObserver = teardown
        const el = containerRef.value
        if (observerRoot && observerRoot === el) checkScroll()
        return
      }

      const scrollTarget: EventTarget | null =
        observerRoot === null ? window : containerRef.value
      if (!scrollTarget) return
      const onScroll = () => checkScroll()
      scrollTarget.addEventListener('scroll', onScroll, { passive: true })
      checkScroll()
      cleanupObserver = () => scrollTarget.removeEventListener('scroll', onScroll)
    }

    function restoreInverseScroll() {
      if (!props.inverse) {
        anchorStart.value = null
        return
      }
      const el = containerRef.value
      if (!el) return
      const content = Array.from(el.children).find((child) => {
        if (!(child instanceof HTMLElement)) return false
        if (child.classList.contains(infiniteScrollSentinelClasses)) return false
        const role = child.getAttribute('role')
        if (role === 'status' || role === 'alert') return false
        return true
      }) as HTMLElement | undefined
      if (!content) return
      const nextStart = props.orientation === 'horizontal' ? content.offsetLeft : content.offsetTop
      const next = compensateInverseScrollStart({
        orientation: props.orientation,
        dir: dir.value,
        previousStart: anchorStart.value,
        nextStart,
        scrollTop: el.scrollTop,
        scrollLeft: el.scrollLeft
      })
      if (next.scrollTop !== el.scrollTop) el.scrollTop = next.scrollTop
      if (next.scrollLeft !== el.scrollLeft) el.scrollLeft = next.scrollLeft
      anchorStart.value = props.orientation === 'horizontal' ? content.offsetLeft : content.offsetTop
    }

    onMounted(setupObserver)
    onUpdated(restoreInverseScroll)

    watch(
      () => props.loading,
      (loading, previous) => {
        flight.noteLoading(loading, previous ?? loading)
      },
      { immediate: true }
    )

    watch(
      () => props.error,
      (error) => {
        if (error) flight.noteError()
      }
    )

    watch(
      () => [
        props.hasMore,
        props.disabled,
        props.loading,
        props.error,
        props.threshold,
        props.orientation,
        props.inverse,
        props.root,
        dir.value
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
            style: getInfiniteScrollSentinelStyle(props.orientation)
          })
        : null

      const loader = props.loading
        ? h(
            'div',
            {
              class: getInfiniteScrollChromeClasses(props.orientation, infiniteScrollLoaderClasses),
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

      const endName = resolveLocaleText(
        'No more data',
        props.endText,
        mergedLocale.value?.common?.noMoreText
      )
      const errorName = resolveLocaleText('Could not load more', props.errorText, props.errorText)
      const retryName = resolveLocaleText('Retry', props.retryText, props.retryText)
      const end =
        !props.hasMore && !props.loading && !props.error
          ? h(
              'div',
              {
                class: getInfiniteScrollChromeClasses(props.orientation, infiniteScrollEndClasses),
                role: 'status',
                'aria-live': 'polite',
                'aria-label': endName
              },
              slots.end?.() ?? endName
            )
          : null
      const error = props.error
        ? h(
            'div',
            {
              class: getInfiniteScrollChromeClasses(props.orientation, infiniteScrollEndClasses),
              role: 'alert',
              'aria-label': errorName
            },
            [
              h('span', errorName),
              h(
                'button',
                {
                  type: 'button',
                  onClick: () => {
                    flight.reset()
                    beginLoad()
                  }
                },
                retryName
              )
            ]
          )
        : null

      const chrome = [sentinel, loader, error, end]
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
