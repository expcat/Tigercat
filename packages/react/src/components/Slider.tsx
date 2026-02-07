import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
import {
  classNames,
  type SliderProps as CoreSliderProps,
  type SliderSize,
  sliderBaseClasses,
  sliderRangeClasses,
  getSliderTrackClasses,
  getSliderThumbClasses,
  getSliderTooltipClasses,
  sliderGetPercentage,
  sliderGetValueFromPosition,
  sliderGetKeyboardValue
} from '@expcat/tigercat-core'

export interface SliderProps
  extends
    CoreSliderProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'defaultValue' | 'onChange'> {
  /**
   * Callback when value changes
   */
  onChange?: (value: number | [number, number]) => void
}

interface ThumbProps {
  value: number
  thumbType?: 'min' | 'max' | null
  disabled: boolean
  tooltip: boolean
  showTooltip: boolean
  activeThumb: 'min' | 'max' | null
  isDragging: boolean
  min: number
  max: number
  ariaLabel?: string
  ariaLabelledby?: string
  ariaDescribedby?: string
  thumbClasses: string
  tooltipClasses: string
  setShowTooltip: (show: boolean) => void
  handleStart: (event: React.MouseEvent | React.TouchEvent, thumb: 'min' | 'max' | null) => void
  handleKeyDown: (e: React.KeyboardEvent, value: number, thumbType: 'min' | 'max' | null) => void
  getPercentage: (val: number) => number
}

const Thumb = memo<ThumbProps>(
  ({
    value,
    thumbType = null,
    disabled,
    tooltip,
    showTooltip,
    activeThumb,
    isDragging,
    min,
    max,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    thumbClasses,
    tooltipClasses,
    setShowTooltip,
    handleStart,
    handleKeyDown,
    getPercentage
  }) => {
    const left = getPercentage(value)
    const showThumbTooltip = showTooltip && (thumbType === activeThumb || thumbType === null)

    return (
      <div
        className={thumbClasses}
        style={{ left: `${left}%` }}
        tabIndex={disabled ? -1 : 0}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-orientation="horizontal"
        aria-disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        onMouseDown={(e) => handleStart(e, thumbType)}
        onTouchStart={(e) => handleStart(e, thumbType)}
        onMouseEnter={() => {
          if (tooltip) setShowTooltip(true)
        }}
        onMouseLeave={() => {
          if (!isDragging) setShowTooltip(false)
        }}
        onKeyDown={(e) => handleKeyDown(e, value, thumbType)}>
        {showThumbTooltip && tooltip && <div className={tooltipClasses}>{value}</div>}
      </div>
    )
  }
)

export const Slider: React.FC<SliderProps> = ({
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
  onChange,
  className,
  ...props
}) => {
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    ...divProps
  } = props

  // Initialize internal value
  const getInitialValue = (): number | [number, number] => {
    if (controlledValue !== undefined) return controlledValue
    if (defaultValue !== undefined) return defaultValue
    return range ? [min, max] : min
  }

  const [internalValue, setInternalValue] = useState<number | [number, number]>(getInitialValue())
  const [isDragging, setIsDragging] = useState(false)
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue)
    }
  }, [controlledValue])

  const getPercentage = useCallback(
    (val: number): number => sliderGetPercentage(val, min, max),
    [min, max]
  )

  const getValueFromPosition = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return min
      const rect = trackRef.current.getBoundingClientRect()
      return sliderGetValueFromPosition(clientX - rect.left, rect.width, min, max, step)
    },
    [min, max, step]
  )

  // Update value
  const updateValue = useCallback(
    (newValue: number | [number, number]) => {
      setInternalValue(newValue)
      onChange?.(newValue)
    },
    [onChange]
  )

  // Handle mouse/touch move
  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (disabled || !isDragging) return

      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
      const newValue = getValueFromPosition(clientX)

      if (range && Array.isArray(internalValue)) {
        const [minVal, maxVal] = internalValue
        if (activeThumb === 'min') {
          updateValue([Math.min(newValue, maxVal), maxVal])
        } else if (activeThumb === 'max') {
          updateValue([minVal, Math.max(newValue, minVal)])
        }
      } else {
        updateValue(newValue)
      }
    },
    [disabled, isDragging, activeThumb, range, internalValue, getValueFromPosition, updateValue]
  )

  // Handle mouse/touch end
  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setActiveThumb(null)
    setShowTooltip(false)
  }, [])

  // Setup global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleMove(e)
      const handleTouchMove = (e: TouchEvent) => handleMove(e)

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleEnd)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleEnd)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleEnd)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleEnd)
      }
    }
  }, [isDragging, handleMove, handleEnd])

  const handleStart = useCallback(
    (event: React.MouseEvent | React.TouchEvent, thumb: 'min' | 'max' | null) => {
      if (disabled) return
      event.preventDefault()
      setIsDragging(true)
      setActiveThumb(thumb)
      if (tooltip) setShowTooltip(true)
    },
    [disabled, tooltip]
  )

  // Handle track click
  const handleTrackClick = (e: React.MouseEvent) => {
    if (disabled) return

    const newValue = getValueFromPosition(e.clientX)

    if (range && Array.isArray(internalValue)) {
      const [minVal, maxVal] = internalValue
      const distToMin = Math.abs(newValue - minVal)
      const distToMax = Math.abs(newValue - maxVal)

      if (distToMin < distToMax) {
        updateValue([newValue, maxVal])
      } else {
        updateValue([minVal, newValue])
      }
    } else {
      updateValue(newValue)
    }
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, value: number, thumbType: 'min' | 'max' | null) => {
      if (disabled) return
      const newValue = sliderGetKeyboardValue(e.key, value, min, max, step)
      if (newValue === null) return
      e.preventDefault()
      if (range && Array.isArray(internalValue)) {
        const [minVal, maxVal] = internalValue
        if (thumbType === 'min') {
          updateValue([Math.min(newValue, maxVal), maxVal])
        } else if (thumbType === 'max') {
          updateValue([minVal, Math.max(newValue, minVal)])
        }
      } else {
        updateValue(newValue)
      }
    },
    [disabled, min, max, step, range, internalValue, updateValue]
  )

  const trackClasses = useMemo(() => getSliderTrackClasses(size, disabled), [size, disabled])

  const rangeStyles = useMemo<React.CSSProperties>(() => {
    if (range && Array.isArray(internalValue)) {
      const left = getPercentage(internalValue[0])
      return { left: `${left}%`, width: `${getPercentage(internalValue[1]) - left}%` }
    }
    const val = typeof internalValue === 'number' ? internalValue : internalValue[0]
    return { left: '0%', width: `${getPercentage(val)}%` }
  }, [range, internalValue, getPercentage])

  const thumbClasses = useMemo(() => getSliderThumbClasses(size, disabled), [size, disabled])
  const tooltipClasses = useMemo(() => getSliderTooltipClasses(size), [size])

  // Create marks
  const renderMarks = () => {
    if (!marks) return null

    const marksObj = typeof marks === 'boolean' ? {} : marks

    return (
      <div className="absolute w-full top-full mt-2">
        {Object.entries(marksObj).map(([key, label]) => {
          const value = Number(key)
          const left = getPercentage(value)
          return (
            <div
              key={key}
              className="absolute text-xs text-[var(--tiger-text-muted,#6b7280)]"
              style={{ left: `${left}%`, transform: 'translateX(-50%)' }}>
              {label}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={classNames(sliderBaseClasses, disabled && 'cursor-not-allowed', className)}
      {...divProps}>
      {/* Track */}
      <div ref={trackRef} className={trackClasses} onClick={handleTrackClick}>
        {/* Range */}
        <div className={sliderRangeClasses} style={rangeStyles} />

        {/* Thumbs */}
        {range && Array.isArray(internalValue) ? (
          <>
            <Thumb
              value={internalValue[0]}
              thumbType="min"
              disabled={disabled}
              tooltip={tooltip}
              showTooltip={showTooltip}
              activeThumb={activeThumb}
              isDragging={isDragging}
              min={min}
              max={max}
              ariaLabel={ariaLabel ? `${ariaLabel} (min)` : 'Minimum value'}
              ariaLabelledby={ariaLabelledby}
              ariaDescribedby={ariaDescribedby}
              thumbClasses={thumbClasses}
              tooltipClasses={tooltipClasses}
              setShowTooltip={setShowTooltip}
              handleStart={handleStart}
              handleKeyDown={handleKeyDown}
              getPercentage={getPercentage}
            />
            <Thumb
              value={internalValue[1]}
              thumbType="max"
              disabled={disabled}
              tooltip={tooltip}
              showTooltip={showTooltip}
              activeThumb={activeThumb}
              isDragging={isDragging}
              min={min}
              max={max}
              ariaLabel={ariaLabel ? `${ariaLabel} (max)` : 'Maximum value'}
              ariaLabelledby={ariaLabelledby}
              ariaDescribedby={ariaDescribedby}
              thumbClasses={thumbClasses}
              tooltipClasses={tooltipClasses}
              setShowTooltip={setShowTooltip}
              handleStart={handleStart}
              handleKeyDown={handleKeyDown}
              getPercentage={getPercentage}
            />
          </>
        ) : (
          <Thumb
            value={typeof internalValue === 'number' ? internalValue : internalValue[0]}
            disabled={disabled}
            tooltip={tooltip}
            showTooltip={showTooltip}
            activeThumb={activeThumb}
            isDragging={isDragging}
            min={min}
            max={max}
            ariaLabel={ariaLabel}
            ariaLabelledby={ariaLabelledby}
            ariaDescribedby={ariaDescribedby}
            thumbClasses={thumbClasses}
            tooltipClasses={tooltipClasses}
            setShowTooltip={setShowTooltip}
            handleStart={handleStart}
            handleKeyDown={handleKeyDown}
            getPercentage={getPercentage}
          />
        )}
      </div>

      {/* Marks */}
      {renderMarks()}
    </div>
  )
}
