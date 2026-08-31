import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import {
  classNames,
  SHAKE_CLASS,
  runShakeAnimation,
  selectChevronWrapClasses,
  selectClearButtonClasses,
  selectDoneActionClasses,
  selectDoneButtonClasses,
  selectDropdownBaseClasses,
  selectTrailingSlotClasses
} from '@expcat/tigercat-core'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'
import { useSelectController } from './Select/state'
import {
  hasSelectOptionRows,
  renderSelectEmpty,
  renderSelectPanelBody
} from './Select/render-option'
import { SelectClearIcon, SelectChevronIcon } from './Select/icons'
import type { SelectProps } from './Select/types'

export type {
  SelectBaseProps,
  SelectSingleProps,
  SelectMultipleProps,
  SelectProps
} from './Select/types'
export type { SelectOption, SelectOptions } from '@expcat/tigercat-core'

export interface SelectRef {
  focus: () => void
  open: () => void
  close: () => void
}

export const Select = forwardRef<SelectRef, SelectProps>(function Select(props, ref) {
  const ctx = useSelectController(props)
  const overlay = useAnchoredOverlay({
    enabled: ctx.isOpen,
    referenceRef: ctx.triggerRef,
    floatingRef: ctx.dropdownRef,
    placement: props.placement ?? 'bottom-start',
    offset: props.offset ?? 4,
    layout: 'fullscreen-sm',
    matchReferenceWidth: true,
    dismissOnOutside: true,
    dismissOnEscape: true,
    restoreFocusOnDismiss: true,
    getContainer: props.getPopupContainer,
    onDismiss: ctx.closeDropdown
  })

  const rootRef = ctx.rootRef
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (ctx.status === 'error') runShakeAnimation(rootRef.current)
  }, [ctx.status, ctx.shakeTrigger, rootRef])

  useImperativeHandle(
    ref,
    () => ({
      focus: ctx.focusCombobox,
      open: ctx.openDropdown,
      close: ctx.closeDropdown
    }),
    [ctx.closeDropdown, ctx.focusCombobox, ctx.openDropdown]
  )

  const comboboxCommon = {
    ...ctx.comboboxAria,
    id: ctx.effectiveId,
    'aria-label': ctx.ariaLabel,
    'aria-labelledby': ctx.labelledby,
    'aria-describedby': ctx.describedBy,
    'aria-invalid': ctx.status === 'error' ? true : undefined,
    'aria-required': ctx.required ? true : undefined,
    'aria-autocomplete': ctx.searchable ? ('list' as const) : ('none' as const)
  }

  const searchOpen = ctx.searchable && ctx.isOpen
  const trigger = searchOpen ? (
    <input
      ref={(node) => {
        ctx.searchInputRef.current = node
        ctx.triggerRef.current = node
      }}
      type="text"
      className={classNames(ctx.triggerClasses, 'bg-transparent')}
      disabled={ctx.effectiveDisabled}
      value={ctx.searchQuery}
      placeholder={ctx.displayText}
      onChange={(event) => ctx.updateSearchValue(event.target.value)}
      onKeyDown={ctx.handleTriggerKeyDown}
      onBlur={ctx.handleFocusOut}
      {...comboboxCommon}
    />
  ) : (
    <div
      ref={(node) => {
        ctx.triggerRef.current = node
      }}
      tabIndex={ctx.effectiveDisabled ? -1 : 0}
      className={ctx.triggerClasses}
      onClick={ctx.toggleDropdown}
      onKeyDown={ctx.handleTriggerKeyDown}
      onBlur={ctx.handleFocusOut}
      {...comboboxCommon}>
      <span
        className={classNames(
          'flex-1 truncate',
          ctx.displayText === ctx.placeholder && 'text-[var(--tiger-text-muted,#9ca3af)]'
        )}>
        {ctx.displayText}
      </span>
    </div>
  )

  const hasOptions = hasSelectOptionRows(ctx.renderCtx)
  const dropdown = ctx.isOpen ? (
    <div
      ref={ctx.dropdownRef}
      className={classNames(
        selectDropdownBaseClasses,
        overlay.floatingClasses,
        props.dropdownClassName
      )}
      style={overlay.floatingStyles}
      data-positioned={overlay.positioned}
      data-tiger-select-dropdown=""
      onMouseDown={(event) => event.preventDefault()}
      onBlur={ctx.handleFocusOut}>
      {hasOptions ? renderSelectPanelBody(ctx.renderCtx) : renderSelectEmpty(ctx.renderCtx)}
      <div className={selectDoneActionClasses}>
        <button type="button" className={selectDoneButtonClasses} onClick={ctx.closeDropdown}>
          {ctx.doneText}
        </button>
      </div>
    </div>
  ) : null

  return (
    <div
      ref={rootRef}
      className={ctx.className}
      style={props.style}
      {...{ [ctx.chromeAttr]: '' }}
      onAnimationEnd={() => rootRef.current?.classList.remove(SHAKE_CLASS)}>
      <div className="relative">
        {trigger}
        <span className={selectTrailingSlotClasses}>
          {ctx.showClear ? (
            <button
              type="button"
              className={selectClearButtonClasses}
              data-tiger-select-clear=""
              aria-label={ctx.clearAriaLabel}
              onClick={ctx.clearSelection}>
              <SelectClearIcon />
            </button>
          ) : null}
          <span
            className={classNames(selectChevronWrapClasses, ctx.isOpen && 'rotate-180')}
            aria-hidden="true">
            <SelectChevronIcon />
          </span>
        </span>
      </div>
      {ctx.hiddenValues.map((value, index) => (
        <input
          key={`${ctx.effectiveName}-${index}-${value}`}
          type="hidden"
          name={ctx.effectiveName}
          value={value}
        />
      ))}
      {dropdown && renderOverlayPortal(dropdown, overlay.target)}
    </div>
  )
})

Select.displayName = 'Select'
