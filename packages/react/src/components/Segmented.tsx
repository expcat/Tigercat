import React, { forwardRef, useId, useMemo } from 'react'
import type { SegmentedProps as CoreSegmentedProps, SegmentedOption } from '@expcat/tigercat-core'
import { icon24ViewBox } from '@expcat/tigercat-core/icons/common'
import {
  getSegmentedContainerClasses,
  getSegmentedContainerStyle,
  getSegmentedIndicatorClasses,
  getSegmentedIndicatorStyle,
  getSegmentedOptionClasses,
  getSegmentedTrackClasses,
  getSegmentedKeyboardTarget,
  getSegmentedRovingIndex,
  getSegmentedLabels,
  classNames,
  getLocaleDirection,
  devWarn,
  mergeTigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
import { useControlledState } from '../hooks/useControlledState'

export interface SegmentedProps extends CoreSegmentedProps {
  value?: string | number
  defaultValue?: string | number
  onChange?: (value: string | number) => void
}

export const Segmented = forwardRef<
  HTMLDivElement,
  SegmentedProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>
>(function Segmented(
  {
    value,
    defaultValue,
    options = [],
    disabled = false,
    size = 'md',
    block = false,
    name,
    className,
    style,
    onChange,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const autoName = useId()
  const rtl = getLocaleDirection(config.locale) === 'rtl'
  const groupLabels = useMemo(
    () => getSegmentedLabels(mergeTigerLocale(config.locale)),
    [config.locale]
  )
  const [currentValue, setCurrentValue] = useControlledState<string | number | undefined>({
    value,
    defaultValue,
    onChange: (next) => {
      if (next !== undefined) onChange?.(next)
    }
  })

  if (new Set(options.map((opt) => opt.value)).size !== options.length) {
    devWarn('Segmented.duplicateValue', 'Segmented: option values should be unique.')
  }

  function handleSelect(opt: SegmentedOption) {
    if (opt.disabled || disabled) return
    setCurrentValue(opt.value)
  }

  const selectedIndex = options.findIndex((opt) => opt.value === currentValue)
  const enabledIdxs = options.reduce<number[]>((acc, opt, i) => {
    if (!opt.disabled && !disabled) acc.push(i)
    return acc
  }, [])
  const rovingIndex = getSegmentedRovingIndex(selectedIndex, enabledIdxs)

  function focusOption(container: HTMLElement | null, index: number) {
    if (!container) return
    const els = container.querySelectorAll<HTMLElement>('[role="radio"]')
    els[index]?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>, index: number) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(options[index])
      return
    }
    const target = getSegmentedKeyboardTarget(e.key, index, enabledIdxs, rtl)
    if (target == null) return
    e.preventDefault()
    const container = (e.currentTarget as HTMLElement).closest<HTMLElement>('[role="radiogroup"]')
    focusOption(container, target)
    handleSelect(options[target])
  }

  return (
    <div
      ref={ref}
      {...rest}
      className={classNames(getSegmentedContainerClasses(size, block), className)}
      style={{ ...style, ...getSegmentedContainerStyle(options.length) }}
      role="radiogroup"
      aria-label={rest['aria-labelledby'] ? undefined : rest['aria-label'] || groupLabels.ariaLabel}
      aria-disabled={disabled || undefined}>
      <input type="hidden" name={name || autoName} value={currentValue ?? ''} />
      <div className={getSegmentedTrackClasses()} aria-hidden="true">
        <div
          data-tiger-segmented-indicator="true"
          className={getSegmentedIndicatorClasses(size)}
          style={getSegmentedIndicatorStyle(selectedIndex, options.length, size)}
        />
      </div>
      {options.map((opt, index) => {
        const selected = opt.value === currentValue
        const isDisabled = Boolean(opt.disabled) || disabled
        return (
          <button
            key={`${String(opt.value)}-${index}`}
            type="button"
            className={getSegmentedOptionClasses(size, selected, isDisabled)}
            role="radio"
            aria-checked={selected}
            aria-disabled={isDisabled || undefined}
            tabIndex={isDisabled ? -1 : index === rovingIndex ? 0 : -1}
            onClick={() => handleSelect(opt)}
            onKeyDown={(e) => handleKeyDown(e, index)}>
            {opt.icon ? (
              <svg
                viewBox={icon24ViewBox}
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
                focusable="false">
                <path d={opt.icon} />
              </svg>
            ) : null}
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
})
