export type SpotlightItemKey = string | number

export interface SpotlightItem {
  key: SpotlightItemKey
  label: string
  description?: string
  group?: string
  keywords?: string[]
  disabled?: boolean
  icon?: unknown
  shortcut?: string | string[]
  data?: unknown
}

export type SpotlightItemFilter = (query: string, item: SpotlightItem) => boolean

export interface SpotlightProps {
  open?: boolean
  defaultOpen?: boolean
  query?: string
  defaultQuery?: string
  items?: SpotlightItem[]
  title?: string
  placeholder?: string
  emptyText?: string
  inputAriaLabel?: string
  listboxLabel?: string
  closeOnSelect?: boolean
  mask?: boolean
  maskClosable?: boolean
  zIndex?: number
  className?: string
  defaultActiveFirstItem?: boolean
  filterItem?: SpotlightItemFilter
  limit?: number
}
