import React, { useState, useMemo, useCallback, useRef } from 'react'
import { classNames } from '@expcat/tigercat-core'
import type { MentionsSize, MentionOption } from '@expcat/tigercat-core'
import {
  getMentionsInputClasses,
  mentionsDropdownClasses,
  getMentionsOptionClasses,
  extractMentionQuery,
  getCyclicIndex
} from '@expcat/tigercat-core'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'

export interface MentionsProps {
  value?: string
  prefix?: string
  options?: MentionOption[]
  placeholder?: string
  disabled?: boolean
  size?: MentionsSize
  rows?: number
  onChange?: (value: string) => void
  onSelect?: (option: MentionOption) => void
  className?: string
}

export const Mentions: React.FC<MentionsProps> = ({
  value = '',
  prefix: triggerPrefix = '@',
  options = [],
  placeholder,
  disabled = false,
  size = 'md',
  rows = 3,
  onChange,
  onSelect,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [query, setQuery] = useState('')
  const mentionStartRef = useRef(-1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const filteredOptions = useMemo(() => {
    if (!query) return options
    const q = query.toLowerCase()
    return options.filter((o) => !o.disabled && o.label.toLowerCase().includes(q))
  }, [options, query])
  const overlay = useAnchoredOverlay({
    enabled: isOpen && filteredOptions.length > 0,
    referenceRef: textareaRef,
    floatingRef: dropdownRef,
    containerRef,
    placement: 'bottom-start',
    offset: 4,
    dismissOnOutside: true,
    dismissOnEscape: true,
    restoreFocusOnDismiss: true,
    onDismiss: () => setIsOpen(false)
  })

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      onChange?.(newValue)

      const cursorPos = e.target.selectionStart ?? newValue.length
      const result = extractMentionQuery(newValue, cursorPos, triggerPrefix)
      if (result && options.length > 0) {
        setQuery(result.query)
        mentionStartRef.current = result.startPos
        setIsOpen(true)
        setActiveIndex(0)
      } else {
        setIsOpen(false)
      }
    },
    [onChange, triggerPrefix, options.length]
  )

  const selectOption = useCallback(
    (option: MentionOption) => {
      if (option.disabled) return
      const before = value.slice(0, mentionStartRef.current)
      const cursorPos = textareaRef.current?.selectionStart ?? value.length
      const after = value.slice(cursorPos)
      const newValue = `${before}${triggerPrefix}${option.value} ${after}`
      onChange?.(newValue)
      onSelect?.(option)
      setIsOpen(false)
    },
    [value, triggerPrefix, onChange, onSelect]
  )

  const handleKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!isOpen) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => getCyclicIndex(filteredOptions.length, prev, 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => getCyclicIndex(filteredOptions.length, prev, -1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const opt = filteredOptions[activeIndex]
        if (opt) selectOption(opt)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    },
    [isOpen, filteredOptions, activeIndex, selectOption]
  )

  const wrapperClass = classNames('relative', className)

  return (
    <div ref={containerRef} className={wrapperClass}>
      <textarea
        ref={textareaRef}
        value={value}
        className={getMentionsInputClasses(size, disabled)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        onChange={handleInput}
        onKeyDown={handleKeydown}
      />
      {renderOverlayPortal(
        isOpen && filteredOptions.length > 0 ? (
          <div
            ref={dropdownRef}
            className={classNames(mentionsDropdownClasses, overlay.floatingClasses)}
            style={overlay.floatingStyles}
            data-positioned={overlay.positioned}
            role="listbox">
            {filteredOptions.map((opt, i) => (
              <div
                key={opt.value}
                className={getMentionsOptionClasses(i === activeIndex, !!opt.disabled)}
                role="option"
                aria-selected={i === activeIndex}
                onClick={() => selectOption(opt)}>
                {opt.label}
              </div>
            ))}
          </div>
        ) : null,
        overlay.target
      )}
    </div>
  )
}

export default Mentions
