import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  captureActiveElement,
  classNames,
  findSpotlightShortcutItem,
  focusFirst,
  getEmptyLabels,
  getInitialPickerActiveIndex,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerNavigationIndex,
  getPickerOptionAria,
  getPickerOptionId,
  claimSpotlightHotkey,
  getSpotlightLabels,
  getSpotlightOptionClasses,
  getSpotlightSearchState,
  orderSpotlightWithRecent,
  getSpotlightShortcutLabel,
  isSpotlightHotkeyEnabled,
  isSpotlightToggleHotkey,
  releaseSpotlightHotkey,
  resolveSpotlightIconKind,
  mergeTigerLocale,
  restoreFocus,
  shouldCloseOnMaskClick,
  spotlightEmptyClasses,
  spotlightGroupClasses,
  spotlightGroupLabelClasses,
  spotlightHeaderClasses,
  spotlightInputClasses,
  spotlightItemDescriptionClasses,
  spotlightListClasses,
  spotlightMaskClasses,
  spotlightPanelClasses,
  spotlightRootClasses,
  spotlightShortcutClasses,
  spotlightTitleClasses,
  OVERLAY_Z_INDEX,
  type SpotlightHandle,
  type SpotlightItem,
  type SpotlightProps as CoreSpotlightProps
} from '@expcat/tigercat-core'
import { useBodyScrollLock, useEscapeKey, useFocusTrap } from '../utils/overlay'
import { OverlayPortal } from '../utils/overlay-outlet'
import { useTigerConfig } from './tiger-config'
import { useControlledState } from '../hooks/useControlledState'

export interface SpotlightProps
  extends
    CoreSpotlightProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect' | 'title'> {
  onOpenChange?: (open: boolean) => void
  onQueryChange?: (query: string) => void
  onSelect?: (item: SpotlightItem) => void
  icon?: (item: SpotlightItem) => React.ReactNode
}

const EMPTY_ITEMS: SpotlightItem[] = []

function getRenderableIcon(icon: unknown): React.ReactNode | null {
  const kind = resolveSpotlightIconKind(icon)
  if (kind === 'none') return null
  if (kind === 'text') return icon as React.ReactNode
  if (kind === 'node') return icon as React.ReactNode
  return icon as React.ReactNode
}

export const Spotlight = forwardRef<SpotlightHandle, SpotlightProps>(function Spotlight(
  {
    open,
    defaultOpen = false,
    query,
    defaultQuery = '',
    items = EMPTY_ITEMS,
    title,
    placeholder,
    emptyText,
    locale,
    inputAriaLabel,
    listboxLabel,
    closeOnSelect = true,
    mask = true,
    maskClosable = true,
    zIndex = OVERLAY_Z_INDEX.modal,
    className,
    defaultActiveFirstItem = true,
    filterItem,
    limit,
    recentIds,
    hotkey = false,
    onOpenChange,
    onQueryChange,
    onSelect,
    icon,
    style,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = getSpotlightLabels(mergedLocale)
  const emptyLabels = getEmptyLabels(mergedLocale)
  const resolvedTitle = title === undefined ? labels.title : title
  const placeholderText = placeholder ?? labels.placeholder
  const emptyMessage = emptyText ?? emptyLabels.noResults

  const [resolvedOpen, setOpenValue] = useControlledState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange
  })
  const [resolvedQuery, setQueryValue] = useControlledState<string>({
    value: query,
    defaultValue: defaultQuery ?? '',
    onChange: onQueryChange
  })
  const [activeIndex, setActiveIndex] = useState(-1)

  const reactId = useId()
  const dialogId = `tiger-spotlight-${reactId}`
  const titleId = `${dialogId}-title`
  const listboxId = `${dialogId}-listbox`
  const overlayHostId = `${dialogId}-overlay-host`

  const rootRef = useRef<HTMLDivElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  const searchState = useMemo(
    () =>
      getSpotlightSearchState(orderSpotlightWithRecent(items, recentIds), resolvedQuery, {
        filterItem,
        limit
      }),
    [items, recentIds, resolvedQuery, filterItem, limit]
  )
  const closeSpotlight = useCallback(() => {
    setOpenValue(false)
  }, [setOpenValue])

  const openSpotlight = useCallback(() => {
    setOpenValue(true)
  }, [setOpenValue])

  const toggleSpotlight = useCallback(() => {
    setOpenValue((current) => !current)
  }, [setOpenValue])

  useImperativeHandle(
    ref,
    () => ({
      open: openSpotlight,
      close: closeSpotlight,
      toggle: toggleSpotlight
    }),
    [closeSpotlight, openSpotlight, toggleSpotlight]
  )

  useEscapeKey({ enabled: resolvedOpen, onEscape: closeSpotlight, layerRef: rootRef })
  useBodyScrollLock({ enabled: resolvedOpen })
  useFocusTrap({ enabled: resolvedOpen, containerRef: rootRef, inert: true })

  const hotkeyOwnerRef = useRef<object>({})
  useEffect(() => {
    if (!isSpotlightHotkeyEnabled(hotkey)) return
    const owner = hotkeyOwnerRef.current
    if (!claimSpotlightHotkey(owner)) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isSpotlightToggleHotkey(event, hotkey)) return
      event.preventDefault()
      toggleSpotlight()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      releaseSpotlightHotkey(owner)
    }
  }, [hotkey, toggleSpotlight])

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

  useEffect(() => {
    if (!resolvedOpen || activeIndex < 0) return
    const option = document.getElementById(getPickerOptionId(listboxId, activeIndex))
    option?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, listboxId, resolvedOpen])

  const selectItem = useCallback(
    (item: SpotlightItem) => {
      if (item.disabled) return
      onSelect?.(item)
      if (closeOnSelect) closeSpotlight()
    },
    [closeOnSelect, closeSpotlight, onSelect]
  )

  useEffect(() => {
    if (!resolvedOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      const item = findSpotlightShortcutItem(
        event,
        searchState.flatResults.map((result) => result.item)
      )
      if (!item) return
      event.preventDefault()
      selectItem(item)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [resolvedOpen, searchState.flatResults, selectItem])

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
            (result) => result.item.disabled === true,
            { wrap: true }
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
  const showTitle = Boolean(resolvedTitle)

  const renderOption = (result: (typeof searchState.flatResults)[number]) => {
    const active = result.flatIndex === activeIndex
    const shortcutLabel = getSpotlightShortcutLabel(result.item.shortcut)
    const iconNode = icon?.(result.item) ?? getRenderableIcon(result.item.icon)

    return (
      <div
        key={String(result.item.key)}
        id={getPickerOptionId(listboxId, result.flatIndex)}
        {...getPickerOptionAria({ selected: active, disabled: result.item.disabled })}
        className={getSpotlightOptionClasses(active, result.item.disabled === true)}
        onMouseEnter={() => {
          if (result.item.disabled) return
          setActiveIndex(result.flatIndex)
        }}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => selectItem(result.item)}>
        {iconNode && <span className="shrink-0">{iconNode}</span>}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{result.item.label}</span>
          {result.item.description && (
            <span className={spotlightItemDescriptionClasses}>{result.item.description}</span>
          )}
        </span>
        {shortcutLabel && <kbd className={spotlightShortcutClasses}>{shortcutLabel}</kbd>}
      </div>
    )
  }

  const content = (
    <div
      ref={rootRef}
      className={spotlightRootClasses}
      style={{ zIndex }}
      data-tiger-spotlight-root=""
      data-tiger-overlay-layer="">
      {mask && (
        <div className={spotlightMaskClasses} aria-hidden="true" onClick={handleMaskClick} />
      )}
      <div
        {...rest}
        ref={dialogRef}
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={showTitle ? titleId : undefined}
        aria-label={showTitle ? undefined : labels.title}
        aria-owns={overlayHostId}
        tabIndex={-1}
        className={classNames(spotlightPanelClasses, className)}
        style={style}>
        <div className={spotlightHeaderClasses}>
          {showTitle && (
            <div id={titleId} className={spotlightTitleClasses}>
              {resolvedTitle}
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
              activeOptionId,
              autocomplete: 'list'
            })}
            onChange={(event) => setQueryValue((event.target as HTMLInputElement).value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div
          ref={listRef}
          {...getPickerListboxAria({ id: listboxId, label: listboxLabel })}
          className={spotlightListClasses}>
          {searchState.groups.map((group, groupIndex) =>
            group.label ? (
              <div
                key={group.label}
                className={spotlightGroupClasses}
                role="group"
                aria-label={group.label}>
                <div className={spotlightGroupLabelClasses} aria-hidden="true">
                  {group.label}
                </div>
                {group.items.map(renderOption)}
              </div>
            ) : (
              <React.Fragment key={group.label ?? `group-${groupIndex}`}>
                {group.items.map(renderOption)}
              </React.Fragment>
            )
          )}
        </div>
        {searchState.flatResults.length === 0 ? (
          <div className={spotlightEmptyClasses} role="status" aria-live="polite">
            {emptyMessage}
          </div>
        ) : null}
      </div>
      <div id={overlayHostId} className="contents" data-tiger-overlay-host="" />
    </div>
  )

  return <OverlayPortal>{content}</OverlayPortal>
})

export default Spotlight
