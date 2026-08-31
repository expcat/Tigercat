import type React from 'react'
import type {
  SelectOption,
  SelectOptions,
  SelectValue,
  SelectValues,
  SelectOptionSlotContext,
  SelectProps as CoreSelectProps
} from '@expcat/tigercat-core'

type SelectDomProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'value' | 'onChange' | 'onBlur'
>

export interface SelectBaseProps
  extends Omit<CoreSelectProps, 'multiple' | 'options' | 'value' | 'defaultValue'>, SelectDomProps {
  options?: SelectOptions
  onSearchChange?: (query: string) => void
  onSearchValueChange?: (query: string) => void
  onCreate?: (option: SelectOption) => void
  onOpenChange?: (open: boolean) => void
  onBlur?: React.FocusEventHandler<HTMLElement>
  renderOption?: (ctx: SelectOptionSlotContext) => React.ReactNode
  className?: string
}

export interface SelectSingleProps extends SelectBaseProps {
  multiple?: false
  value?: SelectValue
  defaultValue?: SelectValue
  onChange?: (value: SelectValue | undefined) => void
}

export interface SelectMultipleProps extends SelectBaseProps {
  multiple: true
  value?: SelectValues
  defaultValue?: SelectValues
  onChange?: (value: SelectValues) => void
}

export type SelectProps = SelectSingleProps | SelectMultipleProps

export const isMultipleSelect = (props: SelectProps): props is SelectMultipleProps =>
  props.multiple === true

export interface SelectRenderContext {
  listboxId: string
  listboxAria: {
    id: string | undefined
    role: 'listbox'
    'aria-label': string | undefined
  }
  multiple: boolean
  loading: boolean
  getOptionId: (index: number) => string
  activeIndex: number
  setActiveIndex: (index: number) => void
  size: CoreSelectProps['size']
  virtual: boolean
  listHeight: number
  emptyText: string
  loadingText: string
  createOptionLabel: string
  selectOption: (option: SelectOption) => void
  isSelected: (option: SelectOption) => boolean
  filteredOptions: SelectOptions
  creatableOption: SelectOption | null
  renderOption?: (ctx: SelectOptionSlotContext) => React.ReactNode
}
