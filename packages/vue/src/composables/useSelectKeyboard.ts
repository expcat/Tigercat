import { Ref, nextTick } from 'vue'

export interface UseSelectKeyboardOptions {
  /** Whether dropdown is open */
  isOpen: Ref<boolean>
  /** Whether select is disabled */
  disabled: Ref<boolean>
  /** Whether searchable mode */
  searchable: Ref<boolean>
  /** Active option index */
  activeIndex: Ref<number>
  /** Trigger element ref */
  triggerRef: Ref<HTMLElement | null>
  /** Find first enabled index */
  findFirstEnabledIndex: () => number
  /** Find last enabled index */
  findLastEnabledIndex: () => number
  /** Find next enabled index */
  findNextEnabledIndex: (current: number, direction: 1 | -1) => number
  /** Set active and focus */
  setActiveAndFocus: (index: number) => void
  /** Select active option */
  selectActiveOption: () => void
  /** Close dropdown */
  closeDropdown: () => void
}

export interface UseSelectKeyboardReturn {
  /** Handle trigger keydown */
  handleTriggerKeyDown: (event: KeyboardEvent) => void
  /** Handle dropdown keydown */
  handleDropdownKeyDown: (event: KeyboardEvent) => void
  /** Handle search input keydown */
  handleSearchKeyDown: (event: KeyboardEvent) => void
}

export function useSelectKeyboard(options: UseSelectKeyboardOptions): UseSelectKeyboardReturn {
  const {
    isOpen,
    disabled,
    searchable,
    activeIndex,
    triggerRef,
    findFirstEnabledIndex,
    findLastEnabledIndex,
    findNextEnabledIndex,
    setActiveAndFocus,
    selectActiveOption,
    closeDropdown
  } = options

  const handleTriggerKeyDown = (event: KeyboardEvent) => {
    if (disabled.value) return

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        if (!isOpen.value) {
          isOpen.value = true
          return
        }
        const next = findNextEnabledIndex(activeIndex.value, 1)
        setActiveAndFocus(next)
        return
      }
      case 'ArrowUp': {
        event.preventDefault()
        if (!isOpen.value) {
          isOpen.value = true
          return
        }
        const next = findNextEnabledIndex(activeIndex.value, -1)
        setActiveAndFocus(next)
        return
      }
      case 'Enter':
      case ' ': {
        event.preventDefault()
        if (!isOpen.value) {
          isOpen.value = true
          return
        }
        selectActiveOption()
        return
      }
      case 'Escape': {
        if (isOpen.value) {
          event.preventDefault()
          closeDropdown()
        }
        return
      }
    }
  }

  const handleDropdownKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        const next = findNextEnabledIndex(activeIndex.value, 1)
        setActiveAndFocus(next)
        return
      }
      case 'ArrowUp': {
        event.preventDefault()
        const next = findNextEnabledIndex(activeIndex.value, -1)
        setActiveAndFocus(next)
        return
      }
      case 'Home': {
        event.preventDefault()
        const next = findFirstEnabledIndex()
        setActiveAndFocus(next)
        return
      }
      case 'End': {
        event.preventDefault()
        const next = findLastEnabledIndex()
        setActiveAndFocus(next)
        return
      }
      case 'Enter':
      case ' ': {
        event.preventDefault()
        selectActiveOption()
        return
      }
      case 'Escape': {
        event.preventDefault()
        closeDropdown()
        nextTick(() => {
          ;(triggerRef.value as HTMLButtonElement | null)?.focus()
        })
        return
      }
      case 'Tab': {
        closeDropdown()
        return
      }
    }
  }

  const handleSearchKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case ' ': {
        // Allow space in search input
        event.stopPropagation()
        return
      }
      case 'ArrowDown': {
        event.preventDefault()
        event.stopPropagation()
        const next = activeIndex.value >= 0 ? activeIndex.value : findFirstEnabledIndex()
        setActiveAndFocus(next)
        return
      }
      case 'ArrowUp': {
        event.preventDefault()
        event.stopPropagation()
        const next = activeIndex.value >= 0 ? activeIndex.value : findLastEnabledIndex()
        setActiveAndFocus(next)
        return
      }
      case 'Enter': {
        if (activeIndex.value >= 0) {
          event.preventDefault()
          event.stopPropagation()
          selectActiveOption()
        }
        return
      }
      case 'Escape': {
        event.preventDefault()
        event.stopPropagation()
        closeDropdown()
        nextTick(() => {
          ;(triggerRef.value as HTMLButtonElement | null)?.focus()
        })
        return
      }
    }
  }

  return {
    handleTriggerKeyDown,
    handleDropdownKeyDown,
    handleSearchKeyDown
  }
}
