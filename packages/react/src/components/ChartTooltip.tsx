import React, { useRef, useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { classNames } from '@expcat/tigercat-core'

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
    requestAnimationFrame(() => {
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
  }, [x, y, visible])

  const tooltipClasses = useMemo(
    () =>
      classNames(
        'fixed z-[9999] pointer-events-none',
        'px-3 py-2 rounded-md shadow-lg',
        'bg-[color:var(--tiger-bg-elevated,#1f2937)]',
        'text-[color:var(--tiger-text-inverse,#f9fafb)]',
        'text-sm whitespace-nowrap',
        'transition-opacity duration-150',
        visible ? 'opacity-100' : 'opacity-0',
        className
      ),
    [visible, className]
  )

  const tooltip = (
    <div
      ref={tooltipRef}
      className={tooltipClasses}
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`
      }}
      role="tooltip">
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
