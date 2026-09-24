import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import {
  getAutoCompleteAlignScrollTop,
  getAutoCompleteVirtualRange,
  type VirtualRange
} from '@expcat/tigercat-core'

/** Fixed-height picker window. Arithmetic is `fixedSizeStrategy` via the auto-complete helpers. */
export function useFixedListWindow(options: {
  enabled: () => boolean
  activeIndex: () => number
  itemHeight: () => number
  viewport: () => number
  count: () => number
}): {
  scrollTop: Ref<number>
  range: ComputedRef<VirtualRange>
  activeInWindow: ComputedRef<boolean>
  onScroll: (event: Event) => void
  bindRef: (el: Element | null) => void
} {
  const scrollTop = ref(0)

  watch(
    () =>
      [
        options.enabled(),
        options.activeIndex(),
        options.itemHeight(),
        options.viewport(),
        options.count()
      ] as const,
    () => {
      if (!options.enabled()) return
      const next = getAutoCompleteAlignScrollTop(
        scrollTop.value,
        options.activeIndex(),
        options.itemHeight(),
        options.viewport()
      )
      if (next !== scrollTop.value) scrollTop.value = next
    },
    { flush: 'post' }
  )

  const range = computed(() =>
    getAutoCompleteVirtualRange(
      scrollTop.value,
      options.viewport(),
      options.count(),
      options.itemHeight()
    )
  )
  const activeInWindow = computed(() => {
    if (!options.enabled()) return true
    const index = options.activeIndex()
    const window = range.value
    return index >= window.startIndex && index <= window.endIndex
  })

  function onScroll(event: Event) {
    scrollTop.value = (event.target as HTMLElement).scrollTop
  }

  function bindRef(el: Element | null) {
    if (!(el instanceof HTMLElement)) return
    if (el.scrollTop !== scrollTop.value) el.scrollTop = scrollTop.value
  }

  return { scrollTop, range, activeInWindow, onScroll, bindRef }
}
