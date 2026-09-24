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
  createChartInteractionHandlers,
  createChartPointerMoveScheduler,
  getChartElementOpacity,
  getChartLegendShellClasses,
  isChartActivationKey,
  resolveChartActiveIndex,
  resolveChartIndex,
  shouldTrackChartPointer,
  toggleLegendHidden,
  isLegendHidden,
  tooltipPositionFromEvent,
  type ChartInteractionState,
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
  legendHiddenKeys: Ref<string[]>
  isLegendIndexHidden: (index: number) => boolean
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
  const legendHiddenKeys = ref<string[]>([])
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

  const state: ChartInteractionState = {
    get hoveredIndex() {
      return localHoveredIndex.value
    },
    set hoveredIndex(value) {
      localHoveredIndex.value = value
    },
    get selectedIndex() {
      return localSelectedIndex.value
    },
    set selectedIndex(value) {
      localSelectedIndex.value = value
    }
  }

  const handlersFor = () => {
    const hovered = options.hoveredIndexProp?.()
    const selected = options.selectedIndexProp?.()
    return createChartInteractionHandlers([], state, {
      hoverable: isHoverable(),
      showTooltip: isShowTooltip(),
      selectable: isSelectable(),
      hoveredIndex: hovered,
      selectedIndex: selected,
      onHoverChange: (index, datum) => {
        onHoveredIndexChange?.(index)
        onHover?.(index, datum)
      },
      onSelectChange: (index) => onSelectedIndexChange?.(index),
      onItemClick: (index, datum) => onClick?.(index, datum)
    })
  }

  const handleMouseEnter = (index: number, event: MouseEvent | FocusEvent | KeyboardEvent) => {
    const position = tooltipPositionFromEvent(event)
    if (shouldTrackChartPointer(isHoverable(), isShowTooltip())) {
      tooltipPosition.value = position
    }
    handlersFor().onMouseEnter(index, getData?.(index), position)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!shouldTrackChartPointer(isHoverable(), isShowTooltip())) return
    tooltipScheduler.schedule({ x: event.clientX, y: event.clientY })
  }

  const handleMouseLeave = () => {
    tooltipScheduler.cancel()
    handlersFor().onMouseLeave()
  }

  const handleClick = (index: number) => {
    handlersFor().onClick(index, getData?.(index))
  }

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    if (!isChartActivationKey(event.key)) return
    const position = tooltipPositionFromEvent(event)
    if (shouldTrackChartPointer(isHoverable(), isShowTooltip())) {
      tooltipPosition.value = position
    }
    handlersFor().onKeyDown(event, index, getData?.(index), position)
  }

  const handleLegendClick = (index: number) => {
    legendHiddenKeys.value = toggleLegendHidden(legendHiddenKeys.value, String(index))
  }

  const isLegendIndexHidden = (index: number) => isLegendHidden(legendHiddenKeys.value, String(index))

  const handleLegendHover = (index: number, _item?: unknown, event?: Event) => {
    const position = event ? tooltipPositionFromEvent(event) : undefined
    if (position && shouldTrackChartPointer(isHoverable(), isShowTooltip())) {
      tooltipPosition.value = position
    }
    handlersFor().onMouseEnter(index, getData?.(index), position)
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
    wrapperClasses,
    legendHiddenKeys,
    isLegendIndexHidden
  }
}
