import React, { useMemo, useCallback } from 'react'
import { classNames, type ChartLegendItem, type ChartLegendPosition } from '@expcat/tigercat-core'

export interface ChartLegendProps {
  items: ChartLegendItem[]
  position?: ChartLegendPosition
  markerSize?: number
  gap?: number
  interactive?: boolean
  className?: string
  onItemClick?: (index: number, item: ChartLegendItem) => void
  onItemHover?: (index: number, item: ChartLegendItem) => void
  onItemLeave?: () => void
}

export const ChartLegend: React.FC<ChartLegendProps> = ({
  items,
  position = 'bottom',
  markerSize = 10,
  gap = 8,
  interactive = false,
  className,
  onItemClick,
  onItemHover,
  onItemLeave
}) => {
  const containerClasses = useMemo(
    () =>
      classNames(
        'flex flex-wrap',
        position === 'right' || position === 'left' ? 'flex-col gap-2' : 'flex-row gap-3',
        className
      ),
    [position, className]
  )

  const handleClick = useCallback(
    (item: ChartLegendItem) => {
      if (!interactive) return
      onItemClick?.(item.index, item)
    },
    [interactive, onItemClick]
  )

  const handleHover = useCallback(
    (item: ChartLegendItem) => {
      if (!interactive) return
      onItemHover?.(item.index, item)
    },
    [interactive, onItemHover]
  )

  const handleLeave = useCallback(() => {
    if (!interactive) return
    onItemLeave?.()
  }, [interactive, onItemLeave])

  return (
    <div
      className={containerClasses}
      role="list"
      aria-label="Chart legend"
      data-chart-legend="true">
      {items.map((item) => {
        const ItemComponent = interactive ? 'button' : 'div'
        return (
          <ItemComponent
            key={`legend-${item.index}`}
            type={interactive ? 'button' : undefined}
            className={classNames(
              'flex items-center gap-2 text-sm',
              'text-[color:var(--tiger-text-secondary,#6b7280)]',
              interactive
                ? 'cursor-pointer hover:text-[color:var(--tiger-text,#374151)] transition-colors'
                : 'cursor-default',
              item.active === false ? 'opacity-50' : undefined
            )}
            role="listitem"
            data-legend-item="true"
            onClick={interactive ? () => handleClick(item) : undefined}
            onMouseEnter={interactive ? () => handleHover(item) : undefined}
            onMouseLeave={interactive ? handleLeave : undefined}>
            <span
              className="inline-block rounded-full shrink-0"
              style={{
                width: `${markerSize}px`,
                height: `${markerSize}px`,
                backgroundColor: item.color
              }}
              aria-hidden="true"
              data-legend-marker="true"
            />
            <span style={{ marginRight: `${gap}px` }}>{item.label}</span>
          </ItemComponent>
        )
      })}
    </div>
  )
}

export default ChartLegend
