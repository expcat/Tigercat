import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  classNames,
  type SliderProps as CoreSliderProps,
  type SliderSize,
  sliderBaseClasses,
  sliderRangeClasses,
  getSliderTrackClasses,
  getSliderThumbClasses,
  getSliderTooltipClasses,
} from '@tigercat/core';

export interface SliderProps
  extends CoreSliderProps,
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'value' | 'defaultValue' | 'onChange'
    > {
  /**
   * Callback when value changes
   */
  onChange?: (value: number | [number, number]) => void;
}

// Thumb component (memoized for performance)
interface ThumbProps {
  value: number;
  thumbType?: 'min' | 'max' | null;
  disabled: boolean;
  tooltip: boolean;
  showTooltip: boolean;
  activeThumb: 'min' | 'max' | null;
  isDragging: boolean;
  size: SliderSize;
  min: number;
  max: number;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
  thumbClassesCombined: string;
  tooltipClassesCombined: string;
  setShowTooltip: (show: boolean) => void;
  handleStart: (
    event: React.MouseEvent | React.TouchEvent,
    thumb: 'min' | 'max' | null
  ) => void;
  handleKeyDown: (
    e: React.KeyboardEvent,
    value: number,
    thumbType: 'min' | 'max' | null
  ) => void;
  getPercentage: (val: number) => number;
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
    thumbClassesCombined,
    tooltipClassesCombined,
    setShowTooltip,
    handleStart,
    handleKeyDown,
    getPercentage,
  }) => {
    const left = getPercentage(value);
    const showThumbTooltip =
      showTooltip && (thumbType === activeThumb || thumbType === null);

    return (
      <div
        className={thumbClassesCombined}
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
          if (tooltip) setShowTooltip(true);
        }}
        onMouseLeave={() => {
          if (!isDragging) setShowTooltip(false);
        }}
        onKeyDown={(e) => handleKeyDown(e, value, thumbType)}>
        {showThumbTooltip && tooltip && (
          <div className={tooltipClassesCombined}>{value}</div>
        )}
      </div>
    );
  }
);

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
  } = props;

  // Initialize internal value
  const getInitialValue = (): number | [number, number] => {
    if (controlledValue !== undefined) return controlledValue;
    if (defaultValue !== undefined) return defaultValue;
    return range ? [min, max] : min;
  };

  const [internalValue, setInternalValue] = useState<number | [number, number]>(
    getInitialValue()
  );
  const [isDragging, setIsDragging] = useState(false);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  // Normalize value to step
  const normalizeValue = useCallback(
    (val: number): number => {
      const steps = Math.round((val - min) / step);
      return Math.min(Math.max(min + steps * step, min), max);
    },
    [min, max, step]
  );

  // Calculate percentage
  const getPercentage = useCallback(
    (val: number): number => {
      return ((val - min) / (max - min)) * 100;
    },
    [min, max]
  );

  // Calculate value from position
  const getValueFromPosition = useCallback(
    (clientX: number): number => {
      if (!trackRef.current) return min;

      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      const rawValue = min + percentage * (max - min);
      return normalizeValue(rawValue);
    },
    [min, max, normalizeValue]
  );

  // Update value
  const updateValue = useCallback(
    (newValue: number | [number, number]) => {
      setInternalValue(newValue);
      onChange?.(newValue);
    },
    [onChange]
  );

  // Handle mouse/touch move
  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (disabled || !isDragging) return;

      const clientX =
        'touches' in event ? event.touches[0].clientX : event.clientX;
      const newValue = getValueFromPosition(clientX);

      if (range && Array.isArray(internalValue)) {
        const [minVal, maxVal] = internalValue;
        if (activeThumb === 'min') {
          updateValue([Math.min(newValue, maxVal), maxVal]);
        } else if (activeThumb === 'max') {
          updateValue([minVal, Math.max(newValue, minVal)]);
        }
      } else {
        updateValue(newValue);
      }
    },
    [
      disabled,
      isDragging,
      activeThumb,
      range,
      internalValue,
      getValueFromPosition,
      updateValue,
    ]
  );

  // Handle mouse/touch end
  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setActiveThumb(null);
    setShowTooltip(false);
  }, []);

  // Setup global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleMove(e);
      const handleTouchMove = (e: TouchEvent) => handleMove(e);

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, handleMove, handleEnd]);

  // Handle mouse/touch start
  const handleStart = (
    event: React.MouseEvent | React.TouchEvent,
    thumb: 'min' | 'max' | null
  ) => {
    if (disabled) return;

    event.preventDefault();
    setIsDragging(true);
    setActiveThumb(thumb);
    if (tooltip) setShowTooltip(true);
  };

  // Handle track click
  const handleTrackClick = (e: React.MouseEvent) => {
    if (disabled) return;

    const newValue = getValueFromPosition(e.clientX);

    if (range && Array.isArray(internalValue)) {
      const [minVal, maxVal] = internalValue;
      const distToMin = Math.abs(newValue - minVal);
      const distToMax = Math.abs(newValue - maxVal);

      if (distToMin < distToMax) {
        updateValue([newValue, maxVal]);
      } else {
        updateValue([minVal, newValue]);
      }
    } else {
      updateValue(newValue);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    value: number,
    thumbType: 'min' | 'max' | null
  ) => {
    if (disabled) return;

    let newValue = value;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      newValue = normalizeValue(value + step);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      newValue = normalizeValue(value - step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      newValue = min;
    } else if (e.key === 'End') {
      e.preventDefault();
      newValue = max;
    } else {
      return;
    }

    if (range && Array.isArray(internalValue)) {
      const [minVal, maxVal] = internalValue;
      if (thumbType === 'min') {
        updateValue([Math.min(newValue, maxVal), maxVal]);
      } else if (thumbType === 'max') {
        updateValue([minVal, Math.max(newValue, minVal)]);
      }
    } else {
      updateValue(newValue);
    }
  };

  // Compute styles
  const trackStyles = getSliderTrackClasses(size, disabled);

  const rangeStyles: React.CSSProperties =
    range && Array.isArray(internalValue)
      ? {
          left: `${getPercentage(internalValue[0])}%`,
          width: `${
            getPercentage(internalValue[1]) - getPercentage(internalValue[0])
          }%`,
        }
      : {
          left: '0%',
          width: `${getPercentage(
            typeof internalValue === 'number' ? internalValue : internalValue[0]
          )}%`,
        };

  const thumbClassesCombined = getSliderThumbClasses(size, disabled);
  const tooltipClassesCombined = getSliderTooltipClasses(size);

  // Create marks
  const renderMarks = () => {
    if (!marks) return null;

    const marksObj = typeof marks === 'boolean' ? {} : marks;

    return (
      <div className="absolute w-full top-full mt-2">
        {Object.entries(marksObj).map(([key, label]) => {
          const value = Number(key);
          const left = getPercentage(value);
          return (
            <div
              key={key}
              className="absolute text-xs text-[var(--tiger-text-muted,#6b7280)]"
              style={{ left: `${left}%`, transform: 'translateX(-50%)' }}>
              {label}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={classNames(
        sliderBaseClasses,
        disabled && 'cursor-not-allowed',
        className
      )}
      {...divProps}>
      {/* Track */}
      <div ref={trackRef} className={trackStyles} onClick={handleTrackClick}>
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
              size={size}
              min={min}
              max={max}
              ariaLabel={ariaLabel ? `${ariaLabel} (min)` : 'Minimum value'}
              ariaLabelledby={ariaLabelledby}
              ariaDescribedby={ariaDescribedby}
              thumbClassesCombined={thumbClassesCombined}
              tooltipClassesCombined={tooltipClassesCombined}
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
              size={size}
              min={min}
              max={max}
              ariaLabel={ariaLabel ? `${ariaLabel} (max)` : 'Maximum value'}
              ariaLabelledby={ariaLabelledby}
              ariaDescribedby={ariaDescribedby}
              thumbClassesCombined={thumbClassesCombined}
              tooltipClassesCombined={tooltipClassesCombined}
              setShowTooltip={setShowTooltip}
              handleStart={handleStart}
              handleKeyDown={handleKeyDown}
              getPercentage={getPercentage}
            />
          </>
        ) : (
          <Thumb
            value={
              typeof internalValue === 'number'
                ? internalValue
                : internalValue[0]
            }
            disabled={disabled}
            tooltip={tooltip}
            showTooltip={showTooltip}
            activeThumb={activeThumb}
            isDragging={isDragging}
            size={size}
            min={min}
            max={max}
            ariaLabel={ariaLabel}
            ariaLabelledby={ariaLabelledby}
            ariaDescribedby={ariaDescribedby}
            thumbClassesCombined={thumbClassesCombined}
            tooltipClassesCombined={tooltipClassesCombined}
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
  );
};
