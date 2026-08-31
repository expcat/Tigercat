import React, { forwardRef, useMemo, useState } from 'react'
import type { RateProps as CoreRateProps } from '@expcat/tigercat-core'
import {
  rateBaseClasses,
  getRateStarClasses,
  rateHalfStarInnerClasses,
  rateActiveColor,
  rateInactiveColor,
  rateHoverColor,
  rateIsInlineStartHalf,
  starPathD,
  starViewBox,
  classNames,
  mergeTigerLocale,
  getRateLabels,
  formatRateValueText,
  sliderGetKeyboardValue,
  sliderNormalizeValue,
  getLocaleDirection,
  type TigerLocale,
  type TigerLocaleRate
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { useControlledState } from '../hooks/useControlledState'

export interface RateProps
  extends CoreRateProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  onHoverChange?: (value: number) => void
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleRate>
  character?: React.ReactNode
}

export const Rate = forwardRef<HTMLDivElement, RateProps>(function Rate(
  {
    value,
    defaultValue = 0,
    count = 5,
    allowHalf = false,
    disabled = false,
    readOnly = false,
    size = 'md',
    allowClear = true,
    character,
    className,
    locale,
    labels: labelsOverride,
    onChange,
    onHoverChange,
    onKeyDown,
    'aria-label': ariaLabel,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const [currentValue, setCurrentValue] = useControlledState({
    value,
    defaultValue,
    onChange
  })
  const [hoverValue, setHoverValue] = useState(0)
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getRateLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const rtl = getLocaleDirection(mergedLocale) === 'rtl'
  const locked = disabled || readOnly
  const step = allowHalf ? 0.5 : 1
  const normalized = sliderNormalizeValue(currentValue, 0, count, step)
  const displayValue = hoverValue > 0 ? hoverValue : normalized
  const isChar = character != null && character !== false

  const glyph = (extraClass?: string) =>
    isChar ? (
      <span className={extraClass}>{character}</span>
    ) : (
      <svg viewBox={starViewBox} fill="currentColor" className={extraClass ?? 'h-full w-full'}>
        <path d={starPathD} />
      </svg>
    )

  const hitValue = (index: number, clientX: number, el: HTMLElement) => {
    const half = allowHalf && rateIsInlineStartHalf(clientX, el.getBoundingClientRect(), rtl)
    return half ? index + 0.5 : index + 1
  }

  const commit = (next: number) => {
    if (locked) return
    setCurrentValue(next)
  }

  const stars = []
  for (let i = 0; i < count; i++) {
    const full = displayValue >= i + 1
    const half = allowHalf && !full && displayValue >= i + 0.5
    const isHovering = hoverValue > 0
    const colorClass =
      full || half ? (isHovering ? rateHoverColor : rateActiveColor) : rateInactiveColor

    const content = half ? (
      <>
        <span className={classNames('absolute inset-0', rateInactiveColor)}>{glyph()}</span>
        <span
          className={classNames(
            'absolute top-0 bottom-0 overflow-hidden',
            isHovering ? rateHoverColor : rateActiveColor
          )}
          style={{ width: '50%', insetInlineStart: 0 }}>
          {glyph(rateHalfStarInnerClasses)}
        </span>
      </>
    ) : (
      <span className={colorClass}>{glyph()}</span>
    )

    stars.push(
      <span
        key={i}
        className={getRateStarClasses(size, Boolean(isChar), locked)}
        aria-hidden="true"
        onClick={(e) => {
          if (locked) return
          const val = hitValue(i, e.clientX, e.currentTarget)
          commit(allowClear && val === normalized ? 0 : val)
        }}
        onMouseMove={(e) => {
          if (locked) return
          const val = hitValue(i, e.clientX, e.currentTarget)
          if (val !== hoverValue) {
            setHoverValue(val)
            onHoverChange?.(val)
          }
        }}>
        {content}
      </span>
    )
  }

  const valueText = formatRateValueText(labels.valueText, normalized, mergedLocale?.locale)

  return (
    <div
      ref={ref}
      className={classNames(rateBaseClasses, className)}
      role="slider"
      aria-label={ariaLabel ?? labels.ariaLabel}
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={normalized}
      aria-valuetext={valueText}
      aria-disabled={disabled || undefined}
      aria-readonly={readOnly || undefined}
      aria-orientation="horizontal"
      tabIndex={disabled ? -1 : 0}
      {...rest}
      onMouseLeave={() => {
        if (locked) return
        setHoverValue(0)
        onHoverChange?.(0)
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (e.defaultPrevented || locked) return
        const next = sliderGetKeyboardValue(e.key, normalized, 0, count, step, undefined, rtl)
        if (next == null) return
        e.preventDefault()
        commit(next)
      }}>
      {stars}
    </div>
  )
})
