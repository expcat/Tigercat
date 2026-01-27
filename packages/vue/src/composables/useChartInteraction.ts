import { ref, computed, type Ref, type ComputedRef } from 'vue'
import {
  classNames,
  getChartElementOpacity,
  type ChartLegendItem,
  type ChartLegendPosition
} from '@expcat/tigercat-core'

/**
 * Options for useChartInteraction composable
 */
export interface UseChartInteractionOptions<T = unknown> {
  /** Enable hover highlight */
  hoverable: boolean | Ref<boolean>
  /** Controlled hovered index from props */
  hoveredIndexProp?: number | null
  /** Enable click selection */
  selectable: boolean | Ref<boolean>
  /** Controlled selected index from props */
  selectedIndexProp?: number | null
  /** Opacity for active element */
  activeOpacity: number | Ref<number>
  /** Opacity for inactive elements */
  inactiveOpacity: number | Ref<number>
  /** Legend position for wrapper classes */
  legendPosition?: ChartLegendPosition | Ref<ChartLegendPosition | undefined>
  /** Emit function from setup context */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit: (event: string, ...args: any[]) => void
  /** Get data item by index */
  getData?: (index: number) => T | undefined
  /** Custom event names */
  eventNames?: {
    hover?: string
    click?: string
  }
}

/**
 * Return type for useChartInteraction
 */
export interface UseChartInteractionReturn {
  /** Local hovered index state */
  localHoveredIndex: Ref<number | null>
  /** Local selected index state */
  localSelectedIndex: Ref<number | null>
  /** Tooltip position state */
  tooltipPosition: Ref<{ x: number; y: number }>
  /** Resolved hovered index (controlled or uncontrolled) */
  resolvedHoveredIndex: ComputedRef<number | null>
  /** Resolved selected index (controlled or uncontrolled) */
  resolvedSelectedIndex: ComputedRef<number | null>
  /** Current active index for highlighting */
  activeIndex: ComputedRef<number | null>
  /** Get element opacity based on active state */
  getElementOpacity: (index: number) => number | undefined
  /** Handle mouse enter on chart element */
  handleMouseEnter: (index: number, event: MouseEvent) => void
  /** Handle mouse move for tooltip */
  handleMouseMove: (event: MouseEvent) => void
  /** Handle mouse leave */
  handleMouseLeave: () => void
  /** Handle click on chart element */
  handleClick: (index: number) => void
  /** Handle keydown for accessibility */
  handleKeyDown: (event: KeyboardEvent, index: number) => void
  /** Handle legend item click */
  handleLegendClick: (index: number) => void
  /** Handle legend item hover */
  handleLegendHover: (index: number) => void
  /** Handle legend item leave */
  handleLegendLeave: () => void
  /** Wrapper classes for legend layout */
  wrapperClasses: ComputedRef<string>
  /** Create legend items from data */
  createLegendItems: (
    items: Array<{ label?: string; color?: string; x?: unknown }>,
    palette: string[],
    labelFormatter?: (item: unknown, index: number) => string
  ) => ChartLegendItem[]
}

/**
 * Helper to unwrap ref value
 */
function unref<T>(value: T | Ref<T>): T {
  return (value as Ref<T>)?.value !== undefined ? (value as Ref<T>).value : (value as T)
}

/**
 * Composable for chart interaction state and handlers
 * Extracts common interaction logic from high-level chart components
 */
export function useChartInteraction<T = unknown>(
  options: UseChartInteractionOptions<T>
): UseChartInteractionReturn {
  const { emit, getData, eventNames } = options

  // Local state
  const localHoveredIndex = ref<number | null>(null)
  const localSelectedIndex = ref<number | null>(null)
  const tooltipPosition = ref({ x: 0, y: 0 })

  // Resolved indices (controlled vs uncontrolled)
  const resolvedHoveredIndex = computed(() =>
    options.hoveredIndexProp !== undefined ? options.hoveredIndexProp : localHoveredIndex.value
  )

  const resolvedSelectedIndex = computed(() =>
    options.selectedIndexProp !== undefined ? options.selectedIndexProp : localSelectedIndex.value
  )

  // Active index for highlighting
  const activeIndex = computed(() => {
    if (resolvedSelectedIndex.value !== null) return resolvedSelectedIndex.value
    if (unref(options.hoverable) && resolvedHoveredIndex.value !== null) {
      return resolvedHoveredIndex.value
    }
    return null
  })

  // Get element opacity
  const getElementOpacity = (index: number): number | undefined => {
    return getChartElementOpacity(index, activeIndex.value, {
      activeOpacity: unref(options.activeOpacity),
      inactiveOpacity: unref(options.inactiveOpacity)
    })
  }

  // Event handlers
  const handleMouseEnter = (index: number, event: MouseEvent) => {
    if (!unref(options.hoverable)) return
    if (options.hoveredIndexProp === undefined) {
      localHoveredIndex.value = index
    }
    tooltipPosition.value = { x: event.clientX, y: event.clientY }
    emit('update:hoveredIndex', index)
    if (eventNames?.hover && getData) {
      emit(eventNames.hover, index, getData(index))
    }
  }

  const handleMouseMove = (event: MouseEvent) => {
    tooltipPosition.value = { x: event.clientX, y: event.clientY }
  }

  const handleMouseLeave = () => {
    if (!unref(options.hoverable)) return
    if (options.hoveredIndexProp === undefined) {
      localHoveredIndex.value = null
    }
    emit('update:hoveredIndex', null)
    if (eventNames?.hover) {
      emit(eventNames.hover, null, null)
    }
  }

  const handleClick = (index: number) => {
    if (!unref(options.selectable)) return
    const nextIndex = resolvedSelectedIndex.value === index ? null : index
    if (options.selectedIndexProp === undefined) {
      localSelectedIndex.value = nextIndex
    }
    emit('update:selectedIndex', nextIndex)
    if (eventNames?.click && getData) {
      emit(eventNames.click, index, getData(index))
    }
  }

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    if (!unref(options.selectable)) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleClick(index)
  }

  // Legend handlers
  const handleLegendClick = (index: number) => {
    handleClick(index)
  }

  const handleLegendHover = (index: number) => {
    if (!unref(options.hoverable)) return
    if (options.hoveredIndexProp === undefined) {
      localHoveredIndex.value = index
    }
    emit('update:hoveredIndex', index)
  }

  const handleLegendLeave = () => {
    handleMouseLeave()
  }

  // Wrapper classes for legend layout
  const wrapperClasses = computed(() => {
    const position = unref(options.legendPosition) ?? 'bottom'
    return classNames(
      'inline-flex',
      position === 'right'
        ? 'flex-row items-start gap-4'
        : position === 'left'
          ? 'flex-row-reverse items-start gap-4'
          : position === 'top'
            ? 'flex-col-reverse gap-2'
            : 'flex-col gap-2'
    )
  })

  // Helper to create legend items
  const createLegendItems = (
    items: Array<{ label?: string; color?: string; x?: unknown }>,
    palette: string[],
    labelFormatter?: (item: unknown, index: number) => string
  ): ChartLegendItem[] => {
    return items.map((item, index) => ({
      index,
      label: labelFormatter ? labelFormatter(item, index) : (item.label ?? String(item.x ?? index)),
      color: item.color ?? palette[index % palette.length],
      active: activeIndex.value === null || activeIndex.value === index
    }))
  }

  return {
    localHoveredIndex,
    localSelectedIndex,
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
    createLegendItems
  }
}
