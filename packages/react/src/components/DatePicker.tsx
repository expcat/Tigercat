import React, { useState, useRef, useEffect } from 'react';
import {
  classNames,
  parseDate,
  formatDate,
  formatMonthYear,
  isSameDay,
  isDateInRange,
  getCalendarDays,
  getMonthNames,
  getShortDayNames,
  isToday as isTodayUtil,
  normalizeDate,
  datePickerBaseClasses,
  datePickerInputWrapperClasses,
  getDatePickerInputClasses,
  getDatePickerIconButtonClasses,
  datePickerCalendarClasses,
  datePickerCalendarHeaderClasses,
  datePickerNavButtonClasses,
  datePickerMonthYearClasses,
  datePickerCalendarGridClasses,
  datePickerDayNameClasses,
  getDatePickerDayCellClasses,
  datePickerClearButtonClasses,
  CalendarIconPath,
  CloseIconPath,
  ChevronLeftIconPath,
  ChevronRightIconPath,
  type DatePickerProps as CoreDatePickerProps,
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

export interface DatePickerProps extends CoreDatePickerProps {
  /**
   * Change event handler (single-date mode)
   */
  onChange?: (date: Date | null) => void;

  /**
   * Clear event handler
   */
  onClear?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export type DatePickerRangeValue = [Date | null, Date | null];

export type DatePickerRangeProps = Omit<
  CoreDatePickerProps,
  'value' | 'defaultValue' | 'range'
> & {
  range: true;
  value?: [Date | string | null, Date | string | null] | null;
  defaultValue?: [Date | string | null, Date | string | null] | null;
  onChange?: (range: DatePickerRangeValue) => void;
};

export type DatePickerSingleProps = Omit<
  CoreDatePickerProps,
  'value' | 'defaultValue' | 'range'
> & {
  range?: false;
  value?: Date | string | null;
  defaultValue?: Date | string | null;
  onChange?: (date: Date | null) => void;
};

export type TigerDatePickerProps = (
  | DatePickerSingleProps
  | DatePickerRangeProps
) & {
  /**
   * Clear event handler
   */
  onClear?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
};

export const DatePicker: React.FC<TigerDatePickerProps> = (allProps) => {
  const {
    value,
    defaultValue,
    range,
    locale,
    size = 'md',
    format = 'yyyy-MM-dd',
    placeholder = range ? 'Select date range' : 'Select date',
    disabled = false,
    readonly = false,
    required = false,
    minDate,
    maxDate,
    clearable = true,
    name,
    id,
    onChange,
    onClear,
    className,
    ...props
  } = allProps as TigerDatePickerProps;

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<Date | null>(() =>
    parseDate(
      !range ? (defaultValue as Date | string | null | undefined) : null
    )
  );
  const [internalRangeValue, setInternalRangeValue] =
    useState<DatePickerRangeValue>(() => {
      if (!range) return [null, null];
      const tuple =
        (defaultValue as
          | [Date | string | null, Date | string | null]
          | null
          | undefined) ?? null;
      const start = tuple ? parseDate(tuple[0]) : null;
      const end = tuple ? parseDate(tuple[1]) : null;
      return [start, end];
    });

  const calendarRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRangeMode = range === true;

  // Determine if the component is controlled
  const isControlled = value !== undefined;

  const selectedDate = !isRangeMode
    ? isControlled
      ? parseDate(value as Date | string | null | undefined)
      : internalValue
    : null;

  const selectedRange: DatePickerRangeValue = isRangeMode
    ? (() => {
        const tuple = isControlled
          ? (value as
              | [Date | string | null, Date | string | null]
              | null
              | undefined)
          : (internalRangeValue as DatePickerRangeValue);

        if (!tuple) return [null, null];
        const start = Array.isArray(tuple) ? parseDate(tuple[0]) : null;
        const end = Array.isArray(tuple) ? parseDate(tuple[1]) : null;
        return [start, end];
      })()
    : [null, null];

  const minDateParsed = parseDate(minDate ?? null);
  const maxDateParsed = parseDate(maxDate ?? null);

  // Current viewing month/year in calendar
  const [viewingMonth, setViewingMonth] = useState(
    (selectedDate ?? selectedRange[0])?.getMonth() ?? new Date().getMonth()
  );
  const [viewingYear, setViewingYear] = useState(
    (selectedDate ?? selectedRange[0])?.getFullYear() ??
      new Date().getFullYear()
  );

  const displayValue = (() => {
    if (!isRangeMode) {
      return selectedDate ? formatDate(selectedDate, format) : '';
    }

    const [start, end] = selectedRange;
    const startText = start ? formatDate(start, format) : '';
    const endText = end ? formatDate(end, format) : '';

    if (!startText && !endText) return '';
    if (startText && endText) return `${startText} - ${endText}`;
    return startText ? `${startText} - ` : ` - ${endText}`;
  })();

  const showClearButton = (() => {
    if (!clearable || disabled || readonly) return false;
    if (!isRangeMode) return selectedDate !== null;
    return selectedRange[0] !== null || selectedRange[1] !== null;
  })();

  const calendarDays = getCalendarDays(viewingYear, viewingMonth);
  const monthNames = getMonthNames(locale);
  const dayNames = getShortDayNames(locale);

  const toggleCalendar = () => {
    if (!disabled && !readonly) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        // Reset viewing month to selected date or current month
        const baseDate = selectedDate ?? selectedRange[0];
        if (baseDate) {
          setViewingMonth(baseDate.getMonth());
          setViewingYear(baseDate.getFullYear());
        }
      }
    }
  };

  const closeCalendar = () => {
    setIsOpen(false);
  };

  const setRangeValue = (next: DatePickerRangeValue) => {
    if (!isControlled) {
      setInternalRangeValue(next);
    }
    (onChange as DatePickerRangeProps['onChange'] | undefined)?.(next);
  };

  const selectDate = (date: Date | null) => {
    if (!date) return;

    const normalizedDate = normalizeDate(date);

    // Check if date is disabled
    if (!isDateInRange(normalizedDate, minDateParsed, maxDateParsed)) {
      return;
    }

    if (!isRangeMode) {
      if (!isControlled) {
        setInternalValue(normalizedDate);
      }

      (onChange as DatePickerSingleProps['onChange'] | undefined)?.(
        normalizedDate
      );
      closeCalendar();
      return;
    }

    const [start, end] = selectedRange;

    if (!start || (start && end)) {
      setRangeValue([normalizedDate, null]);
      return;
    }

    if (normalizedDate < start) {
      setRangeValue([normalizedDate, start]);
    } else {
      setRangeValue([start, normalizedDate]);
    }

    closeCalendar();
  };

  const clearDate = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!isRangeMode) {
      if (!isControlled) {
        setInternalValue(null);
      }

      (onChange as DatePickerSingleProps['onChange'] | undefined)?.(null);
    } else {
      setRangeValue([null, null]);
    }

    onClear?.();
  };

  const previousMonth = () => {
    if (viewingMonth === 0) {
      setViewingMonth(11);
      setViewingYear(viewingYear - 1);
    } else {
      setViewingMonth(viewingMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewingMonth === 11) {
      setViewingMonth(0);
      setViewingYear(viewingYear + 1);
    } else {
      setViewingMonth(viewingMonth + 1);
    }
  };

  const isDateDisabled = (date: Date | null): boolean => {
    if (!date) return true;
    return !isDateInRange(date, minDateParsed, maxDateParsed);
  };

  const isCurrentMonth = (date: Date | null): boolean => {
    if (!date) return false;
    return date.getMonth() === viewingMonth;
  };

  const handleInputClick = () => {
    toggleCalendar();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        inputWrapperRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        !inputWrapperRef.current.contains(event.target as Node)
      ) {
        closeCalendar();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isOpen]);

  const inputClasses = getDatePickerInputClasses(size, disabled || readonly);
  const iconButtonClasses = getDatePickerIconButtonClasses(size);

  return (
    <div className={classNames(datePickerBaseClasses, className)} {...props}>
      {/* Input wrapper */}
      <div ref={inputWrapperRef} className={datePickerInputWrapperClasses}>
        {/* Input field for date display */}
        <input
          ref={inputRef}
          type="text"
          className={inputClasses}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={true} // Always readonly to prevent manual text input and ensure date selection via calendar only
          required={required}
          name={name}
          id={id}
          onClick={handleInputClick}
          aria-label={placeholder || 'Select date'}
        />

        {/* Clear button */}
        {showClearButton && (
          <button
            type="button"
            className={datePickerClearButtonClasses}
            onClick={clearDate}
            aria-label="Clear date">
            <Icon path={CloseIconPath} className="w-4 h-4" />
          </button>
        )}

        {/* Calendar icon button */}
        <button
          type="button"
          className={iconButtonClasses}
          disabled={disabled || readonly}
          onClick={toggleCalendar}
          aria-label="Toggle calendar">
          <Icon path={CalendarIconPath} className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar dropdown */}
      {isOpen && (
        <div
          ref={calendarRef}
          className={datePickerCalendarClasses}
          role="dialog"
          aria-label="Calendar">
          {/* Calendar header */}
          <div className={datePickerCalendarHeaderClasses}>
            <button
              type="button"
              className={datePickerNavButtonClasses}
              onClick={previousMonth}
              aria-label="Previous month">
              <Icon path={ChevronLeftIconPath} className="w-5 h-5" />
            </button>
            <div className={datePickerMonthYearClasses}>
              {formatMonthYear(viewingYear, viewingMonth, locale)}
            </div>
            <button
              type="button"
              className={datePickerNavButtonClasses}
              onClick={nextMonth}
              aria-label="Next month">
              <Icon path={ChevronRightIconPath} className="w-5 h-5" />
            </button>
          </div>

          {/* Day names header */}
          <div className={datePickerCalendarGridClasses}>
            {dayNames.map((day) => (
              <div key={day} className={datePickerDayNameClasses}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className={datePickerCalendarGridClasses}>
            {calendarDays.map((date, index) => {
              if (!date) return null;

              const [rangeStart, rangeEnd] = selectedRange;

              const isRangeStart =
                isRangeMode && rangeStart ? isSameDay(date, rangeStart) : false;
              const isRangeEnd =
                isRangeMode && rangeEnd ? isSameDay(date, rangeEnd) : false;
              const isInRange =
                isRangeMode &&
                rangeStart &&
                rangeEnd &&
                normalizeDate(date) >= normalizeDate(rangeStart) &&
                normalizeDate(date) <= normalizeDate(rangeEnd);

              const isSelected = !isRangeMode
                ? selectedDate
                  ? isSameDay(date, selectedDate)
                  : false
                : isRangeStart || isRangeEnd;

              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDay = isTodayUtil(date);
              const isDisabled = isDateDisabled(date);

              return (
                <button
                  key={index}
                  type="button"
                  className={getDatePickerDayCellClasses(
                    isCurrentMonthDay,
                    isSelected,
                    isTodayDay,
                    isDisabled,
                    Boolean(isInRange),
                    Boolean(isRangeStart),
                    Boolean(isRangeEnd)
                  )}
                  disabled={isDisabled}
                  onClick={() => selectDate(date)}
                  aria-label={formatDate(date, 'yyyy-MM-dd')}
                  aria-selected={isSelected}>
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
