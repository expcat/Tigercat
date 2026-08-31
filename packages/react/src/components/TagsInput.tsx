import React, { forwardRef, useEffect, useId, useRef, useState } from 'react'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  classNames,
  commitTagCandidates,
  extractTagCandidates,
  formatRemoveTagLabel,
  getTagsArrowDelta,
  getTagsInputClearButtonClasses,
  getTagsInputContainerClasses,
  getTagsInputErrorClasses,
  getTagsInputHighlightClasses,
  getTagsInputInnerInputClasses,
  getTagsInputLabels,
  mergeAriaDescribedBy,
  moveTagsHighlight,
  removeTagAt,
  resolveReadOnlyFlag,
  resolveTagsPasteCandidates,
  runShakeAnimation,
  type TagsInputProps as CoreTagsInputProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'
import { useFormItemControlContext } from './FormItemContext'
import { useInputGroupContext } from './InputGroup'
import { Icon } from './Icon'
import { Tag } from './Tag'

export interface TagsInputProps
  extends
    CoreTagsInputProps,
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'onChange' | 'defaultValue' | 'id' | 'onFocus' | 'onBlur'
    > {
  className?: string
  /** @internal */
  _shakeTrigger?: number
  onChange?: (value: string[]) => void
  onAdd?: (tag: string) => void
  onRemove?: (tag: string, index: number) => void
  onClear?: () => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  readOnly?: boolean
}

export const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(function TagsInput(
  {
    size,
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
    readonly: readonlyProp,
    readOnly: readOnlyProp,
    name,
    id,
    removeTagAriaLabel,
    onChange,
    onAdd,
    onRemove,
    onClear,
    onFocus,
    onBlur,
    onClick,
    className,
    style,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const inputGroup = useInputGroupContext()
  const formItemControl = useFormItemControlContext()
  const inGroup = inputGroup != null
  const effectiveSize = size ?? inputGroup?.size ?? 'md'
  const status = statusProp ?? formItemControl?.status ?? 'default'
  const errorMessage = errorMessageProp
  const shakeTrigger = shakeTriggerProp ?? formItemControl?.shakeTrigger
  const effectiveDisabled = Boolean(disabled) || Boolean(formItemControl?.disabled)
  const isReadOnly = resolveReadOnlyFlag(readonlyProp, readOnlyProp)
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const formBoundValue = formItemControl?.value
  const resolvedValue =
    value !== undefined ? value : Array.isArray(formBoundValue) ? formBoundValue : undefined
  const dir = config.direction === 'rtl' ? 'rtl' : 'ltr'
  const labels = getTagsInputLabels(config.locale)
  const reactId = useId()
  const errorMsgId = `tiger-tags-input-error-${reactId}`

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const mountedRef = useRef(false)
  const setInputRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
  }

  const [tags, setTags] = useControlledState<string[]>({
    value: resolvedValue,
    defaultValue: defaultValue ?? [],
    onChange: (next) => {
      onChange?.(next)
      formItemControl?.onChange?.(next)
    }
  })
  const [inputText, setInputText] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (status === 'error') runShakeAnimation(containerRef.current)
  }, [status, shakeTrigger])

  const isInteractive = !effectiveDisabled && !isReadOnly

  const commitCandidates = (candidates: string[], pendingFallback?: string) => {
    const result = commitTagCandidates(tags, candidates, {
      allowDuplicates,
      max,
      beforeAdd,
      pendingFallback
    })
    if (result.added.length > 0) {
      setTags(result.tags)
      result.added.forEach((tag) => onAdd?.(tag))
    }
    return result
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isInteractive) return
    setHighlightedIndex(null)
    const { candidates, pending } = extractTagCandidates(event.currentTarget.value, delimiters)
    if (candidates.length > 0) {
      const result = commitCandidates(candidates, pending || candidates.at(-1))
      setInputText(result.added.length > 0 ? pending : result.pending || pending)
      return
    }
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
      if (!inputText.trim()) return
      event.preventDefault()
      const result = commitCandidates([inputText], inputText)
      if (result.added.length > 0) setInputText('')
      else setInputText(result.pending)
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
    if (event.key === 'Delete' && highlightedIndex !== null) {
      removeAt(highlightedIndex)
      setHighlightedIndex(null)
      return
    }
    const delta = getTagsArrowDelta(event.key, dir)
    if (delta !== null && inputText === '' && (tags.length > 0 || highlightedIndex !== null)) {
      setHighlightedIndex((prev) => moveTagsHighlight(prev, tags.length, delta))
      return
    }
    if (event.key === 'Escape' && highlightedIndex !== null) {
      setHighlightedIndex(null)
      return
    }
    if (highlightedIndex !== null) setHighlightedIndex(null)
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (!isInteractive) return
    const text = event.clipboardData.getData('text')
    const candidates = resolveTagsPasteCandidates(inputText, text, delimiters)
    if (candidates.length <= 1) return
    event.preventDefault()
    const result = commitCandidates(candidates, inputText)
    setInputText(result.added.length > 0 ? '' : result.pending)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const next = event.relatedTarget as Node | null
    if (containerRef.current && next && containerRef.current.contains(next)) {
      return
    }
    setHighlightedIndex(null)
    if (addOnBlur && inputText.trim() && isInteractive) {
      const result = commitCandidates([inputText], inputText)
      if (result.added.length > 0) setInputText('')
    }
    formItemControl?.onBlur?.()
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

  const focusInput = () => inputRef.current?.focus()

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (!(event.target instanceof HTMLButtonElement)) focusInput()
  }

  const handleClose = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    removeAt(index)
    focusInput()
  }

  const activeError = status === 'error' && !!errorMessage
  const hasExtras = activeError
  const isFull = max !== undefined && tags.length >= max
  const removeLabelTemplate = removeTagAriaLabel ?? labels.removeTagLabel
  const labelledby =
    typeof rest['aria-labelledby'] === 'string' && rest['aria-labelledby'].trim()
      ? rest['aria-labelledby']
      : formItemControl?.labelId
  const describedBy = mergeAriaDescribedBy(
    mergeAriaDescribedBy(
      typeof rest['aria-describedby'] === 'string' ? rest['aria-describedby'] : undefined,
      activeError ? errorMsgId : undefined
    ),
    formItemControl?.describedBy
  )

  const containerNode = (
    <div
      {...rest}
      ref={containerRef}
      className={classNames(
        getTagsInputContainerClasses(effectiveSize, status, {
          disabled: effectiveDisabled,
          inGroup: inGroup && !hasExtras
        }),
        !hasExtras ? className : undefined
      )}
      style={!hasExtras ? style : undefined}
      data-state={isFull ? 'full' : undefined}
      onClick={handleContainerClick}
      onAnimationEnd={() => containerRef.current?.classList.remove(SHAKE_CLASS)}
      {...{ [TIGER_CHROME_ATTR]: '' }}>
      {tags.map((tag, index) => (
        <Tag
          key={`${tag}-${index}`}
          size={effectiveSize === 'lg' ? 'md' : 'sm'}
          closable={isInteractive}
          closeTabIndex={-1}
          closeAriaLabel={formatRemoveTagLabel(removeLabelTemplate, tag)}
          className={index === highlightedIndex ? getTagsInputHighlightClasses() : undefined}
          aria-current={index === highlightedIndex ? 'true' : undefined}
          onClose={(event) => handleClose(index, event)}>
          {tag}
        </Tag>
      ))}
      <input
        ref={setInputRefs}
        className={getTagsInputInnerInputClasses()}
        type="text"
        value={inputText}
        placeholder={tags.length === 0 ? placeholder : ''}
        disabled={effectiveDisabled}
        readOnly={isReadOnly}
        id={effectiveId}
        aria-label={typeof rest['aria-label'] === 'string' ? rest['aria-label'] : undefined}
        aria-labelledby={labelledby}
        aria-invalid={status === 'error' ? true : undefined}
        aria-required={formItemControl?.required ? true : undefined}
        aria-describedby={describedBy}
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
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleClear}
          aria-label={labels.clearAllLabel}
          tabIndex={-1}>
          <Icon name="close" size="sm" aria-hidden />
        </button>
      )}
      {effectiveName && !effectiveDisabled
        ? tags.map((tag, index) => (
            <input key={`hidden-${index}`} type="hidden" name={effectiveName} value={tag} />
          ))
        : null}
    </div>
  )

  if (!hasExtras) return containerNode
  return (
    <div
      className={classNames(
        inGroup ? 'flex flex-col flex-1 min-w-0' : 'flex flex-col w-full',
        className
      )}
      style={style}>
      {containerNode}
      <div id={errorMsgId} className={getTagsInputErrorClasses()} aria-live="polite">
        {errorMessage}
      </div>
    </div>
  )
})

TagsInput.displayName = 'TagsInput'

export default TagsInput
