import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  CASCADER_DEFAULT_LIST_HEIGHT,
  CASCADER_DEFAULT_SEPARATOR,
  TIGER_CHROME_ATTR,
  cascaderPathId,
  cascaderValuesEqual,
  coerceCascaderFormValue,
  decideAfterBranchLoad,
  filterCascaderOptions,
  flattenCascaderOptions,
  formatSelectLevelLabel,
  gateCascaderLoad,
  getCascaderColumnOptionId,
  getCascaderColumns,
  getCascaderDisplayLabel,
  getCascaderLabels,
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
  isCurrentLoadToken,
  isSelectTypeaheadCharacter,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  navigateCascaderColumnIndex,
  nextCascaderBrowsePath,
  nextLoadToken,
  normalizeCascaderValue,
  rememberCascaderLabel,
  sameTreeKey,
  serializeCascaderFormValue,
  setCascaderOptionChildren,
  shouldSeedCascaderFormDefault,
  shouldShowCascaderClear,
  shouldSubmitNativeField,
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
    readOnly = false,
    emptyText,
    expandTrigger = 'click',
    changeOnSelect = false,
    separator = CASCADER_DEFAULT_SEPARATOR,
    virtual = false,
    listHeight = CASCADER_DEFAULT_LIST_HEIGHT,
    loading = false,
    loadData,
    labels: labelsOverride,
    onSearch,
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
  const selectLabels = useMemo(
    () => getSelectLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const cascaderLabels = useMemo(
    () => getCascaderLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const emptyLabels = useMemo(() => getEmptyLabels(mergedLocale), [mergedLocale])

  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const isReadOnly = Boolean(readOnly) && !effectiveDisabled
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

  const formNamed = Boolean(formItemControl?.name)
  const incomingValue =
    value !== undefined
      ? value
      : formNamed
        ? coerceCascaderFormValue(formItemControl?.value)
        : undefined
  const [selected, setSelectedState] = useControlledState<CascaderModelValue>({
    value: incomingValue,
    defaultValue,
    onChange: (next) => {
      const normalized = normalizeCascaderValue(next)
      onChange?.(normalized)
      formItemControl?.onChange?.(normalized)
    },
    postState: normalizeCascaderValue
  })
  const setSelected = useCallback(
    (next: CascaderModelValue) => {
      const normalized = normalizeCascaderValue(next)
      if (cascaderValuesEqual(normalized, selected)) return
      setSelectedState(normalized)
    },
    [selected, setSelectedState]
  )

  const [isOpen, setOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  })

  const [searchQuery, setSearchQuery] = useControlledState({
    value: searchValue,
    defaultValue: defaultSearchValue,
    onChange: onSearch
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
  const loadTokensRef = useRef(new Map<string, number>())
  const loadedIdsRef = useRef(new Set<string>())
  const seededRef = useRef(false)
  const openWasRef = useRef(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const optionsPropRef = useRef(optionsProp)

  if (optionsPropRef.current !== optionsProp) {
    optionsPropRef.current = optionsProp
    setLoadedOptions(null)
    loadedIdsRef.current = new Set()
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
  const placeholderText = placeholder ?? selectLabels.placeholder
  const displayText = isCascaderValueEmpty(selected) ? placeholderText : displayLabel
  const emptyCopy = resolveEmptyCopy(
    emptyText,
    emptyLabels.noResults,
    loading,
    selectLabels.loadingText
  )
  const showClear = shouldShowCascaderClear({
    clearable,
    disabled: effectiveDisabled,
    readOnly: isReadOnly,
    value: selected
  })

  const closeDropdown = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const openDropdown = useCallback(() => {
    if (effectiveDisabled || isReadOnly) return
    setOpen(true)
  }, [effectiveDisabled, isReadOnly, setOpen])

  const toggleDropdown = useCallback(() => {
    if (effectiveDisabled || isReadOnly) return
    if (isOpen) closeDropdown()
    else openDropdown()
  }, [closeDropdown, effectiveDisabled, isOpen, isReadOnly, openDropdown])

  const focusCombobox = useCallback(() => {
    triggerRef.current?.focus()
  }, [])

  const commitPath = useCallback(
    (path: CascaderValue, close: boolean) => {
      if (isReadOnly || effectiveDisabled) return
      const normalized = normalizeCascaderValue(path)
      const label = getCascaderDisplayLabel(options, normalized, separator)
      if (normalized && normalized.length > 0) {
        rememberCascaderLabel(labelCacheRef.current, normalized, label)
      }
      setSelected(normalized ?? [])
      if (close) {
        closeDropdown()
        requestAnimationFrame(() => triggerRef.current?.focus())
      }
    },
    [closeDropdown, effectiveDisabled, isReadOnly, options, separator, setSelected]
  )

  const focusColumnAfterLoad = useCallback((path: CascaderValue, childCount: number) => {
    if (childCount <= 0) return
    setFocusedColumnIndex(path.length)
  }, [])

  const loadChildren = useCallback(
    async (
      option: CascaderOption,
      path: CascaderValue,
      intent: 'select' | 'expand'
    ) => {
      if (!loadData || option.disabled) return
      const key = cascaderPathId(path)
      const token = nextLoadToken(loadTokensRef.current, key)
      setLoadingKeys((current) => new Set(current).add(key))
      try {
        const children = await loadData(option)
        if (!isCurrentLoadToken(loadTokensRef.current, key, token)) return
        loadedIdsRef.current.add(key)
        setLoadedOptions((current) =>
          setCascaderOptionChildren(current ?? optionsProp, path, children)
        )
        const decision = decideAfterBranchLoad({
          childCount: children.length,
          intent,
          commitLoadedBranch: intent === 'select' && changeOnSelect
        })
        if (decision.expand) focusColumnAfterLoad(path, children.length)
        if (decision.commit) commitPath(path, children.length === 0)
      } catch {
        if (!isCurrentLoadToken(loadTokensRef.current, key, token)) return
      } finally {
        if (!isCurrentLoadToken(loadTokensRef.current, key, token)) return
        setLoadingKeys((current) => {
          const next = new Set(current)
          next.delete(key)
          return next
        })
      }
    },
    [changeOnSelect, commitPath, focusColumnAfterLoad, loadData, optionsProp]
  )

  const activateOption = useCallback(
    (option: CascaderOption, colIndex: number, commitLeaf: boolean) => {
      if (option.disabled || effectiveDisabled || isReadOnly) return
      const nextPath = [...activePath.slice(0, colIndex), option.value]
      const key = cascaderPathId(nextPath)
      const gate = gateCascaderLoad(
        option,
        hasLoadData,
        loadedIdsRef.current.has(key),
        loadingKeys.has(key)
      )
      if (gate === 'reject') return
      setActivePath(nextPath)
      const intent = commitLeaf ? 'select' : 'expand'
      if (gate === 'load') {
        void loadChildren(option, nextPath, intent)
        return
      }
      const decision = decideAfterBranchLoad({
        childCount: option.children?.length ?? 0,
        intent,
        commitLoadedBranch: changeOnSelect
      })
      if (decision.expand) setFocusedColumnIndex(colIndex + 1)
      if (decision.commit) commitPath(nextPath, !decision.expand)
    },
    [
      activePath,
      changeOnSelect,
      commitPath,
      effectiveDisabled,
      hasLoadData,
      isReadOnly,
      loadChildren,
      loadingKeys
    ]
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
      if (item.disabled || isReadOnly || effectiveDisabled) return
      const option = item.path[item.path.length - 1]
      if (!option) return
      const key = cascaderPathId(item.valuePath)
      const gate = gateCascaderLoad(
        option,
        hasLoadData,
        loadedIdsRef.current.has(key),
        loadingKeys.has(key)
      )
      if (gate === 'reject') return
      if (gate === 'load') {
        setActivePath(item.valuePath)
        void loadChildren(option, item.valuePath, 'select')
        return
      }
      commitPath(item.valuePath, true)
    },
    [commitPath, effectiveDisabled, hasLoadData, isReadOnly, loadChildren, loadingKeys]
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
    if (
      !shouldSeedCascaderFormDefault({
        alreadySeeded: seededRef.current,
        fieldName: formItemControl?.name,
        controlledValue: value,
        formValue: formItemControl?.value,
        defaultValue
      })
    ) {
      return
    }
    seededRef.current = true
    formItemControl?.onChange?.(normalizeCascaderValue(defaultValue) ?? [])
  }, [defaultValue, formItemControl, value])

  useEffect(() => {
    const previousOpen = openWasRef.current
    openWasRef.current = isOpen
    const nextPath = nextCascaderBrowsePath({
      open: isOpen,
      previousOpen,
      activePath,
      committed: selected
    })
    if (!(isOpen && !previousOpen)) return
    setActivePath(nextPath)
    const nextColumns = getCascaderColumns(options, nextPath, hasLoadData)
    setColumnActiveIndices(initialCascaderColumnActiveIndices(nextColumns))
    setFocusedColumnIndex(Math.max(0, nextColumns.length - 1))
    setSearchActiveIndex(0)
    if (searchable) searchInputRef.current?.focus()
    // Initialize only on the closed → open edge. Options and search identity must not reset the browse path.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

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
    if (isReadOnly) return
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
  const itemHeight = getCascaderVirtualItemHeight(size)
  const activeInWindow = (scrollTop: number, index: number, count: number) => {
    if (!virtual || index < 0) return index >= 0
    const range = getCascaderVirtualRange(scrollTop, listHeight, count, itemHeight)
    return index >= range.startIndex && index <= range.endIndex
  }
  const activeOptionId = !isOpen
    ? undefined
    : isSearchMode
      ? searchActiveIndex >= 0 &&
        activeInWindow(searchScrollTop, searchActiveIndex, searchResults.length)
        ? getPickerOptionId(listboxId, searchActiveIndex)
        : undefined
      : currentOpt >= 0 &&
          activeInWindow(
            columnScrollTops[colIndex] ?? 0,
            currentOpt,
            columns[colIndex]?.options.length ?? 0
          )
        ? getCascaderColumnOptionId(listboxId, colIndex, currentOpt)
        : undefined

  const comboboxAria = getPickerComboboxAria({
    expanded: isOpen,
    listboxId,
    activeOptionId
  })
  const listboxAria = getPickerListboxAria({
    id: listboxId,
    label: isSearchMode
      ? undefined
      : formatSelectLevelLabel(cascaderLabels.levelLabel, colIndex + 1)
  })

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

  const hiddenValue = shouldSubmitNativeField({
    name: effectiveName,
    disabled: effectiveDisabled
  })
    ? serializeCascaderFormValue(selected)
    : undefined

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
    clearAriaLabel: selectLabels.clearAriaLabel,
    searchPlaceholder: selectLabels.searchPlaceholder,
    doneText: selectLabels.doneText,
    backText: cascaderLabels.backText,
    levelLabel: cascaderLabels.levelLabel,
    loadingText: selectLabels.loadingText,
    readOnly: isReadOnly,
    formatLevel: (level: number) => formatSelectLevelLabel(cascaderLabels.levelLabel, level),
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
    setColumnScrollTop: (index: number, top: number) => {
      setColumnScrollTops((prev) => {
        if ((prev[index] ?? 0) === top) return prev
        const next = prev.slice()
        next[index] = top
        return next
      })
    },
    searchScrollTop,
    setSearchScrollTop,
    getVirtualRange: getCascaderVirtualRange,
    isExpandable: (option: CascaderOption) => isCascaderOptionExpandable(option, hasLoadData),
    isSelectedPath: (path: CascaderValue) => cascaderValuesEqual(selected, path),
    isSelectedValue: (col: number, option: CascaderOption) =>
      sameTreeKey(columns[col]?.selectedValue, option.value) ||
      sameTreeKey((selected ?? [])[col], option.value),
    isOptionLoading: (col: number, option: CascaderOption) =>
      loadingKeys.has(cascaderPathId([...(activePath.slice(0, col) ?? []), option.value])),
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
