import React, { useState, useRef, useEffect } from 'react';
import {
  classNames,
  parseTime,
  formatTime,
  formatTimeDisplayWithLocale,
  getTimePeriodLabels,
  to12HourFormat,
  to24HourFormat,
  isTimeInRange,
  generateHours,
  generateMinutes,
  generateSeconds,
  getCurrentTime,
  timePickerBaseClasses,
  timePickerInputWrapperClasses,
  getTimePickerInputClasses,
  getTimePickerIconButtonClasses,
  timePickerClearButtonClasses,
  timePickerPanelClasses,
  timePickerPanelContentClasses,
  timePickerRangeHeaderClasses,
  getTimePickerRangeTabButtonClasses,
  timePickerColumnClasses,
  timePickerColumnHeaderClasses,
  timePickerColumnListClasses,
  getTimePickerItemClasses,
  getTimePickerPeriodButtonClasses,
  timePickerFooterClasses,
  timePickerFooterButtonClasses,
  ClockIconPath,
  TimePickerCloseIconPath,
  type TimePickerProps as CoreTimePickerProps,
} from '@tigercat/core';

// Helper component to render SVG icon
const Icon: React.FC<{ path: string; className: string }> = ({
  path,
  className,
}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor">
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

export type TimePickerRangeValue = [string | null, string | null];

type BaseTimePickerProps = Omit<
  CoreTimePickerProps,
  'value' | 'defaultValue' | 'range'
> & {
  /**
   * Clear event handler
   */
  onClear?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
};

export type TimePickerProps =
  | (BaseTimePickerProps & {
      range?: false;
      value?: string | null;
      defaultValue?: string | null;
      /**
       * Change event handler
       */
      onChange?: (time: string | null) => void;
    })
  | (BaseTimePickerProps & {
      range: true;
      value?: TimePickerRangeValue | null;
      defaultValue?: TimePickerRangeValue | null;
      /**
       * Change event handler
       */
      onChange?: (time: TimePickerRangeValue) => void;
    });

export const TimePicker: React.FC<TimePickerProps> = (allProps) => {
  const {
    size = 'md',
    format = '24',
    showSeconds = false,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    placeholder = 'Select time',
    disabled = false,
    readonly = false,
    required = false,
    minTime,
    maxTime,
    clearable = true,
    name,
    id,
    className,
    onClear,
    locale,
    value: _value,
    defaultValue: _defaultValue,
    range: _range,
    onChange: _onChange,
    ...props
  } = allProps;

  const isRangeMode = allProps.range === true;

  const [isOpen, setIsOpen] = useState(false);

  const [internalSingleValue, setInternalSingleValue] = useState<string | null>(
    () => {
      if (isRangeMode) return null;
      const dv = allProps.defaultValue;
      if (typeof dv === 'string' || dv === null || dv === undefined)
        return dv ?? null;
      return null;
    }
  );

  const [internalRangeValue, setInternalRangeValue] =
    useState<TimePickerRangeValue>(() => {
      const dv = allProps.defaultValue;
      if (Array.isArray(dv)) return [dv[0] ?? null, dv[1] ?? null];
      return [null, null];
    });

  const [activePart, setActivePart] = useState<'start' | 'end'>('start');

  const panelRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizeRangeValue = (input: unknown): TimePickerRangeValue => {
    if (Array.isArray(input)) return [input[0] ?? null, input[1] ?? null];
    return [null, null];
  };

  // Determine if the component is controlled
  const isControlled = allProps.value !== undefined;

  const currentSingleValue: string | null = (() => {
    if (isRangeMode) return null;
    const v = allProps.value;
    if (isControlled && (typeof v === 'string' || v === null)) return v;
    return internalSingleValue;
  })();

  const currentRangeValue: TimePickerRangeValue = (() => {
    if (!isRangeMode) return [null, null];
    if (isControlled) return normalizeRangeValue(allProps.value);
    return internalRangeValue;
  })();

  const activeValue: string | null = isRangeMode
    ? currentRangeValue[activePart === 'start' ? 0 : 1]
    : currentSingleValue;

  const parsedTime = parseTime(activeValue);

  // Internal state for time selection
  const [selectedHours, setSelectedHours] = useState<number>(
    parsedTime?.hours ?? 0
  );
  const [selectedMinutes, setSelectedMinutes] = useState<number>(
    parsedTime?.minutes ?? 0
  );
  const [selectedSeconds, setSelectedSeconds] = useState<number>(
    parsedTime?.seconds ?? 0
  );
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

  // Update internal state when value changes (or active part changes in range mode)
  useEffect(() => {
    const parsed = parseTime(activeValue);
    if (parsed) {
      setSelectedHours(parsed.hours);
      setSelectedMinutes(parsed.minutes);
      setSelectedSeconds(parsed.seconds);

      if (format === '12') {
        const { period } = to12HourFormat(parsed.hours);
        setSelectedPeriod(period);
      }
    }
  }, [activeValue, format, activePart, isRangeMode]);

  const isZh = (locale ?? '').toLowerCase().startsWith('zh');
  const labels = isZh
    ? {
        hour: '时',
        minute: '分',
        second: '秒',
        now: '现在',
        ok: '确定',
        start: '开始',
        end: '结束',
        clear: '清除时间',
        toggle: '打开时间选择器',
        dialog: '时间选择器',
      }
    : {
        hour: 'Hour',
        minute: 'Min',
        second: 'Sec',
        now: 'Now',
        ok: 'OK',
        start: 'Start',
        end: 'End',
        clear: 'Clear time',
        toggle: 'Toggle time picker',
        dialog: 'Time picker',
      };

  const periodLabels = getTimePeriodLabels(locale);

  const singleDisplayValue = parsedTime
    ? formatTimeDisplayWithLocale(
        parsedTime.hours,
        parsedTime.minutes,
        parsedTime.seconds,
        format,
        showSeconds,
        locale
      )
    : '';

  const displayValue = (() => {
    if (!isRangeMode) return singleDisplayValue;

    const toDisplay = (timeStr: string | null): string => {
      const parsed = parseTime(timeStr);
      if (!parsed) return '';
      return formatTimeDisplayWithLocale(
        parsed.hours,
        parsed.minutes,
        parsed.seconds,
        format,
        showSeconds,
        locale
      );
    };

    const start = toDisplay(currentRangeValue[0]);
    const end = toDisplay(currentRangeValue[1]);
    if (!start && !end) return '';
    return `${start} - ${end}`;
  })();

  const showClearButton = (() => {
    if (!clearable || disabled || readonly) return false;
    if (!isRangeMode) return currentSingleValue !== null;
    return currentRangeValue[0] !== null || currentRangeValue[1] !== null;
  })();

  const hoursList = generateHours(hourStep, format);
  const minutesList = generateMinutes(minuteStep);
  const secondsList = generateSeconds(secondStep);

  const togglePanel = () => {
    if (!disabled && !readonly) {
      setIsOpen(!isOpen);
      if (!isOpen && parsedTime) {
        setSelectedHours(parsedTime.hours);
        setSelectedMinutes(parsedTime.minutes);
        setSelectedSeconds(parsedTime.seconds);

        if (format === '12') {
          const { period } = to12HourFormat(parsedTime.hours);
          setSelectedPeriod(period);
        }
      }
    }
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  const selectHour = (hour: number) => {
    const hours24 =
      format === '12' ? to24HourFormat(hour, selectedPeriod) : hour;
    setSelectedHours(hours24);
    updateTime(hours24, selectedMinutes, selectedSeconds);
  };

  const selectMinute = (minute: number) => {
    setSelectedMinutes(minute);
    updateTime(selectedHours, minute, selectedSeconds);
  };

  const selectSecond = (second: number) => {
    setSelectedSeconds(second);
    updateTime(selectedHours, selectedMinutes, second);
  };

  const selectPeriod = (period: 'AM' | 'PM') => {
    setSelectedPeriod(period);
    // Convert current hour to 12-hour format, then back to 24-hour with new period
    const { hours: hours12 } = to12HourFormat(selectedHours);
    const hours24 = to24HourFormat(hours12, period);
    setSelectedHours(hours24);
    updateTime(hours24, selectedMinutes, selectedSeconds);
  };

  const updateTime = (hours: number, minutes: number, seconds: number) => {
    if (!isTimeInRange(hours, minutes, minTime, maxTime)) {
      return;
    }

    let timeString = formatTime(hours, minutes, seconds, showSeconds);

    if (!isRangeMode) {
      if (!isControlled) {
        setInternalSingleValue(timeString);
      }
      (allProps as Extract<TimePickerProps, { range?: false }>).onChange?.(
        timeString
      );
      return;
    }

    const index = activePart === 'start' ? 0 : 1;

    const parsedStart = parseTime(currentRangeValue[0]);
    const parsedEnd = parseTime(currentRangeValue[1]);
    const candidateSeconds = hours * 3600 + minutes * 60 + seconds;
    const startSeconds = parsedStart
      ? parsedStart.hours * 3600 +
        parsedStart.minutes * 60 +
        parsedStart.seconds
      : null;
    const endSeconds = parsedEnd
      ? parsedEnd.hours * 3600 + parsedEnd.minutes * 60 + parsedEnd.seconds
      : null;

    // Keep range ordered: end should never be earlier than start.
    // If user selects an out-of-order time, clamp the opposite side to match.
    if (activePart === 'end' && parsedStart && startSeconds !== null) {
      if (candidateSeconds < startSeconds) {
        timeString = formatTime(
          parsedStart.hours,
          parsedStart.minutes,
          parsedStart.seconds,
          showSeconds
        );
        setSelectedHours(parsedStart.hours);
        setSelectedMinutes(parsedStart.minutes);
        setSelectedSeconds(parsedStart.seconds);
        if (format === '12') {
          const { period } = to12HourFormat(parsedStart.hours);
          setSelectedPeriod(period);
        }
      }
    }
    const nextRange: TimePickerRangeValue = [
      ...currentRangeValue,
    ] as TimePickerRangeValue;
    nextRange[index] = timeString;

    if (
      activePart === 'start' &&
      endSeconds !== null &&
      candidateSeconds > endSeconds
    ) {
      nextRange[1] = timeString;
    }

    if (!isControlled) {
      setInternalRangeValue(nextRange);
    }
    (allProps as Extract<TimePickerProps, { range: true }>).onChange?.(
      nextRange
    );

    if (activePart === 'start' && nextRange[1] === null) {
      setActivePart('end');
    }
  };

  const clearTime = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!isRangeMode) {
      if (!isControlled) {
        setInternalSingleValue(null);
      }
      (allProps as Extract<TimePickerProps, { range?: false }>).onChange?.(
        null
      );
      onClear?.();
      return;
    }

    const cleared: TimePickerRangeValue = [null, null];
    if (!isControlled) {
      setInternalRangeValue(cleared);
    }
    (allProps as Extract<TimePickerProps, { range: true }>).onChange?.(cleared);
    onClear?.();
  };

  const setNow = () => {
    const now = getCurrentTime(showSeconds);
    const parsed = parseTime(now);
    if (parsed) {
      setSelectedHours(parsed.hours);
      setSelectedMinutes(parsed.minutes);
      setSelectedSeconds(parsed.seconds);

      if (format === '12') {
        const { period } = to12HourFormat(parsed.hours);
        setSelectedPeriod(period);
      }

      updateTime(parsed.hours, parsed.minutes, parsed.seconds);
    }
  };

  const isHourDisabled = (hour: number): boolean => {
    const hours24 =
      format === '12' ? to24HourFormat(hour, selectedPeriod) : hour;
    return !isTimeInRange(hours24, selectedMinutes, minTime, maxTime);
  };

  const isMinuteDisabled = (minute: number): boolean => {
    return !isTimeInRange(selectedHours, minute, minTime, maxTime);
  };

  const handleInputClick = () => {
    togglePanel();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        inputWrapperRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !inputWrapperRef.current.contains(event.target as Node)
      ) {
        closePanel();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isOpen]);

  const inputClasses = getTimePickerInputClasses(size, disabled || readonly);
  const iconButtonClasses = getTimePickerIconButtonClasses(size);

  return (
    <div className={classNames(timePickerBaseClasses, className)} {...props}>
      {/* Input wrapper */}
      <div ref={inputWrapperRef} className={timePickerInputWrapperClasses}>
        {/* Input field for time display */}
        <input
          ref={inputRef}
          type="text"
          className={inputClasses}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={true}
          required={required}
          name={name}
          id={id}
          onClick={handleInputClick}
          aria-label={placeholder || 'Select time'}
        />

        {/* Clear button */}
        {showClearButton && (
          <button
            type="button"
            className={timePickerClearButtonClasses}
            onClick={clearTime}
            aria-label={labels.clear}>
            <Icon path={TimePickerCloseIconPath} className="w-4 h-4" />
          </button>
        )}

        {/* Clock icon button */}
        <button
          type="button"
          className={iconButtonClasses}
          disabled={disabled || readonly}
          onClick={togglePanel}
          aria-label={labels.toggle}>
          <Icon path={ClockIconPath} className="w-5 h-5" />
        </button>
      </div>

      {/* Time picker panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className={timePickerPanelClasses}
          role="dialog"
          aria-label={labels.dialog}>
          {isRangeMode && (
            <div className={timePickerRangeHeaderClasses}>
              <button
                type="button"
                className={getTimePickerRangeTabButtonClasses(
                  activePart === 'start'
                )}
                onClick={() => setActivePart('start')}
                aria-label={labels.start}
                aria-selected={activePart === 'start'}>
                {labels.start}
              </button>
              <button
                type="button"
                className={getTimePickerRangeTabButtonClasses(
                  activePart === 'end'
                )}
                onClick={() => setActivePart('end')}
                aria-label={labels.end}
                aria-selected={activePart === 'end'}>
                {labels.end}
              </button>
            </div>
          )}

          {/* Columns container */}
          <div className={timePickerPanelContentClasses}>
            {/* Hours column */}
            <div className={timePickerColumnClasses}>
              <div className={timePickerColumnHeaderClasses}>{labels.hour}</div>
              <div className={timePickerColumnListClasses}>
                {hoursList.map((hour) => {
                  const displayHour = format === '12' ? hour : hour;
                  const hours24 =
                    format === '12'
                      ? to24HourFormat(hour, selectedPeriod)
                      : hour;
                  const isSelected = selectedHours === hours24;
                  const isDisabled = isHourDisabled(hour);

                  return (
                    <button
                      key={hour}
                      type="button"
                      className={getTimePickerItemClasses(
                        isSelected,
                        isDisabled
                      )}
                      disabled={isDisabled}
                      onClick={() => selectHour(hour)}
                      aria-label={
                        isZh
                          ? `${displayHour}${labels.hour}`
                          : `${displayHour} hours`
                      }
                      aria-selected={isSelected}>
                      {displayHour.toString().padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes column */}
            <div className={timePickerColumnClasses}>
              <div className={timePickerColumnHeaderClasses}>
                {labels.minute}
              </div>
              <div className={timePickerColumnListClasses}>
                {minutesList.map((minute) => {
                  const isSelected = selectedMinutes === minute;
                  const isDisabled = isMinuteDisabled(minute);

                  return (
                    <button
                      key={minute}
                      type="button"
                      className={getTimePickerItemClasses(
                        isSelected,
                        isDisabled
                      )}
                      disabled={isDisabled}
                      onClick={() => selectMinute(minute)}
                      aria-label={
                        isZh ? `${minute}${labels.minute}` : `${minute} minutes`
                      }
                      aria-selected={isSelected}>
                      {minute.toString().padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seconds column (if enabled) */}
            {showSeconds && (
              <div className={timePickerColumnClasses}>
                <div className={timePickerColumnHeaderClasses}>
                  {labels.second}
                </div>
                <div className={timePickerColumnListClasses}>
                  {secondsList.map((second) => {
                    const isSelected = selectedSeconds === second;

                    return (
                      <button
                        key={second}
                        type="button"
                        className={getTimePickerItemClasses(isSelected, false)}
                        onClick={() => selectSecond(second)}
                        aria-label={
                          isZh
                            ? `${second}${labels.second}`
                            : `${second} seconds`
                        }
                        aria-selected={isSelected}>
                        {second.toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AM/PM column (if 12-hour format) */}
            {format === '12' && (
              <div className={timePickerColumnClasses}>
                <div className={timePickerColumnHeaderClasses}> </div>
                <div className="flex flex-col">
                  <button
                    type="button"
                    className={getTimePickerPeriodButtonClasses(
                      selectedPeriod === 'AM'
                    )}
                    onClick={() => selectPeriod('AM')}
                    aria-label={periodLabels.am}
                    aria-selected={selectedPeriod === 'AM'}>
                    {periodLabels.am}
                  </button>
                  <button
                    type="button"
                    className={getTimePickerPeriodButtonClasses(
                      selectedPeriod === 'PM'
                    )}
                    onClick={() => selectPeriod('PM')}
                    aria-label={periodLabels.pm}
                    aria-selected={selectedPeriod === 'PM'}>
                    {periodLabels.pm}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={timePickerFooterClasses}>
            <button
              type="button"
              className={timePickerFooterButtonClasses}
              onClick={setNow}>
              {labels.now}
            </button>
            <button
              type="button"
              className={timePickerFooterButtonClasses}
              onClick={closePanel}>
              {labels.ok}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
