import React, { useRef, useEffect, useCallback, useMemo, memo, forwardRef, useState } from 'react'
import {
  type SliderProps as CoreSliderProps,
  sliderRangeClasses,
  sliderHitAreaClasses,
  getSliderRootClasses,
  getSliderTrackClasses,
  getSliderThumbClasses,
  getSliderTooltipClasses,
  sliderGetPercentage,
  sliderGetValueFromClientX,
  sliderGetKeyboardValue,
  sliderResolveMarks,
  sliderValuesEqual,
  sliderApplyThumbValue,
  sliderPickRangeThumb,
  sliderThumbInsetStyle,
  sliderRangeFillStyle,
  sliderSortRange,
  resolveSliderThumbName,
  getSliderLabels,
  mergeAriaDescribedBy,
  createDocumentDragSession,
  getElementTextDirection,
  type DocumentDragSession,
  type InputStatus
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useFormItemControlContext } from './FormItemContext'
import { useTigerConfig } from './ConfigProvider'

export interface SliderProps
  extends
    CoreSliderProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'defaultValue' | 'onChange'> {
  onChange?: (value: number | [number, number]) => void
}

function displaySliderValue(
  value: number | [number, number],
  range: boolean,
  min: number,
  max: number
): number | [number, number] {
  if (range) {
    const tuple = Array.isArray(value) ? value : [min, max]
    const a = Math.min(Math.max(tuple[0], min), max)
    const b = Math.min(Math.max(tuple[1], min), max)
    return sliderSortRange([a, b])
  }
  const n = typeof value === 'number' ? value : value[0]
  return Math.min(Math.max(n, min), max)
}

interface ThumbProps {
  value: number
  thumbType?: 'min' | 'max' | null
  disabled: boolean
  tooltip: boolean
  showTooltip: boolean
  focused: boolean
  activeThumb: 'min' | 'max' | null
  isDragging: boolean
  min: number
  max: number
  ariaLabel?: string
  ariaLabelledby?: string
  ariaDescribedby?: string
  id?: string
  thumbClasses: string
  tooltipClasses: string
  rtl: boolean
  thumbRef?: React.Ref<HTMLDivElement>
  onPointerDown: (event: React.PointerEvent, thumb: 'min' | 'max' | null) => void
  onKeyDown: (e: React.KeyboardEvent, value: number, thumbType: 'min' | 'max' | null) => void
  onFocus: () => void
  onBlur: () => void
  onHoverChange: (hover: boolean) => void
  getPercentage: (val: number) => number
}

const Thumb = memo<ThumbProps>(
  ({
    value,
    thumbType = null,
    disabled,
    tooltip,
    showTooltip,
    focused,
    activeThumb,
    isDragging,
    min,
    max,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    id,
    thumbClasses,
    tooltipClasses,
    rtl,
    thumbRef,
    onPointerDown,
    onKeyDown,
    onFocus,
    onBlur,
    onHoverChange,
    getPercentage
  }) => {
    const pct = getPercentage(value)
    const showThumbTooltip =
      tooltip &&
      (showTooltip || focused || isDragging) &&
      (thumbType === activeThumb || thumbType === null || (!activeThumb && thumbType === null))
    const zIndex = activeThumb && thumbType ? (activeThumb === thumbType ? 2 : 1) : undefined

    return (
      <div
        ref={thumbRef}
        id={id}
        className={thumbClasses}
        style={{ ...sliderThumbInsetStyle(pct, rtl), zIndex }}
        tabIndex={disabled ? -1 : 0}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-orientation="horizontal"
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-valuetext={String(value)}
        onPointerDown={(e) => onPointerDown(e, thumbType)}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={(e) => onKeyDown(e, value, thumbType)}>
        {showThumbTooltip && <div className={tooltipClasses}>{value}</div>}
      </div>
    )
  }
)

export const Slider = forwardRef<HTMLElement, SliderProps>(function Slider(
  {
    value: controlledValue,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    marks = false,
    tooltip = true,
    size = 'md',
    range = false,
    status: statusProp,
    onChange,
    className,
    id,
    onPointerDown,
    ...props
  },
  ref
) {
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    ...divProps
  } = props

  const formItemControl = useFormItemControlContext()
  const config = useTigerConfig()
  const labels = getSliderLabels(config.locale)
  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const effectiveId = id ?? formItemControl?.id
  const describedBy = mergeAriaDescribedBy(
    typeof ariaDescribedby === 'string' ? ariaDescribedby : undefined,
    formItemControl?.describedBy
  )
  const labelledby =
    typeof ariaLabelledby === 'string' && ariaLabelledby.trim()
      ? ariaLabelledby
      : formItemControl?.labelId

  const [internalValue, setInternalValue] = useControlledState<number | [number, number]>({
    value: controlledValue,
    defaultValue: defaultValue ?? (range ? [min, max] : min),
    onChange: (next) => {
      onChange?.(next)
      formItemControl?.onChange?.(next)
    }
  })
  const displayed = displaySliderValue(internalValue, range, min, max)
  const valueRef = useRef(displayed)
  valueRef.current = displayed

  const [isDragging, setIsDragging] = useState(false)
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [focusedThumb, setFocusedThumb] = useState<'min' | 'max' | 'single' | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const dragSessionRef = useRef<DocumentDragSession | null>(null)
  const activeThumbRef = useRef<'min' | 'max' | null>(null)

  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node
    if (range) {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
  }

  const setSingleThumbRef = (node: HTMLDivElement | null) => {
    thumbRef.current = node
    if (!range) {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
  }

  const rtl = getElementTextDirection(trackRef.current ?? rootRef.current) === 'rtl'

  const getPercentage = useCallback(
    (val: number): number => sliderGetPercentage(val, min, max),
    [min, max]
  )

  const commit = useCallback(
    (next: number | [number, number]) => {
      const current = valueRef.current
      if (sliderValuesEqual(current, next)) return
      setInternalValue(next)
    },
    [setInternalValue]
  )

  const stopDrag = useCallback(() => {
    dragSessionRef.current?.dispose()
    dragSessionRef.current = null
    setIsDragging(false)
    setActiveThumb(null)
    activeThumbRef.current = null
    setShowTooltip(false)
  }, [])

  useEffect(() => () => stopDrag(), [stopDrag])

  const handlePointerDown = (event: React.PointerEvent, thumb: 'min' | 'max' | null) => {
    onPointerDown?.(event)
    if (event.defaultPrevented || effectiveDisabled) return
    if (event.button !== 0) return
    event.preventDefault()
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const isRtl = getElementTextDirection(track) === 'rtl'
    const pointerValue = sliderGetValueFromClientX(event.clientX, rect, min, max, step, isRtl)
    const current = valueRef.current
    const which =
      range && Array.isArray(current)
        ? (thumb ?? sliderPickRangeThumb(current, pointerValue))
        : null
    activeThumbRef.current = which
    setActiveThumb(which)
    setIsDragging(true)
    if (tooltip) setShowTooltip(true)
    const next = sliderApplyThumbValue(current, pointerValue, which, range)
    commit(next)
    ;(event.currentTarget as HTMLElement).focus()

    dragSessionRef.current?.dispose()
    dragSessionRef.current = createDocumentDragSession({
      startX: event.clientX,
      startY: event.clientY,
      ownerDocument: event.currentTarget.ownerDocument,
      pointerId: event.pointerId,
      pointerTarget: event.currentTarget,
      onMove: ({ event: moveEvent, currentX }) => {
        if (moveEvent.cancelable) moveEvent.preventDefault()
        const box = trackRef.current?.getBoundingClientRect()
        if (!box) return
        const dir = getElementTextDirection(trackRef.current) === 'rtl'
        const moved = sliderGetValueFromClientX(currentX, box, min, max, step, dir)
        commit(sliderApplyThumbValue(valueRef.current, moved, activeThumbRef.current, range))
      },
      onEnd: () => {
        dragSessionRef.current = null
        setIsDragging(false)
        setActiveThumb(null)
        activeThumbRef.current = null
        setShowTooltip(false)
      }
    })
  }

  const handleTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      event.target !== event.currentTarget &&
      (event.target as HTMLElement).closest('[role="slider"]')
    ) {
      return
    }
    handlePointerDown(event, null)
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, value: number, thumbType: 'min' | 'max' | null) => {
      if (effectiveDisabled) return
      const isRtl = getElementTextDirection(trackRef.current) === 'rtl'
      const newValue = sliderGetKeyboardValue(e.key, value, min, max, step, undefined, isRtl)
      if (newValue === null) return
      e.preventDefault()
      const current = valueRef.current
      const next = sliderApplyThumbValue(current, newValue, thumbType, range)
      commit(next)
    },
    [effectiveDisabled, min, max, step, range, commit]
  )

  const trackClasses = useMemo(
    () => getSliderTrackClasses(size, effectiveDisabled),
    [size, effectiveDisabled]
  )
  const rangeStyles = useMemo(() => {
    if (range && Array.isArray(displayed)) {
      return sliderRangeFillStyle(getPercentage(displayed[0]), getPercentage(displayed[1]), rtl)
    }
    const val = typeof displayed === 'number' ? displayed : displayed[0]
    return sliderRangeFillStyle(0, getPercentage(val), rtl)
  }, [range, displayed, getPercentage, rtl])

  const thumbClasses = useMemo(
    () => getSliderThumbClasses(size, effectiveDisabled, isDragging),
    [size, effectiveDisabled, isDragging]
  )
  const tooltipClasses = useMemo(() => getSliderTooltipClasses(size), [size])
  const marksObj = sliderResolveMarks(marks, min, max, step)

  const named = resolveSliderThumbName({
    thumb: null,
    range: false,
    ariaLabel: typeof ariaLabel === 'string' ? ariaLabel : undefined,
    ariaLabelledby: labelledby,
    labels
  })

  const minNamed = resolveSliderThumbName({
    thumb: 'min',
    range: true,
    ariaLabel: typeof ariaLabel === 'string' ? ariaLabel : undefined,
    ariaLabelledby: labelledby,
    labels
  })
  const maxNamed = resolveSliderThumbName({
    thumb: 'max',
    range: true,
    ariaLabel: typeof ariaLabel === 'string' ? ariaLabel : undefined,
    ariaLabelledby: labelledby,
    labels
  })

  return (
    <div
      {...divProps}
      ref={setRootRef}
      className={getSliderRootClasses(effectiveDisabled, className)}
      data-status={status === 'default' ? undefined : status}>
      <div className={sliderHitAreaClasses} onPointerDown={handleTrackPointerDown}>
        <div ref={trackRef} className={trackClasses} onPointerDown={handleTrackPointerDown}>
          <div className={sliderRangeClasses} style={rangeStyles} />
          {range && Array.isArray(displayed) ? (
            <>
              <Thumb
                value={displayed[0]}
                thumbType="min"
                disabled={effectiveDisabled}
                tooltip={tooltip}
                showTooltip={showTooltip}
                focused={focusedThumb === 'min'}
                activeThumb={activeThumb}
                isDragging={isDragging}
                min={min}
                max={max}
                ariaLabel={minNamed.ariaLabel}
                ariaLabelledby={minNamed.ariaLabelledby}
                ariaDescribedby={describedBy}
                id={effectiveId}
                thumbClasses={thumbClasses}
                tooltipClasses={tooltipClasses}
                rtl={rtl}
                onPointerDown={handlePointerDown}
                onKeyDown={handleKeyDown}
                onHoverChange={(hover) => {
                  if (tooltip) setShowTooltip(hover)
                }}
                onFocus={() => setFocusedThumb('min')}
                onBlur={() => {
                  setFocusedThumb(null)
                  formItemControl?.onBlur?.()
                }}
                getPercentage={getPercentage}
              />
              <Thumb
                value={displayed[1]}
                thumbType="max"
                disabled={effectiveDisabled}
                tooltip={tooltip}
                showTooltip={showTooltip}
                focused={focusedThumb === 'max'}
                activeThumb={activeThumb}
                isDragging={isDragging}
                min={min}
                max={max}
                ariaLabel={maxNamed.ariaLabel}
                ariaLabelledby={maxNamed.ariaLabelledby}
                ariaDescribedby={describedBy}
                thumbClasses={thumbClasses}
                tooltipClasses={tooltipClasses}
                rtl={rtl}
                onPointerDown={handlePointerDown}
                onKeyDown={handleKeyDown}
                onHoverChange={(hover) => {
                  if (tooltip) setShowTooltip(hover)
                }}
                onFocus={() => setFocusedThumb('max')}
                onBlur={() => {
                  setFocusedThumb(null)
                  formItemControl?.onBlur?.()
                }}
                getPercentage={getPercentage}
              />
            </>
          ) : (
            <Thumb
              value={typeof displayed === 'number' ? displayed : displayed[0]}
              disabled={effectiveDisabled}
              tooltip={tooltip}
              showTooltip={showTooltip}
              focused={focusedThumb === 'single'}
              activeThumb={activeThumb}
              isDragging={isDragging}
              min={min}
              max={max}
              ariaLabel={named.ariaLabel}
              ariaLabelledby={named.ariaLabelledby}
              ariaDescribedby={describedBy}
              id={effectiveId}
              thumbClasses={thumbClasses}
              tooltipClasses={tooltipClasses}
              rtl={rtl}
              thumbRef={setSingleThumbRef}
              onPointerDown={handlePointerDown}
              onKeyDown={handleKeyDown}
              onHoverChange={(hover) => {
                if (tooltip) setShowTooltip(hover)
              }}
              onFocus={() => setFocusedThumb('single')}
              onBlur={() => {
                setFocusedThumb(null)
                formItemControl?.onBlur?.()
              }}
              getPercentage={getPercentage}
            />
          )}
        </div>
      </div>
      {Object.keys(marksObj).length > 0 && (
        <div className="relative w-full mt-2 h-4">
          {Object.entries(marksObj).map(([key, label]) => {
            const markValue = Number(key)
            return (
              <div
                key={key}
                className="absolute text-xs text-[var(--tiger-text-muted,#6b7280)] -translate-x-1/2"
                style={sliderThumbInsetStyle(getPercentage(markValue), rtl)}>
                {label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

Slider.displayName = 'Slider'
