import { defineComponent, computed, h, PropType } from 'vue'
import {
  chartAxisTickTextClasses,
  classNames,
  computePieHoverOffset,
  computePieLabelLine,
  createPieArcPath,
  getChartElementOpacity,
  getChartInnerRect,
  getPieArcs,
  PIE_BASE_SHADOW,
  PIE_EMPHASIS_SHADOW,
  polarToCartesian,
  resolveChartPalette,
  buildChartLegendItems,
  resolveChartTooltipContent,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type PieChartDatum,
  type PieChartProps as CorePieChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'

export interface VuePieChartProps extends CorePieChartProps {
  data: PieChartDatum[]
  padding?: ChartPadding
}

export const PieChart = defineComponent({
  name: 'TigerPieChart',
  props: {
    width: {
      type: Number,
      default: 320
    },
    height: {
      type: Number,
      default: 200
    },
    padding: {
      type: [Number, Object] as PropType<ChartPadding>,
      default: 24
    },
    data: {
      type: Array as PropType<PieChartDatum[]>,
      required: true
    },
    innerRadius: {
      type: Number,
      default: 0
    },
    outerRadius: {
      type: Number
    },
    startAngle: {
      type: Number,
      default: 0
    },
    endAngle: {
      type: Number,
      default: Math.PI * 2
    },
    padAngle: {
      type: Number,
      default: 0
    },
    colors: {
      type: Array as PropType<string[]>
    },
    showLabels: {
      type: Boolean,
      default: false
    },
    labelFormatter: {
      type: Function as PropType<(value: number, datum: PieChartDatum, index: number) => string>
    },
    // Interaction props
    hoverable: {
      type: Boolean,
      default: false
    },
    hoveredIndex: {
      type: Number as PropType<number | null>,
      default: undefined
    },
    activeOpacity: {
      type: Number,
      default: 1
    },
    inactiveOpacity: {
      type: Number,
      default: 0.25
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selectedIndex: {
      type: Number as PropType<number | null>,
      default: undefined
    },
    // Legend props
    showLegend: {
      type: Boolean,
      default: false
    },
    legendPosition: {
      type: String as PropType<ChartLegendPosition>,
      default: 'bottom'
    },
    legendMarkerSize: {
      type: Number,
      default: 10
    },
    legendGap: {
      type: Number,
      default: 8
    },
    // Tooltip props
    showTooltip: {
      type: Boolean,
      default: true
    },
    tooltipFormatter: {
      type: Function as PropType<(datum: PieChartDatum, index: number) => string>
    },
    // Accessibility
    title: {
      type: String
    },
    desc: {
      type: String
    },
    className: {
      type: String
    },
    // Visual enhancements
    borderWidth: {
      type: Number,
      default: 2
    },
    borderColor: {
      type: String,
      default: '#ffffff'
    },
    hoverOffset: {
      type: Number,
      default: 8
    },
    labelPosition: {
      type: String as PropType<'inside' | 'outside'>,
      default: 'inside'
    },
    shadow: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'slice-click', 'slice-hover'],
  setup(props, { emit }) {
    // Use shared interaction composable
    const {
      tooltipPosition,
      resolvedHoveredIndex,
      activeIndex,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handleClick,
      handleKeyDown,
      handleLegendClick,
      handleLegendHover,
      handleLegendLeave,
      wrapperClasses
    } = useChartInteraction<PieChartDatum>({
      hoverable: computed(() => props.hoverable),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      emit: emit as (event: string, ...args: unknown[]) => void,
      getData: (index: number) => props.data[index],
      eventNames: { hover: 'slice-hover', click: 'slice-click' }
    })

    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))

    const resolvedOuterRadius = computed(() => {
      if (typeof props.outerRadius === 'number') return Math.max(0, props.outerRadius)
      const maxR = Math.min(innerRect.value.width, innerRect.value.height) / 2
      return Math.max(0, props.labelPosition === 'outside' ? maxR * 0.72 : maxR)
    })

    const resolvedInnerRadius = computed(() =>
      Math.min(Math.max(0, props.innerRadius ?? 0), resolvedOuterRadius.value)
    )

    const arcs = computed(() =>
      getPieArcs(props.data, {
        startAngle: props.startAngle,
        endAngle: props.endAngle,
        padAngle: props.padAngle
      })
    )

    const palette = computed(() => resolveChartPalette(props.colors))

    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: props.data,
        palette: palette.value,
        activeIndex: activeIndex.value,
        getLabel: (d) => d.label ?? `${d.value}`,
        getColor: (d, i) => d.color ?? palette.value[i % palette.value.length]
      })
    )

    const total = computed(() => props.data.reduce((sum, d) => sum + d.value, 0))

    const tooltipContent = computed(() =>
      resolveChartTooltipContent(
        resolvedHoveredIndex.value,
        props.data,
        props.tooltipFormatter,
        (datum, index) => {
          const percent = total.value > 0 ? ((datum.value / total.value) * 100).toFixed(1) : '0'
          const label = datum.label ?? `#${index + 1}`
          return `${label}: ${datum.value} (${percent}%)`
        }
      )
    )

    return () => {
      const rect = innerRect.value
      const cx = rect.width / 2
      const cy = rect.height / 2
      const outerR = resolvedOuterRadius.value
      const innerR = resolvedInnerRadius.value
      const interactive = props.hoverable || props.selectable
      const hoverOff = props.hoverOffset ?? 8
      const formatLabel =
        props.labelFormatter ?? ((value: number, datum: PieChartDatum) => datum.label ?? `${value}`)

      const chart = h(
        ChartCanvas,
        {
          width: props.width,
          height: props.height,
          padding: props.padding,
          title: props.title,
          desc: props.desc,
          className: classNames(props.className)
        },
        {
          default: () => {
            // Slices
            const slices = h(
              ChartSeries,
              { data: props.data, type: 'pie' },
              {
                default: () =>
                  arcs.value.map((arc) => {
                    const color = arc.data.color ?? palette.value[arc.index % palette.value.length]
                    const path = createPieArcPath({
                      cx,
                      cy,
                      innerRadius: innerR,
                      outerRadius: outerR,
                      startAngle: arc.startAngle,
                      endAngle: arc.endAngle
                    })
                    const isEmphasized = activeIndex.value === arc.index
                    const opacity = getChartElementOpacity(arc.index, activeIndex.value, {
                      activeOpacity: props.activeOpacity,
                      inactiveOpacity: props.inactiveOpacity
                    })
                    const { dx, dy } =
                      interactive && isEmphasized && hoverOff > 0
                        ? computePieHoverOffset(arc.startAngle, arc.endAngle, hoverOff)
                        : { dx: 0, dy: 0 }

                    return h('path', {
                      key: `slice-${arc.index}`,
                      d: path,
                      fill: color,
                      opacity,
                      stroke: props.borderColor,
                      'stroke-width': props.borderWidth,
                      'stroke-linejoin': 'round',
                      class: classNames(interactive && 'cursor-pointer'),
                      style: {
                        transform: isEmphasized
                          ? `translate(${dx}px, ${dy}px) scale(1.04)`
                          : `translate(${dx}px, ${dy}px)`,
                        transformOrigin: `${cx}px ${cy}px`,
                        transition:
                          'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease-out, filter 0.3s ease-out',
                        filter: props.shadow
                          ? isEmphasized
                            ? PIE_EMPHASIS_SHADOW
                            : PIE_BASE_SHADOW
                          : undefined
                      },
                      tabindex: props.selectable ? 0 : undefined,
                      role: props.selectable ? 'button' : 'img',
                      'aria-label': arc.data.label ?? `${arc.value}`,
                      'data-pie-slice': 'true',
                      'data-index': arc.index,
                      onMouseenter: (e: MouseEvent) => handleMouseEnter(arc.index, e),
                      onMousemove: handleMouseMove,
                      onMouseleave: handleMouseLeave,
                      onClick: () => handleClick(arc.index),
                      onKeydown: (e: KeyboardEvent) => handleKeyDown(e, arc.index)
                    })
                  })
              }
            )

            if (!props.showLabels) return [slices]

            // Outside labels with leader lines
            if (props.labelPosition === 'outside') {
              const labelNodes = arcs.value
                .map((arc) => {
                  const color = arc.data.color ?? palette.value[arc.index % palette.value.length]
                  const line = computePieLabelLine(cx, cy, outerR, arc.startAngle, arc.endAngle)
                  const pct = total.value > 0 ? ((arc.value / total.value) * 100).toFixed(1) : '0'
                  const labelText = props.labelFormatter
                    ? props.labelFormatter(arc.value, arc.data, arc.index)
                    : `${arc.data.label ?? arc.value} ${pct}%`

                  return [
                    h('polyline', {
                      key: `line-${arc.index}`,
                      points: `${line.anchor.x},${line.anchor.y} ${line.elbow.x},${line.elbow.y} ${line.label.x},${line.label.y}`,
                      fill: 'none',
                      stroke: color,
                      'stroke-width': 1,
                      opacity: 0.5
                    }),
                    h(
                      'text',
                      {
                        key: `label-${arc.index}`,
                        x: line.label.x,
                        y: line.label.y,
                        'text-anchor': line.textAnchor,
                        'dominant-baseline': 'middle',
                        class: 'fill-[color:var(--tiger-text-secondary,#6b7280)] text-xs'
                      },
                      labelText
                    )
                  ]
                })
                .flat()
              return [slices, ...labelNodes]
            }

            // Inside labels
            const labelRadius = innerR + (outerR - innerR) / 2
            const insideLabels = arcs.value.map((arc) => {
              const angle = (arc.startAngle + arc.endAngle) / 2
              const { x, y } = polarToCartesian(cx, cy, labelRadius, angle)
              const label = formatLabel(arc.value, arc.data, arc.index)
              return h(
                'text',
                {
                  key: `label-${arc.index}`,
                  x,
                  y,
                  class: chartAxisTickTextClasses,
                  'text-anchor': 'middle',
                  'dominant-baseline': 'middle'
                },
                label
              )
            })
            return [slices, ...insideLabels]
          }
        }
      )

      const tooltip =
        props.showTooltip && props.hoverable
          ? h(ChartTooltip, {
              content: tooltipContent.value,
              visible: resolvedHoveredIndex.value !== null && tooltipContent.value !== '',
              x: tooltipPosition.value.x,
              y: tooltipPosition.value.y
            })
          : null

      if (!props.showLegend) {
        return h('div', { class: 'inline-block relative' }, [chart, tooltip])
      }

      return h('div', { class: wrapperClasses.value }, [
        chart,
        h(ChartLegend, {
          items: legendItems.value,
          position: props.legendPosition,
          markerSize: props.legendMarkerSize,
          gap: props.legendGap,
          interactive,
          onItemClick: handleLegendClick,
          onItemHover: handleLegendHover,
          onItemLeave: handleLegendLeave
        }),
        tooltip
      ])
    }
  }
})

export default PieChart
