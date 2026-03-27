import { defineComponent, h, ref, computed, onMounted, onBeforeUnmount, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  shouldLoadMore,
  getInfiniteScrollContainerClasses,
  infiniteScrollLoaderClasses,
  infiniteScrollEndClasses
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

    const containerClasses = computed(() =>
      classNames(
        getInfiniteScrollContainerClasses(props.direction, props.className),
        coerceClassValue(attrs.class)
      )
    )

    function checkScroll() {
      if (props.disabled || props.loading || !props.hasMore) return
      const el = containerRef.value
      if (!el) return

      if (shouldLoadMore(el, props.threshold, props.direction, props.inverse)) {
        emit('load-more')
      }
    }

    onMounted(() => {
      containerRef.value?.addEventListener('scroll', checkScroll, {
        passive: true
      })
    })

    onBeforeUnmount(() => {
      containerRef.value?.removeEventListener('scroll', checkScroll)
    })

    return () => {
      const content = slots.default?.()

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

      const children = props.inverse ? [loader, content, end] : [content, loader, end]

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
