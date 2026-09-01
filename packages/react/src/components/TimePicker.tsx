import { forwardRef, useEffect, useImperativeHandle } from 'react'
import {
  classNames,
  clockSolidIcon20PathD,
  closeSolidIcon20PathD,
  datePickerSheetScrimClasses,
  getInputClearButtonClasses,
  getInputPasswordToggleClasses,
  getTimePickerRangeTabButtonClasses,
  icon20ViewBox,
  timePickerBaseClasses,
  timePickerFooterButtonClasses,
  timePickerFooterClasses,
  timePickerPanelClasses,
  timePickerRangeHeaderClasses
} from '@expcat/tigercat-core'
import { renderOverlayPortal, useAnchoredOverlay, useFocusTrap } from '../utils/overlay'
import { TimePickerDesktopColumns, TimePickerMobileSelects } from './TimePicker/render-panel'
import { useTimePickerController } from './TimePicker/state'
import type { TimePickerProps, TimePickerRef } from './TimePicker/types'

export type {
  TimePickerBaseProps,
  TimePickerSingleProps,
  TimePickerRangeProps,
  TimePickerProps,
  TimePickerRef
} from './TimePicker/types'

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

export const TimePicker = forwardRef<TimePickerRef, TimePickerProps>(
  function TimePicker(props, ref) {
    const ctx = useTimePickerController(props)
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
      const panel = ctx.panelRef.current
      if (!panel) return
      if (ctx.desktop) {
        const selected = panel.querySelector<HTMLElement>(
          '[data-tiger-timepicker-unit="hour"][aria-selected="true"]'
        )
        const first = panel.querySelector<HTMLElement>(
          '[data-tiger-timepicker-unit="hour"]:not([aria-disabled="true"])'
        )
        ;(selected ?? first)?.focus()
        panel.querySelectorAll('[aria-selected="true"]').forEach((node) => {
          ;(node as HTMLElement).scrollIntoView({ block: 'nearest' })
        })
        return
      }
      panel.querySelector('select')?.focus()
    }, [ctx.isOpen, ctx.desktop, ctx.activePart, ctx.panelRef])

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
          aria-label={ctx.labels.dialog}
          className={classNames(
            timePickerPanelClasses,
            overlay.floatingClasses,
            ctx.dropdownClassName
          )}
          style={overlay.floatingStyles}
          data-positioned={overlay.positioned}
          data-tiger="timepicker-panel"
          onBlur={ctx.handleFocusOut}>
          {ctx.isRangeMode ? (
            <div className={timePickerRangeHeaderClasses} role="tablist">
              <button
                type="button"
                role="tab"
                className={getTimePickerRangeTabButtonClasses(ctx.activePart === 'start')}
                aria-selected={ctx.activePart === 'start'}
                onClick={() => ctx.switchPart('start')}>
                {ctx.labels.start}
              </button>
              <button
                type="button"
                role="tab"
                className={getTimePickerRangeTabButtonClasses(ctx.activePart === 'end')}
                aria-selected={ctx.activePart === 'end'}
                onClick={() => ctx.switchPart('end')}>
                {ctx.labels.end}
              </button>
            </div>
          ) : null}
          {ctx.desktop ? (
            <TimePickerDesktopColumns
              columns={ctx.columns}
              onSelect={ctx.selectColumn}
              onKeyDown={ctx.handlePanelKeyDown}
            />
          ) : (
            <TimePickerMobileSelects columns={ctx.columns} onSelect={ctx.selectColumn} />
          )}
          <div className={timePickerFooterClasses}>
            <button type="button" className={timePickerFooterButtonClasses} onClick={ctx.selectNow}>
              {ctx.labels.now}
            </button>
            <button
              type="button"
              className={timePickerFooterButtonClasses}
              onClick={ctx.confirmDraft}>
              {ctx.labels.ok}
            </button>
          </div>
        </div>
      </>
    ) : null

    return (
      <div
        ref={ctx.rootRef}
        className={classNames(timePickerBaseClasses, props.className)}
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
            name={ctx.effectiveName}
            id={ctx.effectiveId}
            autoComplete="off"
            aria-label={ctx.ariaLabel ?? (ctx.labelledby ? undefined : ctx.placeholder)}
            aria-labelledby={ctx.labelledby}
            aria-describedby={ctx.describedBy}
            aria-invalid={ctx.status === 'error' ? true : undefined}
            aria-required={ctx.required ? true : undefined}
            aria-controls={ctx.isOpen ? ctx.panelId : undefined}
            onChange={(event) => ctx.onDraftChange(event.target.value)}
            onClick={() => ctx.setOpenSafe(true)}
            onKeyDown={ctx.handleInputKeyDown}
            onBlur={ctx.parseDraftInput}
          />
          {ctx.showClear ? (
            <button
              type="button"
              className={getInputClearButtonClasses(ctx.size, {
                offsetSlots: ctx.trailing.clearOffsetSlots
              })}
              aria-label={ctx.labels.clear}
              onMouseDown={(event) => event.preventDefault()}
              onClick={ctx.clearValue}>
              <ChromeIcon path={closeSolidIcon20PathD} className="w-4 h-4" />
            </button>
          ) : null}
          <button
            type="button"
            className={getInputPasswordToggleClasses(ctx.size, { offsetSlots: 0 })}
            disabled={ctx.effectiveDisabled || ctx.isReadOnly}
            aria-label={ctx.labels.toggle}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => ctx.setOpenSafe(!ctx.isOpen)}>
            <ChromeIcon path={clockSolidIcon20PathD} className="w-5 h-5" />
          </button>
        </div>
        {renderOverlayPortal(panel, overlay.target)}
      </div>
    )
  }
)

TimePicker.displayName = 'TimePicker'
