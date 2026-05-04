import React, { useRef, useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { classNames, getChartTooltipTransform } from '@expcat/tigercat-core'

export interface ChartTooltipProps {
  content: string
  visible?: boolean
  x?: number
  y?: number
  className?: string
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  content,
  visible = false,
  x = 0,
  y = 0,
  className
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y })

  // Adjust position to keep tooltip within viewport
  useEffect(() => {
    if (!visible) return

    // Add small offset from cursor
    let newX = x + 12
    let newY = y - 8

    // Check bounds after render
    const frameHandle = requestAnimationFrame(() => {
      if (!tooltipRef.current) return

      const rect = tooltipRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Adjust if overflowing right
      if (newX + rect.width > viewportWidth - 8) {
        newX = x - rect.width - 12
      }

      // Adjust if overflowing bottom
      if (newY + rect.height > viewportHeight - 8) {
        newY = y - rect.height - 8
      }

      // Keep within left/top bounds
      newX = Math.max(8, newX)
      newY = Math.max(8, newY)

      setAdjustedPosition({ x: newX, y: newY })
    })

    setAdjustedPosition({ x: newX, y: newY })
    return () => cancelAnimationFrame(frameHandle)
  }, [x, y, visible])

  const tooltipClasses = useMemo(
    () =>
      classNames(
        'fixed left-0 top-0 z-[9999] pointer-events-none will-change-transform',
        'px-3 py-2 rounded-[var(--tiger-radius-md,0.375rem)] shadow-[var(--tiger-shadow-glass,0_10px_15px_-3px_rgb(0_0_0_/_0.1),0_4px_6px_-4px_rgb(0_0_0_/_0.1))]',
        'bg-[color:var(--tiger-bg-elevated,#1f2937)]',
        'text-[color:var(--tiger-text-inverse,#f9fafb)]',
        'text-sm whitespace-nowrap',
        'transition-opacity duration-150',
        visible ? 'opacity-100' : 'opacity-0',
        className
      ),
    [visible, className]
  )

  // Don't render if content is empty
  if (!content) return null

  const tooltip = (
    <div
      ref={tooltipRef}
      className={tooltipClasses}
      style={{
        transform: getChartTooltipTransform(adjustedPosition)
      }}
      role="tooltip"
      data-chart-tooltip="true">
      {content}
    </div>
  )

  // Use portal to render at body level
  if (typeof document !== 'undefined') {
    return createPortal(tooltip, document.body)
  }

  return null
}

export default ChartTooltip
