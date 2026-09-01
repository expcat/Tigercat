import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import {
  SHAKE_CLASS,
  cascaderDropdownClasses,
  classNames,
  runShakeAnimation,
  selectChevronWrapClasses,
  selectClearButtonClasses,
  selectTrailingSlotClasses
} from '@expcat/tigercat-core'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'
import { useCascaderController } from './Cascader/state'
import { renderCascaderPanel } from './Cascader/render'
import { CascaderClearIcon, CascaderChevronIcon } from './Cascader/icons'
import type { CascaderProps, CascaderRef } from './Cascader/types'

export type { CascaderProps, CascaderRef } from './Cascader/types'
export type { CascaderOption, CascaderValue, CascaderModelValue } from '@expcat/tigercat-core'

export const Cascader = forwardRef<CascaderRef, CascaderProps>(function Cascader(props, ref) {
  const ctx = useCascaderController(props)
  const overlay = useAnchoredOverlay({
    enabled: ctx.isOpen,
    referenceRef: ctx.triggerRef,
    floatingRef: ctx.dropdownRef,
    placement: props.placement ?? 'bottom-start',
    offset: props.offset ?? 4,
    layout: 'fullscreen-sm',
    matchReferenceWidth: ctx.isSearchMode,
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
          ctx.displayText === ctx.placeholderText && 'text-[var(--tiger-text-muted,#9ca3af)]'
        )}>
        {ctx.displayText}
      </span>
    </div>
  )

  const dropdown = ctx.isOpen ? (
    <div
      ref={ctx.dropdownRef}
      className={classNames(
        cascaderDropdownClasses,
        overlay.floatingClasses,
        props.dropdownClassName
      )}
      style={overlay.floatingStyles}
      data-positioned={overlay.positioned}
      data-tiger-cascader-dropdown=""
      onMouseDown={(event) => event.preventDefault()}
      onBlur={ctx.handleFocusOut}>
      {renderCascaderPanel(ctx)}
    </div>
  ) : null

  return (
    <div
      ref={rootRef}
      className={ctx.className}
      style={props.style}
      data-testid="cascader"
      {...{ [ctx.chromeAttr]: '' }}
      onAnimationEnd={() => rootRef.current?.classList.remove(SHAKE_CLASS)}>
      <div className="relative">
        {trigger}
        <span className={selectTrailingSlotClasses}>
          {ctx.showClear ? (
            <button
              type="button"
              className={selectClearButtonClasses}
              data-tiger-cascader-clear=""
              aria-label={ctx.clearAriaLabel}
              onMouseDown={(event) => event.preventDefault()}
              onClick={ctx.clearSelection}>
              <CascaderClearIcon />
            </button>
          ) : null}
          <span
            className={classNames(selectChevronWrapClasses, ctx.isOpen && 'rotate-180')}
            aria-hidden="true">
            <CascaderChevronIcon />
          </span>
        </span>
      </div>
      {ctx.hiddenValue !== undefined ? (
        <input type="hidden" name={ctx.effectiveName} value={ctx.hiddenValue} />
      ) : null}
      {dropdown && renderOverlayPortal(dropdown, overlay.target)}
    </div>
  )
})

Cascader.displayName = 'Cascader'
