import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  useId,
  memo,
  forwardRef,
  useState
} from 'react'
import {
  type SliderProps as CoreSliderProps,
  sliderRangeClasses,
  sliderHitAreaClasses,
  coerceSliderFormValue,
  getSliderRootClasses,
  getSliderTrackClasses,
  getSliderThumbClasses,
  getSliderTooltipClasses,
  sliderGetPercentage,
  sliderGetValueFromClientX,
  sliderGetKeyboardValue,
  sliderGetValueFromClientY,
  sliderPushApartRange,
  formatSliderTooltip,
  sliderResolveMarks,
  sliderValuesEqual,
  sliderApplyThumbValue,
  sliderPickRangeThumb,
  sliderThumbInsetStyle,
  sliderRangeFillStyle,
  sliderSortRange,
  sliderDisplayValue,
  sliderBounds,
  shouldSubmitNativeField,
  resolveSliderThumbName,
  getSliderLabels,
  mergeAriaDescribedBy,
  resolveFormItemSeed,
  runShakeAnimation,
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
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'value' | 'defaultValue' | 'onChange' | 'onPointerDown'
    > {
  onChange?: (value: number | [number, number]) => void
  name?: string
  onPointerDown?: React.PointerEventHandler<Element>
}

function displaySliderValue(
  value: number | [number, number] | null,
  range: boolean,
  min: number,
  max: number
): number | [number, number] {
  const { lower, upper } = sliderBounds(min, max)
  if (range) {
    const tuple = Array.isArray(value) ? value : [lower, upper]
    return sliderSortRange([
      sliderDisplayValue(tuple[0], min, max),
      sliderDisplayValue(tuple[1], min, max)
    ])
  }
  const numeric = typeof value === 'number' ? value : lower
  return sliderDisplayValue(numeric, min, max)
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
  suffix?: string
  ariaDescribedby?: string
  ariaInvalid?: boolean
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
  formatTooltip?: (value: number) => string
  readOnly?: boolean
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
    suffix,
    ariaDescribedby,
    ariaInvalid,
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
    getPercentage,
    formatTooltip,
    readOnly = false
  }) => {
    const pct = getPercentage(value)
    const suffixId = suffix ? `${id ?? 'slider'}-suffix` : undefined
    const labelledBy = suffixId
      ? [ariaLabelledby, suffixId].filter(Boolean).join(' ')
      : ariaLabelledby
    const showThumbTooltip =
      tooltip &&
      (thumbType == null
        ? showTooltip || focused || isDragging
        : focused || (isDragging && activeThumb === thumbType))
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
        aria-label={suffix ? undefined : ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid || undefined}
        aria-valuetext={formatSliderTooltip(value, formatTooltip)}
        aria-readonly={readOnly || undefined}
        onPointerDown={(e) => onPointerDown(e, thumbType)}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={(e) => onKeyDown(e, value, thumbType)}>
        {showThumbTooltip && <div className={tooltipClasses}>{value}</div>}
        {suffix && suffixId ? (
          <span id={suffixId} className="sr-only">
            {suffix}
          </span>
        ) : null}
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
    readOnly = false,
    vertical = false,
    pushApart = false,
    showRange = true,
    showInput = false,
    formatTooltip,
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
    name,
    ...divProps
  } = props

  const reactId = useId()
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

  const seeded = resolveFormItemSeed(
    controlledValue,
    formItemControl?.name,
    formItemControl?.value,
    (raw) => coerceSliderFormValue(raw, range)
  )
  const [internalValue, setInternalValue] = useControlledState<number | [number, number]>({
    value:
      seeded === null
        ? range
          ? [min, max]
          : min
        : seeded,
    defaultValue: defaultValue ?? (range ? [min, max] : min),
    onChange: (next) => {
      onChange?.(next)
      formItemControl?.onChange?.(next)
    }
  })
  const [preview, setPreview] = useState<number | [number, number] | null>(null)
  const previewRef = useRef<number | [number, number] | null>(null)
  const rememberPreview = (next: number | [number, number] | null) => {
    previewRef.current = next
    setPreview(next)
  }
  const modelDisplayed = displaySliderValue(internalValue, range, min, max)
  const displayed = preview ?? modelDisplayed
  const valueRef = useRef(displayed)
  valueRef.current = displayed
  const modelRef = useRef(modelDisplayed)
  modelRef.current = modelDisplayed
  const [elementDir, setElementDir] = useState<'ltr' | 'rtl' | null>(null)

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

  useEffect(() => {
    if (status === 'error') runShakeAnimation(rootRef.current)
  }, [status, formItemControl?.shakeTrigger])

  const setSingleThumbRef = (node: HTMLDivElement | null) => {
    thumbRef.current = node
    if (!range) {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
  }

  useLayoutEffect(() => {
    const closest = rootRef.current?.closest('[dir]')
    const attr = closest?.getAttribute('dir')
    setElementDir(attr === 'rtl' || attr === 'ltr' ? attr : null)
  }, [config.direction])
  const rtl = (elementDir ?? (config.direction === 'rtl' ? 'rtl' : 'ltr')) === 'rtl'

  const getPercentage = useCallback(
    (val: number): number => sliderGetPercentage(val, min, max),
    [min, max]
  )

  const commit = useCallback(
    (next: number | [number, number]) => {
      if (sliderValuesEqual(modelRef.current, next)) return
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
    if (event.defaultPrevented || effectiveDisabled || readOnly) return
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
    rememberPreview(sliderApplyThumbValue(current, pointerValue, which, range))
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
        rememberPreview(
          sliderApplyThumbValue(
            previewRef.current ?? valueRef.current,
            moved,
            activeThumbRef.current,
            range
          )
        )
      },
      onEnd: () => {
        if (previewRef.current !== null) commit(previewRef.current)
        rememberPreview(null)
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
      if (effectiveDisabled || readOnly) return
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
    () => getSliderThumbClasses(size, effectiveDisabled, isDragging, status),
    [size, effectiveDisabled, isDragging, status]
  )
  const tooltipClasses = useMemo(() => getSliderTooltipClasses(size), [size])
  const marksObj = sliderResolveMarks(marks, min, max, step)
  const bounds = sliderBounds(min, max)

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
      className={getSliderRootClasses(
        effectiveDisabled,
        className,
        tooltip && (showTooltip || focusedThumb !== null || isDragging),
        status
      )}
      data-status={status === 'default' ? undefined : status}
      data-orientation={vertical ? 'vertical' : 'horizontal'}
      data-show-input={showInput || undefined}
      data-show-range={showRange || undefined}
      data-push-apart={pushApart || undefined}
      data-readonly={readOnly || undefined}
      aria-readonly={readOnly || undefined}
      onBlur={(event) => {
        const next = event.relatedTarget
        if (next && event.currentTarget.contains(next as Node)) return
        formItemControl?.onBlur?.()
      }}>
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
                min={bounds.lower}
                max={bounds.upper}
                ariaLabel={minNamed.ariaLabel}
                ariaLabelledby={minNamed.ariaLabelledby}
                suffix={minNamed.suffix}
                ariaDescribedby={describedBy}
                ariaInvalid={status === 'error'}
                id={effectiveId ?? `${reactId}-min`}
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
                }}
                getPercentage={getPercentage}
                formatTooltip={formatTooltip}
                readOnly={readOnly}
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
                min={bounds.lower}
                max={bounds.upper}
                ariaLabel={maxNamed.ariaLabel}
                ariaLabelledby={maxNamed.ariaLabelledby}
                suffix={maxNamed.suffix}
                ariaDescribedby={describedBy}
                ariaInvalid={status === 'error'}
                id={effectiveId ? `${effectiveId}-max` : `${reactId}-max`}
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
                }}
                getPercentage={getPercentage}
                formatTooltip={formatTooltip}
                readOnly={readOnly}
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
              min={bounds.lower}
              max={bounds.upper}
              ariaLabel={named.ariaLabel}
              ariaLabelledby={named.ariaLabelledby}
              ariaDescribedby={describedBy}
              ariaInvalid={status === 'error'}
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
              }}
              getPercentage={getPercentage}
                formatTooltip={formatTooltip}
                readOnly={readOnly}
            />
          )}
        </div>
      </div>
      {Object.keys(marksObj).length > 0 && (
        <div className="relative w-full mt-2 h-4">
          {Object.entries(marksObj).map(([key, label]) => {
            const markValue = Number(key)
            return (
              <button
                key={key}
                type="button"
                className="absolute text-xs text-[var(--tiger-text-secondary)] -translate-x-1/2"
                style={sliderThumbInsetStyle(getPercentage(markValue), rtl)}
                disabled={effectiveDisabled || readOnly}
                onClick={() => {
                  if (effectiveDisabled || readOnly) return
                  const current = valueRef.current
                  commit(
                    range && Array.isArray(current)
                      ? (sliderApplyThumbValue(
                          current,
                          markValue,
                          sliderPickRangeThumb(current, markValue),
                          true
                        ) as [number, number])
                      : markValue
                  )
                }}>
                {label}
              </button>
            )
          })}
        </div>
      )}
      {shouldSubmitNativeField({
        name: name ?? formItemControl?.name,
        disabled: effectiveDisabled
      }) ? (
        <input
          type="hidden"
          name={name ?? formItemControl?.name}
          value={
            seeded === null
              ? ''
              : Array.isArray(displayed)
                ? `${displayed[0]},${displayed[1]}`
                : String(displayed)
          }
        />
      ) : null}
    </div>
  )
})

Slider.displayName = 'Slider'
