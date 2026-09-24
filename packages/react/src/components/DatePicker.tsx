import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { icon20ViewBox } from '@expcat/tigercat-core/icons/picker'
import {
  classNames,
  datePickerFooterButtonClasses,
  datePickerFooterClasses,
  datePickerPanelClasses,
  datePickerSheetScrimClasses,
  datePickerShortcutButtonClasses,
  datePickerShortcutListClasses,
  getInputClearButtonClasses,
  getInputPasswordToggleClasses
} from '@expcat/tigercat-core'
import { calendarSolidIcon20PathD, closeSolidIcon20PathD } from '@expcat/tigercat-core/icons/picker'
import { renderOverlayPortal, useAnchoredOverlay, useFocusTrap } from '../utils/overlay'
import { Calendar } from './Calendar'
import { useDatePickerController } from './DatePicker/state'
import type { DatePickerProps, DatePickerRef } from './DatePicker/types'

export type {
  DatePickerBaseProps,
  DatePickerSingleProps,
  DatePickerRangeProps,
  DatePickerProps,
  DatePickerRef
} from './DatePicker/types'

function ChromeIcon({ path, className }: { path: string; className: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon20ViewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false">
      <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
  )
}

export const DatePicker = forwardRef<DatePickerRef, DatePickerProps>(
  function DatePicker(props, ref) {
    const ctx = useDatePickerController(props)
    const overlay = useAnchoredOverlay({
      enabled: ctx.isOpen,
      referenceRef: ctx.inputWrapperRef,
      floatingRef: ctx.panelRef,
      placement: ctx.placement,
      offset: ctx.offset,
      layout: 'bottom-sheet-sm',
      dismissOnOutside: true,
      dismissOnEscape: true,
      restoreFocusOnDismiss: true,
      getContainer: ctx.getPopupContainer,
      onDismiss: () => ctx.setOpenSafe(false)
    })

    useFocusTrap({ enabled: ctx.isOpen, containerRef: ctx.panelRef, inert: true })

    useImperativeHandle(
      ref,
      () => ({
        focus: () => ctx.inputRef.current?.focus(),
        open: () => ctx.setOpenSafe(true),
        close: () => ctx.setOpenSafe(false)
      }),
      [ctx]
    )

    useEffect(() => {
      if (!ctx.isOpen) return
      ctx.panelRef.current?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus()
    }, [ctx.isOpen, ctx.panelRef])

    const panel = ctx.isOpen ? (
      <>
        <button
          type="button"
          className={datePickerSheetScrimClasses}
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => ctx.setOpenSafe(false)}
        />
        <div
          ref={ctx.panelRef}
          id={ctx.panelId}
          role="dialog"
          aria-modal="true"
          aria-label={ctx.labels.calendar}
          className={classNames(
            datePickerPanelClasses,
            overlay.floatingClasses,
            ctx.dropdownClassName
          )}
          style={overlay.floatingStyles}
          data-positioned={overlay.positioned}
          data-tiger="datepicker-panel"
          onBlur={ctx.handleFocusOut}>
          <Calendar
            value={ctx.calendarValue}
            now={ctx.now}
            locale={ctx.mergedLocale}
            weekStartsOn={ctx.weekStartsOn}
            disabledDate={ctx.isDateDisabled}
            rangeValue={ctx.rangeHighlight}
            onChange={ctx.selectDay}
          />
          {ctx.shortcuts && ctx.shortcuts.length > 0 ? (
            <div className={datePickerShortcutListClasses}>
              {ctx.shortcuts.map((shortcut) => (
                <button
                  key={shortcut.label}
                  type="button"
                  className={datePickerShortcutButtonClasses}
                  onClick={() => ctx.applyShortcut(shortcut)}>
                  {shortcut.label}
                </button>
              ))}
            </div>
          ) : null}
          <div className={datePickerFooterClasses}>
            <button
              type="button"
              className={datePickerFooterButtonClasses}
              onClick={ctx.selectToday}>
              {ctx.labels.today}
            </button>
            {ctx.isRangeMode ? (
              <button
                type="button"
                className={datePickerFooterButtonClasses}
                onClick={ctx.confirmOpen}>
                {ctx.labels.ok}
              </button>
            ) : null}
          </div>
        </div>
      </>
    ) : null

    return (
      <div
        ref={ctx.rootRef}
        className={classNames('relative inline-block w-full', props.className)}
        {...{ [ctx.chromeAttr]: '' }}
        onAnimationEnd={() => ctx.rootRef.current?.classList.remove(ctx.shakeClass)}
        onBlur={ctx.handleFocusOut}>
        <div ref={ctx.inputWrapperRef} className={ctx.wrapperClasses}>
          <input
            ref={ctx.inputRef}
            type="text"
            className={ctx.inputClasses}
            value={ctx.displayValue}
            placeholder={ctx.placeholder}
            disabled={ctx.effectiveDisabled}
            readOnly={ctx.isReadOnly}
            required={ctx.required}
            id={ctx.effectiveId}
            autoComplete="off"
            aria-label={ctx.ariaLabel ?? (ctx.labelledby ? undefined : ctx.placeholder)}
            aria-labelledby={ctx.labelledby}
            aria-describedby={ctx.describedBy}
            aria-invalid={ctx.status === 'error' || ctx.validationMessage ? true : undefined}
            aria-required={ctx.required ? true : undefined}
            aria-expanded={ctx.isOpen}
            aria-haspopup="dialog"
            aria-controls={ctx.isOpen ? ctx.panelId : undefined}
            onChange={(event) => {
              if (ctx.effectiveDisabled || ctx.isReadOnly) return
              ctx.onDraftChange(event.target.value)
            }}
            onClick={() => ctx.setOpenSafe(true)}
            onKeyDown={ctx.handleInputKeyDown}
          />
          {ctx.effectiveName ? (
            <input
              type="hidden"
              name={ctx.effectiveName}
              value={ctx.nativeValue}
              disabled={ctx.effectiveDisabled}
            />
          ) : null}
          {ctx.showClear ? (
            <button
              type="button"
              className={getInputClearButtonClasses(ctx.size, {
                offsetSlots: ctx.trailing.clearOffsetSlots
              })}
              aria-label={ctx.labels.clearDate}
              onMouseDown={(event) => event.preventDefault()}
              onClick={ctx.clearValue}>
              <ChromeIcon path={closeSolidIcon20PathD} className="w-4 h-4" />
            </button>
          ) : null}
          <button
            type="button"
            className={getInputPasswordToggleClasses(ctx.size, { offsetSlots: 0 })}
            disabled={ctx.effectiveDisabled || ctx.isReadOnly}
            aria-label={ctx.labels.toggleCalendar}
            aria-expanded={ctx.isOpen}
            aria-haspopup="dialog"
            aria-controls={ctx.isOpen ? ctx.panelId : undefined}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => ctx.setOpenSafe(!ctx.isOpen)}>
            <ChromeIcon path={calendarSolidIcon20PathD} className="w-5 h-5" />
          </button>
          <div id={ctx.validationId} role="status" aria-live="polite" className="sr-only">
            {ctx.validationMessage}
          </div>
        </div>
        {renderOverlayPortal(panel, overlay.target)}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'
