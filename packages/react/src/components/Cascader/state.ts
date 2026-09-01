import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  CASCADER_DEFAULT_LIST_HEIGHT,
  CASCADER_DEFAULT_SEPARATOR,
  TIGER_CHROME_ATTR,
  coerceCascaderFormValue,
  filterCascaderOptions,
  flattenCascaderOptions,
  formatSelectLevelLabel,
  getCascaderColumnOptionId,
  getCascaderColumns,
  getCascaderDisplayLabel,
  getCascaderOptionKey,
  getCascaderRootClasses,
  getCascaderTriggerClasses,
  getCascaderTriggerKeyIntent,
  getCascaderVirtualAlignScrollTop,
  getCascaderVirtualItemHeight,
  getCascaderVirtualRange,
  getEmptyLabels,
  getPickerNavigationIndex,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerOptionAria,
  getPickerOptionId,
  getSelectLabels,
  initialCascaderColumnActiveIndices,
  isCascaderOptionExpandable,
  isCascaderValueEmpty,
  isSelectTypeaheadCharacter,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  navigateCascaderColumnIndex,
  normalizeCascaderValue,
  rememberCascaderLabel,
  resolveCascaderActivePath,
  serializeCascaderFormValue,
  setCascaderOptionChildren,
  shouldShowCascaderClear,
  type CascaderFlattenedOption,
  type CascaderModelValue,
  type CascaderOption,
  type CascaderValue,
  type InputStatus
} from '@expcat/tigercat-core'
import { useControlledState } from '../../hooks/useControlledState'
import { useTigerConfig } from '../ConfigProvider'
import { useInputGroupContext } from '../InputGroup'
import { useFormItemControlContext } from '../FormItemContext'
import type { CascaderProps } from './types'

const EMPTY_OPTIONS: CascaderOption[] = []

export function useCascaderController(props: CascaderProps) {
  const {
    options: optionsProp = EMPTY_OPTIONS,
    size = 'md',
    disabled = false,
    placeholder,
    searchable = false,
    searchValue,
    defaultSearchValue = '',
    clearable = true,
    emptyText,
    expandTrigger = 'click',
    changeOnSelect = false,
    separator = CASCADER_DEFAULT_SEPARATOR,
    virtual = false,
    listHeight = CASCADER_DEFAULT_LIST_HEIGHT,
    loading = false,
    loadData,
    labels: labelsOverride,
    onSearchChange,
    onOpenChange,
    className,
    value,
    defaultValue,
    onChange,
    open,
    defaultOpen = false,
    status: statusProp,
    name,
    locale,
    id,
    onBlur
  } = props

  const inputGroup = useInputGroupContext()
  const formItemControl = useFormItemControlContext()
  const config = useTigerConfig()
  const dir: 'ltr' | 'rtl' = config.direction === 'rtl' ? 'rtl' : 'ltr'
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getSelectLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const emptyLabels = useMemo(() => getEmptyLabels(mergedLocale), [mergedLocale])

  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const shakeTrigger = formItemControl?.shakeTrigger
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const describedBy = mergeAriaDescribedBy(
    typeof props['aria-describedby'] === 'string' ? props['aria-describedby'] : undefined,
    formItemControl?.describedBy
  )
  const labelledby =
    typeof props['aria-labelledby'] === 'string' && props['aria-labelledby'].trim()
      ? props['aria-labelledby']
      : formItemControl?.labelId
  const ariaLabel =
    typeof props['aria-label'] === 'string' && props['aria-label'].trim()
      ? props['aria-label']
      : undefined
  const required = Boolean(formItemControl?.required)

  const incomingValue =
    value !== undefined ? value : coerceCascaderFormValue(formItemControl?.value)
  const [selected, setSelected] = useControlledState<CascaderModelValue>({
    value: incomingValue,
    defaultValue,
    onChange: (next) => {
      const normalized = normalizeCascaderValue(next)
      onChange?.(normalized)
      formItemControl?.onChange?.(normalized)
    },
    postState: normalizeCascaderValue
  })

  const [isOpen, setOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  })

  const [searchQuery, setSearchQuery] = useControlledState({
    value: searchValue,
    defaultValue: defaultSearchValue,
    onChange: onSearchChange
  })

  const instanceId = useId()
  const listboxId = `tiger-cascader-listbox-${instanceId}`
  const [loadedOptions, setLoadedOptions] = useState<CascaderOption[] | null>(null)
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set())
  const [activePath, setActivePath] = useState<CascaderValue>([])
  const [columnActiveIndices, setColumnActiveIndices] = useState<number[]>([])
  const [focusedColumnIndex, setFocusedColumnIndex] = useState(0)
  const [searchActiveIndex, setSearchActiveIndex] = useState(-1)
  const [columnScrollTops, setColumnScrollTops] = useState<number[]>([])
  const [searchScrollTop, setSearchScrollTop] = useState(0)
  const labelCacheRef = useRef(new Map<string, string>())
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const optionsPropRef = useRef(optionsProp)

  if (optionsPropRef.current !== optionsProp) {
    optionsPropRef.current = optionsProp
    setLoadedOptions(null)
  }

  const options = loadedOptions ?? optionsProp
  const hasLoadData = typeof loadData === 'function'
  const columns = useMemo(
    () => getCascaderColumns(options, activePath, hasLoadData),
    [activePath, hasLoadData, options]
  )
  const isSearchMode = Boolean(searchable) && searchQuery.length > 0
  const flattened = useMemo(
    () => (searchable ? flattenCascaderOptions(options, [], [], changeOnSelect, separator) : []),
    [changeOnSelect, options, searchable, separator]
  )
  const searchResults = useMemo(
    () => (isSearchMode ? filterCascaderOptions(flattened, searchQuery, searchable) : []),
    [flattened, isSearchMode, searchQuery, searchable]
  )

  const displayLabel = getCascaderDisplayLabel(options, selected, separator, labelCacheRef.current)
  const placeholderText = placeholder ?? labels.placeholder
  const displayText = isCascaderValueEmpty(selected) ? placeholderText : displayLabel
  const emptyCopy = resolveEmptyCopy(emptyText, emptyLabels.noResults, loading, labels.loadingText)
  const showClear = shouldShowCascaderClear({
    clearable,
    disabled: effectiveDisabled,
    value: selected
  })

  const closeDropdown = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const openDropdown = useCallback(() => {
    if (effectiveDisabled) return
    setOpen(true)
  }, [effectiveDisabled, setOpen])

  const toggleDropdown = useCallback(() => {
    if (effectiveDisabled) return
    if (isOpen) closeDropdown()
    else openDropdown()
  }, [closeDropdown, effectiveDisabled, isOpen, openDropdown])

  const focusCombobox = useCallback(() => {
    triggerRef.current?.focus()
  }, [])

  const commitPath = useCallback(
    (path: CascaderValue, close: boolean) => {
      const normalized = normalizeCascaderValue(path)
      const label = getCascaderDisplayLabel(options, normalized, separator)
      if (normalized) rememberCascaderLabel(labelCacheRef.current, normalized, label)
      setSelected(normalized)
      if (close) {
        closeDropdown()
        requestAnimationFrame(() => triggerRef.current?.focus())
      }
    },
    [closeDropdown, options, separator, setSelected]
  )

  const loadChildren = useCallback(
    async (option: CascaderOption, path: CascaderValue) => {
      if (!loadData) return
      const key = path.map(String).join('/')
      setLoadingKeys((current) => new Set(current).add(key))
      try {
        const children = await loadData(option)
        setLoadedOptions((current) =>
          setCascaderOptionChildren(current ?? optionsProp, path, children)
        )
      } finally {
        setLoadingKeys((current) => {
          const next = new Set(current)
          next.delete(key)
          return next
        })
      }
    },
    [loadData, optionsProp]
  )

  const activateOption = useCallback(
    (option: CascaderOption, colIndex: number, commitLeaf: boolean) => {
      if (option.disabled || effectiveDisabled) return
      const nextPath = [...activePath.slice(0, colIndex), option.value]
      setActivePath(nextPath)
      const expandable = isCascaderOptionExpandable(option, hasLoadData)
      if (expandable && (!option.children || option.children.length === 0) && loadData) {
        void loadChildren(option, nextPath)
        if (changeOnSelect) commitPath(nextPath, false)
        return
      }
      if (expandable) {
        if (changeOnSelect && commitLeaf) commitPath(nextPath, false)
        setFocusedColumnIndex(colIndex + 1)
        return
      }
      if (commitLeaf) commitPath(nextPath, true)
    },
    [activePath, changeOnSelect, commitPath, effectiveDisabled, hasLoadData, loadChildren, loadData]
  )

  const handleOptionClick = useCallback(
    (option: CascaderOption, colIndex: number) => {
      activateOption(option, colIndex, true)
    },
    [activateOption]
  )

  const handleOptionHover = useCallback(
    (option: CascaderOption, colIndex: number) => {
      if (expandTrigger !== 'hover' || option.disabled) return
      if (!isCascaderOptionExpandable(option, hasLoadData)) return
      activateOption(option, colIndex, false)
    },
    [activateOption, expandTrigger, hasLoadData]
  )

  const handleSearchResultClick = useCallback(
    (item: CascaderFlattenedOption) => {
      if (item.disabled) return
      commitPath(item.valuePath, true)
    },
    [commitPath]
  )

  const clearSelection = useCallback(
    (event?: { stopPropagation: () => void }) => {
      event?.stopPropagation()
      commitPath([], true)
    },
    [commitPath]
  )

  const updateSearchValue = useCallback(
    (query: string) => {
      setSearchQuery(query)
    },
    [setSearchQuery]
  )

  useEffect(() => {
    if (!isOpen) return
    const nextPath = resolveCascaderActivePath(selected)
    setActivePath(nextPath)
    const nextColumns = getCascaderColumns(options, nextPath, hasLoadData)
    setColumnActiveIndices(initialCascaderColumnActiveIndices(nextColumns))
    setFocusedColumnIndex(Math.max(0, nextColumns.length - 1))
    setSearchActiveIndex(0)
    if (searchable) {
      searchInputRef.current?.focus()
    }
  }, [hasLoadData, isOpen, options, searchable, selected])

  useEffect(() => {
    if (!isOpen || isSearchMode) return
    setColumnActiveIndices((previous) => {
      if (previous.length === columns.length) return previous
      return initialCascaderColumnActiveIndices(columns)
    })
  }, [columns, isOpen, isSearchMode])

  const getCurrentColumnIndex = useCallback(() => {
    const last = columns.length - 1
    if (last < 0) return 0
    if (focusedColumnIndex >= 0 && focusedColumnIndex <= last) return focusedColumnIndex
    return last
  }, [columns.length, focusedColumnIndex])

  const commitActiveOption = useCallback(() => {
    if (isSearchMode) {
      const item = searchResults[searchActiveIndex]
      if (item) handleSearchResultClick(item)
      return
    }
    const colIndex = getCurrentColumnIndex()
    const col = columns[colIndex]
    const idx = columnActiveIndices[colIndex] ?? -1
    const option = col?.options[idx]
    if (option) handleOptionClick(option, colIndex)
  }, [
    columnActiveIndices,
    columns,
    getCurrentColumnIndex,
    handleOptionClick,
    handleSearchResultClick,
    isSearchMode,
    searchActiveIndex,
    searchResults
  ])

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (effectiveDisabled) return
    const fromSearchInput = event.currentTarget.tagName === 'INPUT'
    if (!isOpen && isSelectTypeaheadCharacter(event.key, event)) {
      event.preventDefault()
      openDropdown()
      if (searchable) updateSearchValue(event.key)
      return
    }
    const intent = getCascaderTriggerKeyIntent({
      key: event.key,
      open: isOpen,
      searchable: Boolean(searchable),
      searchMode: isSearchMode,
      clearable,
      hasValue: !isCascaderValueEmpty(selected),
      fromSearchInput,
      dir
    })
    switch (intent.type) {
      case 'open':
        event.preventDefault()
        openDropdown()
        return
      case 'close':
        if (event.key !== 'Tab') event.preventDefault()
        closeDropdown()
        triggerRef.current?.focus()
        return
      case 'clear':
        event.preventDefault()
        clearSelection()
        return
      case 'prevent-scroll':
        event.preventDefault()
        openDropdown()
        return
      case 'navigate': {
        event.preventDefault()
        if (isSearchMode) {
          setSearchActiveIndex((current) =>
            getPickerNavigationIndex(searchResults, current, intent.key, (item) => item.disabled)
          )
          return
        }
        const colIndex = getCurrentColumnIndex()
        const col = columns[colIndex]
        if (!col) return
        setColumnActiveIndices((prev) => {
          const next = prev.slice()
          next[colIndex] = navigateCascaderColumnIndex(
            col.options,
            prev[colIndex] ?? -1,
            intent.key
          )
          return next
        })
        setFocusedColumnIndex(colIndex)
        return
      }
      case 'into': {
        event.preventDefault()
        const colIndex = getCurrentColumnIndex()
        const col = columns[colIndex]
        const idx = columnActiveIndices[colIndex] ?? -1
        const option = col?.options[idx]
        if (option && isCascaderOptionExpandable(option, hasLoadData)) {
          handleOptionClick(option, colIndex)
        }
        return
      }
      case 'out': {
        event.preventDefault()
        if (activePath.length > 0) {
          const nextPath = activePath.slice(0, -1)
          setActivePath(nextPath)
          setFocusedColumnIndex(Math.max(0, getCurrentColumnIndex() - 1))
        }
        return
      }
      case 'select-active':
        event.preventDefault()
        commitActiveOption()
        return
      default:
        return
    }
  }

  const handleFocusOut = (event: React.FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null
    if (
      (rootRef.current && next && rootRef.current.contains(next)) ||
      (dropdownRef.current && next && dropdownRef.current.contains(next))
    ) {
      return
    }
    formItemControl?.onBlur?.()
    onBlur?.(event)
  }

  const colIndex = getCurrentColumnIndex()
  const currentOpt = columnActiveIndices[colIndex] ?? -1
  const activeOptionId = !isOpen
    ? undefined
    : isSearchMode
      ? searchActiveIndex >= 0
        ? getPickerOptionId(listboxId, searchActiveIndex)
        : undefined
      : currentOpt >= 0
        ? getCascaderColumnOptionId(listboxId, colIndex, currentOpt)
        : undefined

  const comboboxAria = getPickerComboboxAria({
    expanded: isOpen,
    listboxId,
    activeOptionId
  })
  const listboxAria = getPickerListboxAria({
    id: listboxId,
    label: isSearchMode ? undefined : formatSelectLevelLabel(labels.levelLabel, colIndex + 1)
  })

  const itemHeight = getCascaderVirtualItemHeight(size)
  const alignColumnScroll = (index: number, optionIndex: number) => {
    if (!virtual || optionIndex < 0) return
    setColumnScrollTops((prev) => {
      const next = prev.slice()
      const current = next[index] ?? 0
      next[index] = getCascaderVirtualAlignScrollTop(current, optionIndex, itemHeight, listHeight)
      return next
    })
  }

  useEffect(() => {
    if (!isOpen || !virtual) return
    if (isSearchMode) {
      setSearchScrollTop((current) =>
        getCascaderVirtualAlignScrollTop(current, searchActiveIndex, itemHeight, listHeight)
      )
      return
    }
    alignColumnScroll(colIndex, currentOpt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    colIndex,
    currentOpt,
    isOpen,
    isSearchMode,
    itemHeight,
    listHeight,
    searchActiveIndex,
    virtual
  ])

  const hiddenValue = effectiveName ? serializeCascaderFormValue(selected) : undefined

  return {
    rootRef,
    triggerRef,
    searchInputRef,
    dropdownRef,
    listboxId,
    comboboxAria,
    listboxAria,
    isOpen,
    searchable: Boolean(searchable),
    isSearchMode,
    searchQuery,
    updateSearchValue,
    displayText,
    placeholderText,
    emptyCopy,
    showClear,
    clearAriaLabel: labels.clearAriaLabel,
    searchPlaceholder: labels.searchPlaceholder,
    doneText: labels.doneText,
    backText: labels.backText,
    levelLabel: labels.levelLabel,
    formatLevel: (level: number) => formatSelectLevelLabel(labels.levelLabel, level),
    triggerClasses: getCascaderTriggerClasses({
      size,
      disabled: effectiveDisabled,
      isOpen,
      status,
      hasClear: showClear
    }),
    className: getCascaderRootClasses(inputGroup != null, className),
    chromeAttr: TIGER_CHROME_ATTR,
    status,
    shakeTrigger,
    effectiveId,
    effectiveName,
    effectiveDisabled,
    describedBy,
    labelledby,
    ariaLabel,
    required,
    size,
    virtual,
    listHeight,
    itemHeight,
    columns,
    columnActiveIndices,
    focusedColumnIndex,
    setFocusedColumnIndex,
    searchActiveIndex,
    setSearchActiveIndex,
    searchResults,
    searchableConfig: searchable,
    changeOnSelect,
    separator,
    dir,
    loading,
    loadingKeys,
    hiddenValue,
    getOptionId: (index: number) => getPickerOptionId(listboxId, index),
    getColumnOptionId: (c: number, i: number) => getCascaderColumnOptionId(listboxId, c, i),
    getOptionKey: getCascaderOptionKey,
    optionAria: getPickerOptionAria,
    handleOptionClick,
    handleOptionHover,
    handleSearchResultClick,
    handleTriggerKeyDown,
    handleFocusOut,
    toggleDropdown,
    openDropdown,
    closeDropdown,
    clearSelection,
    focusCombobox,
    columnScrollTops,
    searchScrollTop,
    setSearchScrollTop,
    getVirtualRange: getCascaderVirtualRange,
    isExpandable: (option: CascaderOption) => isCascaderOptionExpandable(option, hasLoadData),
    isSelectedPath: (path: CascaderValue) => (selected ?? []).join('\0') === path.join('\0'),
    isSelectedValue: (col: number, option: CascaderOption) =>
      columns[col]?.selectedValue === option.value || (selected ?? [])[col] === option.value,
    selected
  }
}

function resolveEmptyCopy(
  emptyText: string | undefined,
  noResults: string,
  loading: boolean,
  loadingText: string
): string {
  if (loading) return loadingText
  return emptyText?.trim() ? emptyText : noResults
}
