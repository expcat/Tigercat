import React, { useState, useMemo, useCallback } from 'react'
import type { RateProps as CoreRateProps } from '@expcat/tigercat-core'
import {
  rateBaseClasses,
  getRateStarClasses,
  rateActiveColor,
  rateInactiveColor,
  rateHoverColor,
  starPathD,
  starViewBox,
  classNames,
  mergeTigerLocale,
  getRateLabels,
  type TigerLocale,
  type TigerLocaleRate
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface RateProps extends CoreRateProps {
  /** Controlled value */
  value?: number
  /** Called when value changes */
  onChange?: (value: number) => void
  /** Called when hover value changes */
  onHoverChange?: (value: number) => void
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** Text/aria label overrides */
  labels?: Partial<TigerLocaleRate>
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
  locale,
  labels: labelsOverride,
  onChange,
  onHoverChange
}) => {
  const config = useTigerConfig()
  const [hoverValue, setHoverValue] = useState(0)
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getRateLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )

  const displayValue = hoverValue > 0 ? hoverValue : value
  const isChar = !!character

  const getStarValue = useCallback((index: number, isHalf: boolean): number => {
    return isHalf ? index + 0.5 : index + 1
  }, [])

  const handleClick = useCallback(
    (index: number, e: React.MouseEvent) => {
      if (disabled) return
      const el = e.currentTarget as HTMLElement
      const rect = el.getBoundingClientRect()
      const half = allowHalf && e.clientX - rect.left < rect.width / 2
      const val = getStarValue(index, half)
      const newVal = allowClear && val === value ? 0 : val
      onChange?.(newVal)
    },
    [disabled, allowHalf, getStarValue, allowClear, value, onChange]
  )

  const handleMouseMove = useCallback(
    (index: number, e: React.MouseEvent) => {
      if (disabled) return
      const el = e.currentTarget as HTMLElement
      const rect = el.getBoundingClientRect()
      const half = allowHalf && e.clientX - rect.left < rect.width / 2
      const val = getStarValue(index, half)
      if (val !== hoverValue) {
        setHoverValue(val)
        onHoverChange?.(val)
      }
    },
    [disabled, allowHalf, getStarValue, hoverValue, onHoverChange]
  )

  const handleMouseLeave = useCallback(() => {
    if (disabled) return
    setHoverValue(0)
    onHoverChange?.(0)
  }, [disabled, onHoverChange])

  const step = allowHalf ? 0.5 : 1

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return
      let next = value
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = Math.min(count, value + step)
          break
        case 'ArrowLeft':
        case 'ArrowDown':
          next = Math.max(0, value - step)
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = count
          break
        default:
          return
      }
      e.preventDefault()
      if (next !== value) onChange?.(next)
    },
    [disabled, value, count, step, onChange]
  )

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
          aria-hidden="true"
          onClick={(e) => handleClick(i, e)}
          onMouseMove={(e) => handleMouseMove(i, e)}
          onMouseLeave={handleMouseLeave}>
          {content}
        </span>
      )
    }
    return items
  }, [
    count,
    displayValue,
    hoverValue,
    allowHalf,
    disabled,
    size,
    character,
    isChar,
    starIcon,
    handleClick,
    handleMouseMove,
    handleMouseLeave
  ])

  const valueText = labels.valueText
    .replace('{value}', String(value))
    .replace('{plural}', value === 1 ? '' : 's')

  return (
    <div
      className={classNames(rateBaseClasses, className)}
      role="slider"
      aria-label={labels.ariaLabel}
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={value}
      aria-valuetext={valueText}
      aria-disabled={disabled || undefined}
      aria-orientation="horizontal"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}>
      {stars}
    </div>
  )
}
