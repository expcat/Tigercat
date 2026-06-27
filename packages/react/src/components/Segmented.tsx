import React from 'react'
import type { SegmentedProps as CoreSegmentedProps, SegmentedOption } from '@expcat/tigercat-core'
import {
  getSegmentedContainerClasses,
  getSegmentedContainerStyle,
  getSegmentedIndicatorClasses,
  getSegmentedIndicatorStyle,
  getSegmentedOptionClasses,
  classNames
} from '@expcat/tigercat-core'

export interface SegmentedProps extends CoreSegmentedProps {
  /** Controlled value */
  value?: string | number
  /** Called when value changes */
  onChange?: (value: string | number) => void
}

// The component also forwards standard div attributes (e.g. `aria-label`,
// `aria-labelledby`) to the radiogroup root so the group can be named.
export const Segmented: React.FC<
  SegmentedProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>
> = ({
  value,
  options = [],
  disabled = false,
  size = 'md',
  block = false,
  className,
  onChange,
  ...rest
}) => {
  function handleSelect(opt: SegmentedOption) {
    if (opt.disabled || disabled) return
    if (opt.value === value) return
    onChange?.(opt.value)
  }

  const selectedIndex = options.findIndex((opt) => opt.value === value)
  const firstEnabledIndex = options.findIndex((opt) => !opt.disabled)
  // Roving tabindex: the selected option is the single tab-stop; if nothing is
  // selected yet, the first enabled option carries focus into the group.
  const rovingIndex = selectedIndex >= 0 ? selectedIndex : firstEnabledIndex

  function focusOption(container: HTMLElement | null, index: number) {
    if (!container) return
    const els = container.querySelectorAll<HTMLElement>('[role="radio"]')
    els[index]?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>, index: number) {
    if (disabled) return
    const enabledIdxs = options.reduce<number[]>((acc, opt, i) => {
      if (!opt.disabled) acc.push(i)
      return acc
    }, [])
    if (enabledIdxs.length === 0) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(options[index])
      return
    }

    const pos = enabledIdxs.indexOf(index)
    let target: number | null = null
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = enabledIdxs[(pos + 1 + enabledIdxs.length) % enabledIdxs.length]
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        target = enabledIdxs[(pos - 1 + enabledIdxs.length) % enabledIdxs.length]
        break
      case 'Home':
        target = enabledIdxs[0]
        break
      case 'End':
        target = enabledIdxs[enabledIdxs.length - 1]
        break
      default:
        return
    }
    if (target == null) return
    e.preventDefault()
    const container = (e.currentTarget as HTMLElement).closest<HTMLElement>('[role="radiogroup"]')
    focusOption(container, target)
    handleSelect(options[target])
  }

  return (
    <div
      {...rest}
      className={classNames(getSegmentedContainerClasses(size, block), className)}
      style={getSegmentedContainerStyle(options.length)}
      role="radiogroup"
      aria-disabled={disabled || undefined}>
      <div
        data-tiger-segmented-indicator="true"
        aria-hidden="true"
        className={getSegmentedIndicatorClasses(size)}
        style={getSegmentedIndicatorStyle(selectedIndex, options.length, size)}
      />
      {options.map((opt, index) => {
        const selected = opt.value === value
        const isDisabled = !!opt.disabled || disabled
        return (
          <label
            key={opt.value}
            className={classNames(
              getSegmentedOptionClasses(size, selected, isDisabled),
              block ? 'flex-1 text-center' : ''
            )}
            role="radio"
            aria-checked={selected}
            aria-disabled={isDisabled}
            tabIndex={isDisabled ? -1 : index === rovingIndex ? 0 : -1}
            onClick={() => handleSelect(opt)}
            onKeyDown={(e) => handleKeyDown(e, index)}>
            <span>{opt.label}</span>
          </label>
        )
      })}
    </div>
  )
}
