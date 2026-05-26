import React, { useMemo, useRef, useState } from 'react'
import type {
  ColorSwatchNormalizedOption,
  ColorSwatchProps as CoreColorSwatchProps
} from '@expcat/tigercat-core'
import {
  classNames,
  colorSwatchBaseClasses,
  colorSwatchGridClasses,
  colorSwatchGroupClasses,
  colorSwatchGroupLabelClasses,
  flattenColorSwatchGroups,
  getColorSwatchButtonClasses,
  getColorSwatchCheckClasses,
  getNextColorSwatchIndex,
  isColorSwatchSelected,
  normalizeColorSwatchGroups
} from '@expcat/tigercat-core'

export interface ColorSwatchProps extends CoreColorSwatchProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string, option: ColorSwatchNormalizedOption) => void
}

const checkPathD = 'M5 10.5 8 13.5 15 6.5'

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  value,
  defaultValue,
  disabled = false,
  size = 'md',
  colors,
  groups,
  columns = 6,
  ariaLabel = 'Color swatches',
  className,
  onChange
}) => {
  const [innerValue, setInnerValue] = useState(defaultValue)
  const [focusIndex, setFocusIndex] = useState(-1)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])

  const normalizedGroups = useMemo(
    () => normalizeColorSwatchGroups(groups, colors),
    [groups, colors]
  )
  const options = useMemo(() => flattenColorSwatchGroups(normalizedGroups), [normalizedGroups])
  const selectedValue = value ?? innerValue
  const selectedIndex = options.findIndex((option) =>
    isColorSwatchSelected(option.value, selectedValue)
  )
  const firstEnabledIndex = options.findIndex((option) => !option.disabled)
  const activeIndex = selectedIndex >= 0 ? selectedIndex : firstEnabledIndex

  function handleSelect(option: ColorSwatchNormalizedOption) {
    if (disabled || option.disabled) return
    if (value === undefined) setInnerValue(option.value)
    onChange?.(option.value, option)
  }

  function handleKeyDown(optionIndex: number, event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const option = options[optionIndex]
      if (option) handleSelect(option)
      return
    }

    const nextIndex = getNextColorSwatchIndex(options, optionIndex, event.key, columns)
    if (nextIndex === -1 || nextIndex === optionIndex) return

    event.preventDefault()
    setFocusIndex(nextIndex)
    optionRefs.current[nextIndex]?.focus()
  }

  let flatIndex = 0

  return (
    <div
      className={classNames(colorSwatchBaseClasses, className)}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}>
      {normalizedGroups.map((group, groupIndex) => (
        <div key={`${groupIndex}-${group.label ?? 'group'}`} className={colorSwatchGroupClasses}>
          {group.label && <div className={colorSwatchGroupLabelClasses}>{group.label}</div>}
          <div
            className={colorSwatchGridClasses}
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {group.colors.map((option) => {
              const optionIndex = flatIndex
              flatIndex += 1
              const selected = isColorSwatchSelected(option.value, selectedValue)
              const optionDisabled = disabled || !!option.disabled
              const tabIndex =
                !optionDisabled && optionIndex === (focusIndex >= 0 ? focusIndex : activeIndex)
                  ? 0
                  : -1

              return (
                <button
                  key={`${option.groupIndex}-${option.index}-${option.value}`}
                  ref={(node) => {
                    optionRefs.current[optionIndex] = node
                  }}
                  type="button"
                  className={getColorSwatchButtonClasses(size, selected, optionDisabled)}
                  style={{ backgroundColor: option.value }}
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.label}
                  aria-disabled={optionDisabled || undefined}
                  tabIndex={tabIndex}
                  onFocus={() => setFocusIndex(optionIndex)}
                  onClick={() => handleSelect(option)}
                  onKeyDown={(event) => handleKeyDown(optionIndex, event)}>
                  {selected && (
                    <span className={getColorSwatchCheckClasses(size)} aria-hidden="true">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="h-full w-full">
                        <path d={checkPathD} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ColorSwatch
