import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  captureActiveElement,
  classNames,
  focusFirst,
  getInitialPickerActiveIndex,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerNavigationIndex,
  getPickerOptionAria,
  getPickerOptionId,
  getSpotlightOptionClasses,
  getSpotlightSearchState,
  getSpotlightShortcutLabel,
  mergeTigerLocale,
  resolveLocaleText,
  restoreFocus,
  shouldCloseOnMaskClick,
  spotlightEmptyClasses,
  spotlightGroupClasses,
  spotlightGroupLabelClasses,
  spotlightHeaderClasses,
  spotlightInputClasses,
  spotlightListClasses,
  spotlightMaskClasses,
  spotlightPanelClasses,
  spotlightRootClasses,
  spotlightTitleClasses,
  type SpotlightItem,
  type SpotlightProps as CoreSpotlightProps
} from '@expcat/tigercat-core'
import { renderBodyPortal, useBodyScrollLock, useEscapeKey, useFocusTrap } from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'
import { useControlledState } from '../hooks/useControlledState'

export interface SpotlightProps
  extends CoreSpotlightProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  onOpenChange?: (open: boolean) => void
  onQueryChange?: (query: string) => void
  onSelect?: (item: SpotlightItem) => void
}

const EMPTY_ITEMS: SpotlightItem[] = []

function getRenderableIcon(icon: unknown): React.ReactNode | null {
  if (icon === null || icon === undefined) return null
  if (typeof icon === 'string' || typeof icon === 'number') return icon
  if (React.isValidElement(icon)) return icon
  if (Array.isArray(icon)) return icon as React.ReactNode
  return null
}

export const Spotlight: React.FC<SpotlightProps> = ({
  open,
  defaultOpen = false,
  query,
  defaultQuery = '',
  items = EMPTY_ITEMS,
  title = 'Spotlight',
  placeholder,
  emptyText,
  locale,
  inputAriaLabel,
  listboxLabel,
  closeOnSelect = true,
  mask = true,
  maskClosable = true,
  zIndex = 1000,
  className,
  defaultActiveFirstItem = true,
  filterItem,
  limit,
  onOpenChange,
  onQueryChange,
  onSelect,
  style,
  ...rest
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const placeholderText = resolveLocaleText(
    'Search',
    placeholder,
    mergedLocale?.common?.searchPlaceholder
  )
  const [resolvedOpen, setOpenValue] = useControlledState<boolean>(
    open,
    defaultOpen ?? false,
    onOpenChange
  )
  const [resolvedQuery, setQueryValue] = useControlledState<string>(
    query,
    defaultQuery ?? '',
    onQueryChange
  )
  const [activeIndex, setActiveIndex] = useState(-1)

  const reactId = useId()
  const dialogId = `tiger-spotlight-${reactId}`
  const titleId = `${dialogId}-title`
  const listboxId = `${dialogId}-listbox`

  const dialogRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  const searchState = useMemo(
    () => getSpotlightSearchState(items, resolvedQuery, { filterItem, limit }),
    [items, resolvedQuery, filterItem, limit]
  )

  const closeSpotlight = useCallback(() => {
    setOpenValue(false)
  }, [setOpenValue])

  useEscapeKey({ enabled: resolvedOpen, onEscape: closeSpotlight })
  useBodyScrollLock({ enabled: resolvedOpen })
  useFocusTrap({ enabled: resolvedOpen, containerRef: dialogRef })

  useEffect(() => {
    if (!resolvedOpen) {
      restoreFocus(previousActiveElementRef.current)
      return
    }

    previousActiveElementRef.current = captureActiveElement()
    const timer = window.setTimeout(() => {
      focusFirst([inputRef.current, dialogRef.current])
    }, 0)

    return () => window.clearTimeout(timer)
  }, [resolvedOpen])

  useEffect(() => {
    if (!resolvedOpen) {
      setActiveIndex(-1)
      return
    }
    setActiveIndex(
      getInitialPickerActiveIndex(
        searchState.flatResults,
        defaultActiveFirstItem,
        (result) => result.item.disabled === true
      )
    )
  }, [resolvedOpen, resolvedQuery, items, searchState.flatResults, defaultActiveFirstItem])

  const selectItem = useCallback(
    (item: SpotlightItem) => {
      if (item.disabled) return
      onSelect?.(item)
      if (closeOnSelect) closeSpotlight()
    },
    [closeOnSelect, closeSpotlight, onSelect]
  )

  const handleMaskClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (shouldCloseOnMaskClick(event, maskClosable)) {
        closeSpotlight()
      }
    },
    [closeSpotlight, maskClosable]
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        event.preventDefault()
        setActiveIndex((current) =>
          getPickerNavigationIndex(
            searchState.flatResults,
            current,
            event.key,
            (result) => result.item.disabled === true
          )
        )
        break
      case 'Enter': {
        event.preventDefault()
        const result = searchState.flatResults[activeIndex]
        if (result) selectItem(result.item)
        break
      }
      case 'Escape':
        event.preventDefault()
        closeSpotlight()
        break
    }
  }

  if (!resolvedOpen) return null

  const activeResult = searchState.flatResults[activeIndex]
  const activeOptionId = activeResult
    ? getPickerOptionId(listboxId, activeResult.flatIndex)
    : undefined

  const content = (
    <div className={spotlightRootClasses} style={{ zIndex }} data-tiger-spotlight-root="">
      {mask && (
        <div className={spotlightMaskClasses} aria-hidden="true" onClick={handleMaskClick} />
      )}
      <div
        ref={dialogRef}
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={classNames(spotlightPanelClasses, className)}
        style={style}
        {...rest}>
        <div className={spotlightHeaderClasses}>
          {title && (
            <div id={titleId} className={spotlightTitleClasses}>
              {title}
            </div>
          )}
          <input
            ref={inputRef}
            value={resolvedQuery}
            type="search"
            className={spotlightInputClasses}
            placeholder={placeholderText}
            aria-label={inputAriaLabel ?? placeholderText}
            autoComplete="off"
            {...getPickerComboboxAria({
              expanded: true,
              listboxId,
              activeOptionId
            })}
            onChange={(event) => setQueryValue(event.currentTarget.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {searchState.flatResults.length > 0 ? (
          <div
            {...getPickerListboxAria({ id: listboxId, label: listboxLabel })}
            className={spotlightListClasses}>
            {searchState.groups.map((group, groupIndex) => (
              <div
                key={group.label ?? `group-${groupIndex}`}
                className={spotlightGroupClasses}
                role={group.label ? 'group' : undefined}
                aria-label={group.label}>
                {group.label && <div className={spotlightGroupLabelClasses}>{group.label}</div>}
                {group.items.map((result) => {
                  const active = result.flatIndex === activeIndex
                  const shortcutLabel = getSpotlightShortcutLabel(result.item.shortcut)
                  const iconNode = getRenderableIcon(result.item.icon)

                  return (
                    <div
                      key={String(result.item.key)}
                      id={getPickerOptionId(listboxId, result.flatIndex)}
                      {...getPickerOptionAria({ selected: active, disabled: result.item.disabled })}
                      className={getSpotlightOptionClasses(active, result.item.disabled === true)}
                      onMouseEnter={() => setActiveIndex(result.flatIndex)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectItem(result.item)}>
                      {iconNode && <span className="shrink-0">{iconNode}</span>}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {result.item.label}
                        </span>
                        {result.item.description && (
                          <span className="block truncate text-xs text-[var(--tiger-spotlight-item-description,var(--tiger-text-muted,#6b7280))]">
                            {result.item.description}
                          </span>
                        )}
                      </span>
                      {shortcutLabel && (
                        <kbd className="shrink-0 rounded border border-[var(--tiger-spotlight-shortcut-border,var(--tiger-border,#d1d5db))] px-1.5 py-0.5 text-xs text-[var(--tiger-spotlight-shortcut-text,var(--tiger-text-muted,#6b7280))]">
                          {shortcutLabel}
                        </kbd>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className={spotlightEmptyClasses}>
            {resolveLocaleText('No results found', emptyText, mergedLocale?.common?.emptyText)}
          </div>
        )}
      </div>
    </div>
  )

  return renderBodyPortal(content)
}

export default Spotlight
