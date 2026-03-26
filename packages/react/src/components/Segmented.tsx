import React from 'react'
import type { SegmentedProps as CoreSegmentedProps, SegmentedOption } from '@expcat/tigercat-core'
import {
  getSegmentedContainerClasses,
  getSegmentedOptionClasses,
  classNames
} from '@expcat/tigercat-core'

export interface SegmentedProps extends CoreSegmentedProps {
  /** Controlled value */
  value?: string | number
  /** Called when value changes */
  onChange?: (value: string | number) => void
}

export const Segmented: React.FC<SegmentedProps> = ({
  value,
  options = [],
  disabled = false,
  size = 'md',
  block = false,
  className,
  onChange
}) => {
  function handleSelect(opt: SegmentedOption) {
    if (opt.disabled || disabled) return
    if (opt.value === value) return
    onChange?.(opt.value)
  }

  return (
    <div
      className={classNames(getSegmentedContainerClasses(size, block), className)}
      role="radiogroup">
      {options.map((opt) => {
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
            onClick={() => handleSelect(opt)}>
            <span>{opt.label}</span>
          </label>
        )
      })}
    </div>
  )
}
