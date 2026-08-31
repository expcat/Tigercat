import React, { forwardRef, useCallback, useId, useMemo, useRef, useState } from 'react'
import type {
  ColorSwatchNormalizedOption,
  ColorSwatchProps as CoreColorSwatchProps,
  ColorSwatchRef
} from '@expcat/tigercat-core'
import {
  classNames,
  COLOR_SWATCH_CHECK_PATH,
  colorSwatchBaseClasses,
  colorSwatchGridClasses,
  colorSwatchGroupClasses,
  colorSwatchGroupLabelClasses,
  createDefaultColorSwatchGroups,
  flattenColorSwatchGroups,
  getColorPickerLabels,
  getColorSwatchButtonClasses,
  getColorSwatchCheckClasses,
  getColorSwatchCheckTone,
  getElementTextDirection,
  getNextColorSwatchIndex,
  isColorSwatchSelected,
  markFormItemGroupControl,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  normalizeColorSwatchGroups
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'
import { useFormItemControlContext } from './FormItemContext'

export interface ColorSwatchProps extends CoreColorSwatchProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string, option: ColorSwatchNormalizedOption) => void
  onBlur?: React.FocusEventHandler<HTMLDivElement>
  style?: React.CSSProperties
  'aria-describedby'?: string
  'aria-labelledby'?: string
  'aria-label'?: string
}

export type { ColorSwatchRef }

const ColorSwatchInner = forwardRef<HTMLDivElement, ColorSwatchProps>(function ColorSwatch(
  {
    value,
    defaultValue,
    disabled = false,
    size = 'md',
    colors,
    groups,
    columns = 6,
    ariaLabel,
    className,
    locale,
    labels: labelsOverride,
    name,
    id,
    status: statusProp,
    onChange,
    onBlur,
    style,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const formItemControl = useFormItemControlContext()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getColorPickerLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const status = statusProp ?? formItemControl?.status ?? 'default'
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const describedBy = mergeAriaDescribedBy(
    typeof rest['aria-describedby'] === 'string' ? rest['aria-describedby'] : undefined,
    formItemControl?.describedBy
  )
  const labelledby =
    typeof rest['aria-labelledby'] === 'string' && rest['aria-labelledby'].trim()
      ? rest['aria-labelledby']
      : formItemControl?.labelId
  const groupName =
    typeof rest['aria-label'] === 'string' && rest['aria-label'].trim()
      ? rest['aria-label']
      : (ariaLabel ?? labels.swatches)

  const parsedValue = value !== undefined ? value : (formItemControl?.value as string | undefined)

  const [selectedValue, setSelectedValue] = useControlledState<
    string | undefined,
    [ColorSwatchNormalizedOption]
  >({
    value: value !== undefined || formItemControl?.value !== undefined ? parsedValue : undefined,
    defaultValue,
    onChange: (next, option) => {
      if (next !== undefined) onChange?.(next, option)
      formItemControl?.onChange?.(next)
    }
  })

  const [focusIndex, setFocusIndex] = useState(-1)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const rootRef = useRef<HTMLDivElement | null>(null)
  const reactId = useId()

  const fallbackGroups = useMemo(
    () => createDefaultColorSwatchGroups(labels.primaryGroup, labels.accentGroup),
    [labels.accentGroup, labels.primaryGroup]
  )
  const normalizedGroups = useMemo(
    () => normalizeColorSwatchGroups(groups, colors, fallbackGroups),
    [groups, colors, fallbackGroups]
  )
  const options = useMemo(() => flattenColorSwatchGroups(normalizedGroups), [normalizedGroups])
  const selectedIndex = options.findIndex((option) =>
    isColorSwatchSelected(option.value, selectedValue)
  )
  const firstEnabledIndex = options.findIndex((option) => !option.disabled)
  const activeIndex = selectedIndex >= 0 ? selectedIndex : firstEnabledIndex

  const handleSelect = useCallback(
    (option: ColorSwatchNormalizedOption) => {
      if (effectiveDisabled || option.disabled) return
      setSelectedValue(option.value, option)
    },
    [effectiveDisabled, setSelectedValue]
  )

  function handleKeyDown(optionIndex: number, event: React.KeyboardEvent<HTMLButtonElement>) {
    if (effectiveDisabled) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const option = options[optionIndex]
      if (option) handleSelect(option)
      return
    }

    const dir = getElementTextDirection(rootRef.current)
    const nextIndex = getNextColorSwatchIndex(
      normalizedGroups,
      optionIndex,
      event.key,
      columns,
      dir
    )
    if (nextIndex < 0 || nextIndex === optionIndex) return

    event.preventDefault()
    setFocusIndex(nextIndex)
    optionRefs.current[nextIndex]?.focus()
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget as Node | null
    if (rootRef.current && next && rootRef.current.contains(next)) return
    formItemControl?.onBlur?.()
    onBlur?.(event)
  }

  const assignRoot = (node: HTMLDivElement | null) => {
    rootRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  if (options.length === 0) {
    return (
      <div
        ref={assignRoot}
        className={classNames(colorSwatchBaseClasses, className)}
        style={style}
        id={effectiveId}
      />
    )
  }

  let flatIndex = 0

  return (
    <div
      ref={assignRoot}
      className={classNames(colorSwatchBaseClasses, className)}
      style={style}
      role="radiogroup"
      id={effectiveId}
      aria-label={labelledby ? undefined : groupName}
      aria-labelledby={labelledby}
      aria-describedby={describedBy}
      aria-invalid={status === 'error' ? true : undefined}
      aria-disabled={effectiveDisabled || undefined}
      aria-required={formItemControl?.required || undefined}
      onBlur={handleBlur}>
      {effectiveName ? (
        <input type="hidden" name={effectiveName} value={selectedValue ?? ''} />
      ) : null}
      {normalizedGroups.map((group, groupIndex) => {
        const labelId = group.label ? `${reactId}-g${groupIndex}` : undefined
        return (
          <div
            key={`${groupIndex}-${group.label ?? 'group'}`}
            className={colorSwatchGroupClasses}
            role={group.label ? 'group' : undefined}
            aria-labelledby={labelId}>
            {group.label ? (
              <div id={labelId} className={colorSwatchGroupLabelClasses}>
                {group.label}
              </div>
            ) : null}
            <div
              className={colorSwatchGridClasses}
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {group.colors.map((option) => {
                const optionIndex = flatIndex
                flatIndex += 1
                const selected = isColorSwatchSelected(option.value, selectedValue)
                const optionDisabled = effectiveDisabled || !!option.disabled
                const tabIndex =
                  !optionDisabled && optionIndex === (focusIndex >= 0 ? focusIndex : activeIndex)
                    ? 0
                    : -1
                const tone = getColorSwatchCheckTone(option.value)

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
                    disabled={optionDisabled}
                    tabIndex={tabIndex}
                    onFocus={() => setFocusIndex(optionIndex)}
                    onClick={() => handleSelect(option)}
                    onKeyDown={(event) => handleKeyDown(optionIndex, event)}>
                    {selected ? (
                      <span className={getColorSwatchCheckClasses(size, tone)} aria-hidden="true">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="h-full w-full">
                          <path
                            d={COLOR_SWATCH_CHECK_PATH}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
})

export const ColorSwatch = markFormItemGroupControl(ColorSwatchInner)

export default ColorSwatch
