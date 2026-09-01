import {
  ref,
  computed,
  getCurrentScope,
  onScopeDispose,
  toValue,
  type MaybeRefOrGetter,
  type ComputedRef,
  type Ref
} from 'vue'
import {
  createChartPointerMoveScheduler,
  getChartElementOpacity,
  getChartLegendShellClasses,
  isChartActivationKey,
  nextChartSelectedIndex,
  resolveChartActiveIndex,
  resolveChartIndex,
  shouldTrackChartPointer,
  tooltipPositionFromEvent,
  type ChartLegendPosition
} from '@expcat/tigercat-core'

export interface UseChartInteractionOptions<T = unknown> {
  hoverable: MaybeRefOrGetter<boolean>
  showTooltip?: MaybeRefOrGetter<boolean | undefined>
  hoveredIndexProp?: () => number | null | undefined
  selectable: MaybeRefOrGetter<boolean>
  selectedIndexProp?: () => number | null | undefined
  activeOpacity: MaybeRefOrGetter<number>
  inactiveOpacity: MaybeRefOrGetter<number>
  legendPosition?: MaybeRefOrGetter<ChartLegendPosition | undefined>
  getData?: (index: number) => T | undefined
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onHover?: (index: number | null, datum: T | null) => void
  onClick?: (index: number, datum: T | undefined) => void
}

export interface UseChartInteractionReturn {
  tooltipPosition: Ref<{ x: number; y: number }>
  resolvedHoveredIndex: ComputedRef<number | null>
  resolvedSelectedIndex: ComputedRef<number | null>
  activeIndex: ComputedRef<number | null>
  getElementOpacity: (index: number) => number | undefined
  handleMouseEnter: (index: number, event: MouseEvent | FocusEvent | KeyboardEvent) => void
  handleMouseMove: (event: MouseEvent) => void
  handleMouseLeave: () => void
  handleClick: (index: number) => void
  handleKeyDown: (event: KeyboardEvent, index: number) => void
  handleLegendClick: (index: number) => void
  handleLegendHover: (index: number, _item?: unknown, event?: Event) => void
  handleLegendLeave: () => void
  wrapperClasses: ComputedRef<string>
}

export function useChartInteraction<T = unknown>(
  options: UseChartInteractionOptions<T>
): UseChartInteractionReturn {
  const { getData, onHoveredIndexChange, onSelectedIndexChange, onHover, onClick } = options
  const isHoverable = () => Boolean(toValue(options.hoverable))
  const isShowTooltip = () => {
    const value = options.showTooltip === undefined ? true : toValue(options.showTooltip)
    return value !== false
  }
  const isSelectable = () => Boolean(toValue(options.selectable))

  const localHoveredIndex = ref<number | null>(null)
  const localSelectedIndex = ref<number | null>(null)
  const tooltipPosition = ref({ x: 0, y: 0 })
  const tooltipScheduler = createChartPointerMoveScheduler({
    onPositionChange: (position) => {
      tooltipPosition.value = position
    }
  })

  if (getCurrentScope()) {
    onScopeDispose(() => tooltipScheduler.cancel())
  }

  const resolvedHoveredIndex = computed(() =>
    resolveChartIndex(options.hoveredIndexProp?.(), localHoveredIndex.value)
  )

  const resolvedSelectedIndex = computed(() =>
    resolveChartIndex(options.selectedIndexProp?.(), localSelectedIndex.value)
  )

  const activeIndex = computed(() =>
    resolveChartActiveIndex(resolvedSelectedIndex.value, resolvedHoveredIndex.value, isHoverable())
  )

  const getElementOpacity = (index: number): number | undefined => {
    return getChartElementOpacity(index, activeIndex.value, {
      activeOpacity: toValue(options.activeOpacity),
      inactiveOpacity: toValue(options.inactiveOpacity)
    })
  }

  const applyHover = (index: number | null, position?: { x: number; y: number }) => {
    if (!shouldTrackChartPointer(isHoverable(), isShowTooltip())) return
    if (options.hoveredIndexProp?.() === undefined) {
      localHoveredIndex.value = index
    }
    if (position) tooltipPosition.value = position
    if (!isHoverable()) return
    onHoveredIndexChange?.(index)
    onHover?.(index, index !== null ? (getData?.(index) ?? null) : null)
  }

  const handleMouseEnter = (index: number, event: MouseEvent | FocusEvent | KeyboardEvent) => {
    applyHover(index, tooltipPositionFromEvent(event))
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!shouldTrackChartPointer(isHoverable(), isShowTooltip())) return
    tooltipScheduler.schedule({ x: event.clientX, y: event.clientY })
  }

  const handleMouseLeave = () => {
    tooltipScheduler.cancel()
    applyHover(null)
  }

  const handleClick = (index: number) => {
    onClick?.(index, getData?.(index))
    if (!isSelectable()) return
    const nextIndex = nextChartSelectedIndex(resolvedSelectedIndex.value, index)
    if (options.selectedIndexProp?.() === undefined) {
      localSelectedIndex.value = nextIndex
    }
    onSelectedIndexChange?.(nextIndex)
  }

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    if (!isChartActivationKey(event.key)) return
    event.preventDefault()
    if (shouldTrackChartPointer(isHoverable(), isShowTooltip())) {
      applyHover(index, tooltipPositionFromEvent(event))
    }
    handleClick(index)
  }

  const handleLegendClick = (index: number) => {
    handleClick(index)
  }

  const handleLegendHover = (index: number, _item?: unknown, event?: Event) => {
    applyHover(index, event ? tooltipPositionFromEvent(event) : undefined)
  }

  const handleLegendLeave = () => {
    handleMouseLeave()
  }

  const wrapperClasses = computed(() =>
    getChartLegendShellClasses(toValue(options.legendPosition) ?? 'bottom')
  )

  return {
    tooltipPosition,
    resolvedHoveredIndex,
    resolvedSelectedIndex,
    activeIndex,
    getElementOpacity,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleKeyDown,
    handleLegendClick,
    handleLegendHover,
    handleLegendLeave,
    wrapperClasses
  }
}
