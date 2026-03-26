import React, { useState, useMemo } from 'react'
import type { RateProps as CoreRateProps } from '@expcat/tigercat-core'
import {
  rateBaseClasses,
  getRateStarClasses,
  rateActiveColor,
  rateInactiveColor,
  rateHoverColor,
  starPathD,
  starViewBox,
  classNames
} from '@expcat/tigercat-core'

export interface RateProps extends CoreRateProps {
  /** Controlled value */
  value?: number
  /** Called when value changes */
  onChange?: (value: number) => void
  /** Called when hover value changes */
  onHoverChange?: (value: number) => void
}

export const Rate: React.FC<RateProps> = ({
  value = 0,
  count = 5,
  allowHalf = false,
  disabled = false,
  size = 'md',
  allowClear = true,
  character,
  className,
  onChange,
  onHoverChange
}) => {
  const [hoverValue, setHoverValue] = useState(0)

  const displayValue = hoverValue > 0 ? hoverValue : value
  const isChar = !!character

  function getStarValue(index: number, isHalf: boolean): number {
    return isHalf ? index + 0.5 : index + 1
  }

  function handleClick(index: number, e: React.MouseEvent) {
    if (disabled) return
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    const half = allowHalf && e.clientX - rect.left < rect.width / 2
    const val = getStarValue(index, half)
    const newVal = allowClear && val === value ? 0 : val
    onChange?.(newVal)
  }

  function handleMouseMove(index: number, e: React.MouseEvent) {
    if (disabled) return
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    const half = allowHalf && e.clientX - rect.left < rect.width / 2
    const val = getStarValue(index, half)
    if (val !== hoverValue) {
      setHoverValue(val)
      onHoverChange?.(val)
    }
  }

  function handleMouseLeave() {
    if (disabled) return
    setHoverValue(0)
    onHoverChange?.(0)
  }

  const starIcon = useMemo(
    () => (
      <svg viewBox={starViewBox} fill="currentColor" className="w-full h-full">
        <path d={starPathD} />
      </svg>
    ),
    []
  )

  const stars = useMemo(() => {
    const items: React.ReactNode[] = []
    for (let i = 0; i < count; i++) {
      const full = displayValue >= i + 1
      const half = allowHalf && !full && displayValue >= i + 0.5
      const isHovering = hoverValue > 0

      const colorClass =
        full || half ? (isHovering ? rateHoverColor : rateActiveColor) : rateInactiveColor

      const content = half ? (
        <>
          <span className={classNames('absolute inset-0', rateInactiveColor)}>
            {isChar ? <span>{character}</span> : starIcon}
          </span>
          <span
            className={classNames(
              'absolute inset-0 overflow-hidden',
              isHovering ? rateHoverColor : rateActiveColor
            )}
            style={{ width: '50%' }}>
            {isChar ? <span>{character}</span> : starIcon}
          </span>
        </>
      ) : (
        <span className={colorClass}>{isChar ? <span>{character}</span> : starIcon}</span>
      )

      items.push(
        <span
          key={i}
          className={getRateStarClasses(size, isChar, disabled)}
          role="radio"
          aria-checked={full || half}
          aria-label={`${i + 1} star${i + 1 > 1 ? 's' : ''}`}
          onClick={(e) => handleClick(i, e)}
          onMouseMove={(e) => handleMouseMove(i, e)}
          onMouseLeave={handleMouseLeave}>
          {content}
        </span>
      )
    }
    return items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    count,
    displayValue,
    hoverValue,
    allowHalf,
    disabled,
    size,
    character,
    isChar,
    value,
    allowClear,
    onChange,
    onHoverChange,
    starIcon
  ])

  return (
    <div className={classNames(rateBaseClasses, className)} role="radiogroup" aria-label="Rating">
      {stars}
    </div>
  )
}
