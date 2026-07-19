import React, { useEffect, useId, useRef, useState } from 'react'
import {
  addTags,
  classNames,
  extractTagCandidates,
  formatRemoveTagLabel,
  getTagsInputClearButtonClasses,
  getTagsInputContainerClasses,
  getTagsInputErrorClasses,
  getTagsInputHighlightClasses,
  getTagsInputInnerInputClasses,
  getTagsInputLabels,
  injectShakeStyle,
  removeTagAt,
  SHAKE_CLASS,
  splitTagInput,
  type TagsInputProps as CoreTagsInputProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'
import { useFormItemControlContext } from './FormItemContext'
import { Tag } from './Tag'

export interface TagsInputProps
  extends
    CoreTagsInputProps,
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'onChange' | 'defaultValue' | 'id' | 'onFocus' | 'onBlur'
    > {
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Internal shake trigger counter (used by FormItem)
   * @internal
   */
  _shakeTrigger?: number

  /**
   * Change event handler, called with the full tag list
   */
  onChange?: (value: string[]) => void

  /**
   * Called when a tag is added
   */
  onAdd?: (tag: string) => void

  /**
   * Called when a tag is removed
   */
  onRemove?: (tag: string, index: number) => void

  /**
   * Called when all tags are cleared
   */
  onClear?: () => void

  /**
   * Focus event handler for the inner input
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void

  /**
   * Blur event handler for the inner input
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
}

export const TagsInput: React.FC<TagsInputProps> = ({
  size = 'md',
  status: statusProp,
  errorMessage: errorMessageProp,
  _shakeTrigger: shakeTriggerProp,
  value,
  defaultValue,
  placeholder = '',
  allowDuplicates = false,
  max,
  delimiters = [','],
  addOnBlur = false,
  beforeAdd,
  clearable = false,
  disabled = false,
  readonly = false,
  name,
  id,
  removeTagAriaLabel,
  onChange,
  onAdd,
  onRemove,
  onClear,
  onFocus,
  onBlur,
  className,
  style,
  ...rest
}) => {
  injectShakeStyle()
  const config = useTigerConfig()
  const formItemControl = useFormItemControlContext()
  const status = statusProp ?? formItemControl?.status ?? 'default'
  const errorMessage = errorMessageProp ?? formItemControl?.errorMessage
  const shakeTrigger = shakeTriggerProp ?? formItemControl?.shakeTrigger

  const labels = getTagsInputLabels(config.locale)
  const reactId = useId()
  const errorMsgId = `tiger-tags-input-error-${reactId}`

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [tags, setTags] = useControlledState<string[]>(value, defaultValue ?? [], onChange)
  const [inputText, setInputText] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'error' && containerRef.current) {
      const el = containerRef.current
      el.classList.remove(SHAKE_CLASS)
      void el.offsetWidth // force reflow to restart animation
      el.classList.add(SHAKE_CLASS)
    }
  }, [status, shakeTrigger])

  const isInteractive = !disabled && !readonly

  const commitCandidates = (candidates: string[]) => {
    const prepared: string[] = []
    for (const raw of candidates) {
      if (!beforeAdd) {
        prepared.push(raw)
        continue
      }
      const result = beforeAdd(raw.trim())
      if (result === false) continue
      prepared.push(typeof result === 'string' ? result : raw)
    }
    if (prepared.length === 0) return { added: [] as string[] }
    const { tags: nextTags, added } = addTags(tags, prepared, { allowDuplicates, max })
    if (added.length > 0) {
      setTags(nextTags)
      added.forEach((tag) => onAdd?.(tag))
    }
    return { added }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isInteractive) return
    setHighlightedIndex(null)
    const { candidates, pending } = extractTagCandidates(event.currentTarget.value, delimiters)
    if (candidates.length > 0) commitCandidates(candidates)
    setInputText(pending)
  }

  const removeAt = (index: number) => {
    const tag = tags[index]
    if (tag === undefined) return
    setTags(removeTagAt(tags, index))
    onRemove?.(tag, index)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isInteractive) return
    if (event.key === 'Enter') {
      event.preventDefault()
      if (inputText.trim()) {
        const { added } = commitCandidates([inputText])
        if (added.length > 0) setInputText('')
      }
      return
    }
    if (event.key === 'Backspace' && inputText === '') {
      if (highlightedIndex !== null) {
        removeAt(highlightedIndex)
        setHighlightedIndex(null)
      } else if (tags.length > 0) {
        setHighlightedIndex(tags.length - 1)
      }
      return
    }
    if (event.key === 'ArrowLeft' && inputText === '' && tags.length > 0) {
      setHighlightedIndex((prev) => {
        if (prev === null) return tags.length - 1
        return Math.max(0, prev - 1)
      })
      return
    }
    if (event.key === 'ArrowRight' && highlightedIndex !== null) {
      setHighlightedIndex((prev) => {
        if (prev === null || prev >= tags.length - 1) return null
        return prev + 1
      })
      return
    }
    if (event.key === 'Escape' && highlightedIndex !== null) {
      setHighlightedIndex(null)
      return
    }
    // Any other key returns focus to text editing
    if (highlightedIndex !== null) setHighlightedIndex(null)
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (!isInteractive) return
    const text = event.clipboardData.getData('text')
    const candidates = splitTagInput(text, delimiters)
    if (candidates.length <= 1) return // let the browser insert a single value normally
    event.preventDefault()
    commitCandidates(candidates)
    setInputText('')
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setHighlightedIndex(null)
    if (addOnBlur && inputText.trim() && isInteractive) {
      const { added } = commitCandidates([inputText])
      if (added.length > 0) setInputText('')
    }
    onBlur?.(event)
  }

  const handleClear = () => {
    if (!isInteractive || tags.length === 0) return
    setTags([])
    setInputText('')
    setHighlightedIndex(null)
    onClear?.()
    inputRef.current?.focus()
  }

  const focusInput = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === containerRef.current) inputRef.current?.focus()
  }

  const activeError = status === 'error' && !!errorMessage
  const isFull = max !== undefined && tags.length >= max
  const removeLabelTemplate = removeTagAriaLabel ?? labels.removeTagLabel

  const containerNode = (
    <div
      {...rest}
      ref={containerRef}
      id={id}
      className={classNames(
        getTagsInputContainerClasses(size, status, { disabled }),
        className
      )}
      style={style}
      data-state={isFull ? 'full' : undefined}
      onClick={focusInput}>
      {tags.map((tag, index) => (
        <Tag
          key={`${tag}-${index}`}
          size={size === 'lg' ? 'md' : 'sm'}
          closable={isInteractive}
          closeAriaLabel={formatRemoveTagLabel(removeLabelTemplate, tag)}
          className={index === highlightedIndex ? getTagsInputHighlightClasses() : undefined}
          onClose={(event) => {
            event.preventDefault()
            removeAt(index)
          }}>
          {tag}
        </Tag>
      ))}
      <input
        ref={inputRef}
        className={getTagsInputInnerInputClasses()}
        type="text"
        value={inputText}
        placeholder={tags.length === 0 ? placeholder : ''}
        disabled={disabled}
        readOnly={readonly}
        id={id ? `${id}-input` : undefined}
        {...(status === 'error' ? { 'aria-invalid': true as const } : {})}
        {...(activeError ? { 'aria-describedby': errorMsgId } : {})}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={onFocus}
        onBlur={handleBlur}
      />
      {clearable && tags.length > 0 && isInteractive && (
        <button
          type="button"
          className={getTagsInputClearButtonClasses()}
          onClick={handleClear}
          aria-label={labels.clearAllLabel}
          tabIndex={-1}>
          ✕
        </button>
      )}
      {name && <input type="hidden" name={name} value={tags.join(',')} />}
    </div>
  )

  if (!activeError) return containerNode
  return (
    <div>
      {containerNode}
      <div id={errorMsgId} className={getTagsInputErrorClasses()}>
        {errorMessage}
      </div>
    </div>
  )
}

export default TagsInput
