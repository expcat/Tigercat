import type React from 'react'
import type {
  SelectOption,
  SelectOptions,
  SelectValue,
  SelectValues,
  ComponentSize,
  SelectProps as CoreSelectProps
} from '@expcat/tigercat-core'

type SelectDivProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'value' | 'onChange'
>

export interface SelectBaseProps
  extends Omit<CoreSelectProps, 'multiple' | 'options'>, SelectDivProps {
  options?: SelectOptions

  onSearchChange?: (query: string) => void

  onCreate?: (option: SelectOption) => void

  className?: string
}

export interface SelectSingleProps extends SelectBaseProps {
  multiple?: false
  value?: SelectValue
  onChange?: (value: SelectValue | undefined) => void
}

export interface SelectMultipleProps extends SelectBaseProps {
  multiple: true
  value?: SelectValues
  onChange?: (value: SelectValues) => void
}

export type SelectProps = SelectSingleProps | SelectMultipleProps

export const isMultipleSelect = (props: SelectProps): props is SelectMultipleProps =>
  props.multiple === true

/**
 * Internal context produced by {@link useSelectState} and consumed by the
 * `Select.tsx` wrapper plus the `render-option` helpers. Mirrors the
 * `Table/` paradigm (state hook returns an immutable context object).
 */
export interface SelectContext {
  // identity / aria
  listboxId: string
  getOptionId: (index: number) => string

  // ui state
  isOpen: boolean
  searchQuery: string
  activeIndex: number
  setActiveIndex: (index: number) => void

  // refs
  dropdownRef: React.RefObject<HTMLDivElement | null>
  triggerRef: React.RefObject<HTMLButtonElement | null>
  searchInputRef: React.RefObject<HTMLInputElement | null>

  // resolved view props
  isMultiple: boolean
  size: ComponentSize
  virtual: boolean
  listHeight: number
  disabled: boolean
  placeholder: string
  searchable: boolean
  clearable: boolean
  emptyText: string
  createOptionText: string
  className?: string
  divProps: Record<string, unknown>
  searchPlaceholder: string
  clearAriaLabel: string
  doneText: string

  // derived data
  filteredOptions: SelectOptions
  flatSelectableOptions: SelectOption[]
  creatableOption: SelectOption | null
  hasOptions: boolean
  optionsLength: number
  displayText: string
  showClearButton: boolean
  containerClasses: string
  triggerClasses: string

  // handlers
  isSelected: (option: SelectOption) => boolean
  selectOption: (option: SelectOption) => void
  clearSelection: (event: React.MouseEvent) => void
  closeDropdown: () => void
  toggleDropdown: () => void
  handleSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleTriggerKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void
  handleDropdownKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void
  handleSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
}
