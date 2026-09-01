import React, { useId, useMemo } from 'react'
import {
  classNames,
  createBandScale,
  createLinearScale,
  getStableChartGradientPrefix,
  getBarValueLabelY,
  getNumberExtent,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  DEFAULT_CHART_PADDING,
  resolveChartTooltipContent,
  defaultXYTooltipFormatter,
  barValueLabelClasses,
  barValueLabelInsideClasses,
  barInteractiveClasses,
  BAR_ANIMATED_CLASS,
  layoutBarRects,
  resolveBarCornerRadius,
  getCartesianChartShellClasses,
  chartMarkTabIndex,
  nextChartRovingIndex,
  isChartNavigationKey,
  getChartLabels,
  mergeTigerLocale,
  type BarChartDatum,
  type BarChartProps as CoreBarChartProps,
  type ChartLegendItem,
  type ChartPadding,
  type ChartScale
} from '@expcat/tigercat-core'
import { ChartAxis } from './ChartAxis'
import { ChartCanvas } from './ChartCanvas'
import { ChartGrid } from './ChartGrid'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'
import { useResponsiveChartSize } from '../hooks/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface BarChartProps extends CoreBarChartProps {
  data: BarChartDatum[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onBarClick?: (index: number, datum: BarChartDatum) => void
  onBarHover?: (index: number | null, datum: BarChartDatum | null) => void
}

export const BarChart: React.FC<BarChartProps> = ({
  width = 320,
  height = 200,
  padding = DEFAULT_CHART_PADDING,
  responsive = false,
  data,
  xScale,
  yScale,
  barColor = 'var(--tiger-primary,#2563eb)',
  barRadius,
  barPaddingInner = 0.2,
  barPaddingOuter = 0.1,
  showGrid = true,
  showAxis = true,
  showXAxis = true,
  showYAxis = true,
  xAxisLabel,
  yAxisLabel,
  xTicks = 5,
  yTicks = 5,
  xTickValues,
  yTickValues,
  xTickFormat,
  yTickFormat,
  gridLineStyle = 'solid',
  gridStrokeWidth = 1,
  colors,
  hoverable = false,
  hoveredIndex: hoveredIndexProp,
  activeOpacity = 1,
  inactiveOpacity = 0.25,
  selectable = false,
  selectedIndex: selectedIndexProp,
  showLegend = false,
  legendPosition = 'bottom',
  legendMarkerSize = 10,
  legendGap = 8,
  showTooltip = true,
  tooltipFormatter,
  legendFormatter,
  showValueLabels = false,
  valueLabelPosition = 'top',
  valueLabelFormatter,
  barMinHeight = 0,
  barMaxWidth,
  gradient = false,
  animated = false,
  title,
  desc,
  className,
  onHoveredIndexChange,
  onSelectedIndexChange,
  onBarClick,
  onBarHover
}) => {
  const config = useTigerConfig()
  const labels = useMemo(() => getChartLabels(mergeTigerLocale(config.locale)), [config.locale])
  const gradientId = useId()
  const gradientPrefix = useMemo(
    () => getStableChartGradientPrefix('bar', gradientId),
    [gradientId]
  )
  const interactive = hoverable || selectable || Boolean(onBarClick)
  const corner = resolveBarCornerRadius(barRadius)

  const {
    tooltipPosition,
    resolvedHoveredIndex,
    resolvedSelectedIndex,
    activeIndex,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleKeyDown,
    handleLegendClick,
    handleLegendHover,
    handleLegendLeave
  } = useChartInteraction<BarChartDatum>({
    hoverable,
    showTooltip,
    hoveredIndexProp,
    selectable,
    selectedIndexProp,
    activeOpacity,
    inactiveOpacity,
    legendPosition,
    getData: (index: number) => data[index],
    onHoveredIndexChange: (index) => {
      onHoveredIndexChange?.(index)
      onBarHover?.(index, index !== null ? data[index] : null)
    },
    onSelectedIndexChange,
    onClick: (index, datum) => {
      if (datum !== undefined) onBarClick?.(index, datum)
    }
  })

  const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
    width,
    height,
    padding,
    responsive
  )
  const xDomain = useMemo(() => data.map((item) => String(item.x)), [data])
  const yValues = useMemo(
    () => data.map((item) => item.y).filter((value) => Number.isFinite(value)),
    [data]
  )

  const resolvedXScale = useMemo(() => {
    if (xScale) return xScale
    return createBandScale(xDomain, [0, innerRect.width], {
      paddingInner: barPaddingInner,
      paddingOuter: barPaddingOuter
    })
  }, [xScale, xDomain, innerRect.width, barPaddingInner, barPaddingOuter])

  const resolvedYScale = useMemo(() => {
    if (yScale) return yScale
    const extent = getNumberExtent(yValues, { includeZero: true })
    return createLinearScale(extent, [innerRect.height, 0])
  }, [yScale, yValues, innerRect.height])

  const palette = useMemo(() => resolveChartPalette(colors, barColor), [colors, barColor])

  const bars = useMemo(
    () =>
      layoutBarRects(data, resolvedXScale, resolvedYScale, {
        barMaxWidth,
        barMinHeight,
        palette,
        activeIndex,
        activeOpacity,
        inactiveOpacity,
        innerWidth: innerRect.width
      }),
    [
      resolvedXScale,
      resolvedYScale,
      data,
      innerRect.width,
      palette,
      activeIndex,
      activeOpacity,
      inactiveOpacity,
      barMinHeight,
      barMaxWidth
    ]
  )

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      buildChartLegendItems({
        data,
        palette,
        activeIndex,
        selectedIndex: resolvedSelectedIndex,
        getLabel: (d, i) => (legendFormatter ? legendFormatter(d, i) : (d.label ?? String(d.x))),
        getColor: (d, i) => d.color ?? palette[i % palette.length]
      }),
    [data, legendFormatter, palette, activeIndex, resolvedSelectedIndex]
  )

  const tooltipContent = useMemo(
    () =>
      resolveChartTooltipContent(
        resolvedHoveredIndex,
        data,
        tooltipFormatter,
        defaultXYTooltipFormatter
      ),
    [resolvedHoveredIndex, data, tooltipFormatter]
  )

  const shouldShowXAxis = showAxis && showXAxis
  const shouldShowYAxis = showAxis && showYAxis
  const visualActive = bars.findIndex((bar) => bar.index === (activeIndex ?? resolvedHoveredIndex))

  const handleBarKeyDown = (event: React.KeyboardEvent<SVGRectElement>, visualIndex: number) => {
    if (isChartNavigationKey(event.key)) {
      event.preventDefault()
      const nextVisual = nextChartRovingIndex(visualIndex, event.key, bars.length)
      const next = bars[nextVisual]
      const node = event.currentTarget.parentElement?.querySelector(
        `[data-bar-index="${next.index}"]`
      )
      if (node instanceof SVGElement) node.focus()
      handleMouseEnter(next.index, event)
      return
    }
    handleKeyDown(event, bars[visualIndex].index)
  }

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      responsive={responsive}
      title={title}
      desc={desc}
      onResolvedSizeChange={onResolvedSizeChange}>
      {gradient && (
        <defs>
          {bars.map((bar) => (
            <linearGradient
              key={`grad-${bar.index}`}
              id={`${gradientPrefix}-${bar.index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1">
              <stop offset="0%" stopColor={bar.color} stopOpacity={0.65} />
              <stop offset="100%" stopColor={bar.color} stopOpacity={1} />
            </linearGradient>
          ))}
        </defs>
      )}
      {showGrid && (
        <ChartGrid
          xScale={resolvedXScale}
          yScale={resolvedYScale}
          show="both"
          xTicks={xTicks}
          yTicks={yTicks}
          xTickValues={xTickValues}
          yTickValues={yTickValues}
          lineStyle={gridLineStyle}
          strokeWidth={gridStrokeWidth}
        />
      )}
      {shouldShowXAxis && (
        <ChartAxis
          scale={resolvedXScale}
          orientation="bottom"
          y={innerRect.height}
          ticks={xTicks}
          tickValues={xTickValues}
          tickFormat={xTickFormat}
          label={xAxisLabel}
        />
      )}
      {shouldShowYAxis && (
        <ChartAxis
          scale={resolvedYScale}
          orientation="left"
          ticks={yTicks}
          tickValues={yTickValues}
          tickFormat={yTickFormat}
          label={yAxisLabel}
        />
      )}
      <ChartSeries data={data} type="bar">
        {bars.map((bar, visualIndex) => (
          <rect
            key={`bar-${bar.index}`}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            rx={corner.rx}
            ry={corner.ry}
            fill={gradient ? `url(#${gradientPrefix}-${bar.index})` : bar.color}
            opacity={bar.opacity}
            className={classNames(
              animated && BAR_ANIMATED_CLASS,
              interactive && barInteractiveClasses
            )}
            style={
              corner.style
                ? ({
                    rx: 'var(--tiger-chart-bar-radius, 4px)',
                    ry: 'var(--tiger-chart-bar-radius, 4px)'
                  } as React.CSSProperties)
                : undefined
            }
            tabIndex={
              interactive
                ? chartMarkTabIndex(visualIndex, visualActive < 0 ? null : visualActive)
                : undefined
            }
            role={interactive ? 'button' : undefined}
            aria-hidden={interactive ? undefined : true}
            aria-label={
              interactive
                ? (bar.datum.label ?? defaultXYTooltipFormatter(bar.datum, bar.index))
                : undefined
            }
            data-bar-index={bar.index}
            onMouseEnter={(e) => handleMouseEnter(bar.index, e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(bar.index)}
            onKeyDown={(e) => handleBarKeyDown(e, visualIndex)}
          />
        ))}
      </ChartSeries>
      {showValueLabels &&
        bars.map((bar) => {
          const labelText = valueLabelFormatter
            ? valueLabelFormatter(bar.datum, bar.index)
            : String(bar.datum.y)
          const labelY = getBarValueLabelY(bar.y, bar.height, valueLabelPosition, 8, {
            negative: bar.negative
          })
          const isInside = valueLabelPosition === 'inside'
          return (
            <text
              key={`label-${bar.index}`}
              x={bar.x + bar.width / 2}
              y={labelY}
              textAnchor="middle"
              dominantBaseline={isInside ? 'central' : bar.negative ? 'hanging' : 'auto'}
              className={isInside ? barValueLabelInsideClasses : barValueLabelClasses}
              opacity={bar.opacity}
              data-value-label="">
              {labelText}
            </text>
          )
        })}
    </ChartCanvas>
  )

  const tooltip = showTooltip && (
    <ChartTooltip
      content={tooltipContent}
      open={resolvedHoveredIndex !== null && tooltipContent !== ''}
      x={tooltipPosition.x}
      y={tooltipPosition.y}
    />
  )

  return (
    <div
      className={getCartesianChartShellClasses({
        showLegend,
        legendPosition,
        responsive,
        className
      })}>
      {chart}
      {showLegend ? (
        <ChartLegend
          items={legendItems}
          orientation={chartLegendOrientationFromPosition(legendPosition)}
          markerSize={legendMarkerSize}
          gap={legendGap}
          interactive={hoverable || selectable}
          ariaLabel={labels.legendAriaLabel}
          onItemClick={handleLegendClick}
          onItemHover={handleLegendHover}
          onItemLeave={handleLegendLeave}
        />
      ) : null}
      {tooltip}
    </div>
  )
}

export default BarChart
