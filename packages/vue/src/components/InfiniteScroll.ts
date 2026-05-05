import { defineComponent, h, ref, computed, watch, onMounted, onBeforeUnmount, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  shouldLoadMore,
  createInfiniteScrollObserver,
  getInfiniteScrollContainerClasses,
  infiniteScrollLoaderClasses,
  infiniteScrollEndClasses,
  infiniteScrollSentinelClasses
} from '@expcat/tigercat-core'

export interface VueInfiniteScrollProps {
  hasMore?: boolean
  loading?: boolean
  threshold?: number
  loadingText?: string
  endText?: string
  direction?: 'vertical' | 'horizontal'
  inverse?: boolean
  disabled?: boolean
  className?: string
}

export const InfiniteScroll = defineComponent({
  name: 'TigerInfiniteScroll',
  inheritAttrs: false,
  props: {
    hasMore: { type: Boolean, default: true },
    loading: { type: Boolean, default: false },
    threshold: { type: Number, default: 100 },
    loadingText: { type: String, default: 'Loading...' },
    endText: { type: String, default: 'No more data' },
    direction: {
      type: String as PropType<'vertical' | 'horizontal'>,
      default: 'vertical'
    },
    inverse: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    className: { type: String, default: undefined }
  },
  emits: ['load-more'],
  setup(props, { emit, slots, attrs }) {
    const containerRef = ref<HTMLElement | null>(null)
    const sentinelRef = ref<HTMLElement | null>(null)
    let cleanupObserver: (() => void) | null = null
    let usingFallback = false

    const containerClasses = computed(() =>
      classNames(
        getInfiniteScrollContainerClasses(props.direction, props.className),
        coerceClassValue(attrs.class)
      )
    )

    function handleLoadMore() {
      if (props.disabled || props.loading || !props.hasMore) return
      emit('load-more')
    }

    // Fallback: scroll event (when IO unavailable)
    function checkScroll() {
      if (props.disabled || props.loading || !props.hasMore) return
      const el = containerRef.value
      if (!el) return
      if (shouldLoadMore(el, props.threshold, props.direction, props.inverse)) {
        emit('load-more')
      }
    }

    function setupObserver() {
      cleanupObserver?.()
      cleanupObserver = null
      usingFallback = false

      if (props.disabled || !props.hasMore) return

      const sentinel = sentinelRef.value
      if (!sentinel) return

      const teardown = createInfiniteScrollObserver(sentinel, {
        threshold: props.threshold,
        direction: props.direction,
        root: containerRef.value,
        onLoadMore: handleLoadMore
      })

      if (teardown) {
        cleanupObserver = teardown
      } else {
        // IO unavailable — fall back to scroll events
        usingFallback = true
        containerRef.value?.addEventListener('scroll', checkScroll, { passive: true })
        cleanupObserver = () => {
          containerRef.value?.removeEventListener('scroll', checkScroll)
        }
      }
    }

    onMounted(setupObserver)

    watch(
      () => [props.hasMore, props.disabled, props.threshold, props.direction, props.inverse],
      setupObserver
    )

    onBeforeUnmount(() => {
      cleanupObserver?.()
    })

    return () => {
      const content = slots.default?.()

      const sentinel = props.hasMore
        ? h('div', {
            ref: sentinelRef,
            class: infiniteScrollSentinelClasses,
            'aria-hidden': 'true',
            style: 'height:0;overflow:hidden'
          })
        : null

      const loader = props.loading
        ? h(
            'div',
            {
              class: infiniteScrollLoaderClasses,
              role: 'status',
              'aria-live': 'polite'
            },
            slots.loader?.() ?? props.loadingText
          )
        : null

      const end =
        !props.hasMore && !props.loading
          ? h('div', { class: infiniteScrollEndClasses }, slots.end?.() ?? props.endText)
          : null

      const children = props.inverse
        ? [sentinel, loader, content, end]
        : [content, sentinel, loader, end]

      return h(
        'div',
        {
          ref: containerRef,
          class: containerClasses.value
        },
        children
      )
    }
  }
})

export default InfiniteScroll
