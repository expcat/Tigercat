import React, { useMemo, useCallback } from 'react'
import {
  classNames,
  chartLegendListClasses,
  getChartLabels,
  getChartLegendItemClasses,
  mergeTigerLocale,
  type ChartLegendItem,
  type ChartLegendProps as CoreChartLegendProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface ChartLegendProps extends CoreChartLegendProps {
  onItemClick?: (index: number, item: ChartLegendItem) => void
  onItemHover?: (index: number, item: ChartLegendItem, event?: React.SyntheticEvent) => void
  onItemLeave?: () => void
}

export const ChartLegend: React.FC<ChartLegendProps> = ({
  items,
  orientation = 'horizontal',
  markerSize = 10,
  gap = 8,
  interactive = false,
  ariaLabel,
  className,
  onItemClick,
  onItemHover,
  onItemLeave
}) => {
  const config = useTigerConfig()
  const labels = useMemo(() => getChartLabels(mergeTigerLocale(config.locale)), [config.locale])
  const resolvedAriaLabel = ariaLabel ?? labels.legendAriaLabel
  const containerClasses = useMemo(
    () =>
      classNames(
        chartLegendListClasses,
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        className
      ),
    [orientation, className]
  )

  const handleClick = useCallback(
    (item: ChartLegendItem) => {
      if (!interactive) return
      onItemClick?.(item.index, item)
    },
    [interactive, onItemClick]
  )

  const handleHover = useCallback(
    (item: ChartLegendItem, event: React.SyntheticEvent) => {
      if (!interactive) return
      onItemHover?.(item.index, item, event)
    },
    [interactive, onItemHover]
  )

  const handleLeave = useCallback(
    (event?: React.MouseEvent | React.FocusEvent) => {
      if (!interactive) return
      if (
        event &&
        event.relatedTarget instanceof Node &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        return
      }
      onItemLeave?.()
    },
    [interactive, onItemLeave]
  )

  return (
    <div
      className={containerClasses}
      role={interactive ? 'group' : 'list'}
      aria-label={resolvedAriaLabel}
      style={{ gap: `${gap}px` }}
      data-chart-legend="true"
      onMouseLeave={interactive ? handleLeave : undefined}
      onBlur={interactive ? handleLeave : undefined}>
      {items.map((item) => {
        const ItemComponent = interactive ? 'button' : 'div'
        const highlighted = Boolean(item.active && items.some((entry) => entry.active === false))
        return (
          <ItemComponent
            key={`legend-${item.index}`}
            type={interactive ? 'button' : undefined}
            className={getChartLegendItemClasses({
              interactive,
              dimmed: item.active === false
            })}
            role={interactive ? undefined : 'listitem'}
            aria-pressed={interactive ? Boolean(item.selected) : undefined}
            aria-current={interactive && highlighted ? 'true' : undefined}
            data-legend-item="true"
            onClick={interactive ? () => handleClick(item) : undefined}
            onMouseEnter={interactive ? (event) => handleHover(item, event) : undefined}
            onFocus={interactive ? (event) => handleHover(item, event) : undefined}>
            <span
              className="inline-block rounded-full shrink-0"
              style={
                {
                  width: `${markerSize}px`,
                  height: `${markerSize}px`,
                  background: `var(--tiger-chart-legend-marker-image, ${item.color})`,
                  '--tiger-chart-legend-marker-color': item.color
                } as React.CSSProperties
              }
              aria-hidden="true"
              data-legend-marker="true"
            />
            <span>{item.label}</span>
          </ItemComponent>
        )
      })}
    </div>
  )
}

export default ChartLegend
