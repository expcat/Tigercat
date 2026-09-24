export interface AssigneePickerOption {
  id: string
  name: string
  department?: string
}

export interface AssigneePickerProps {
  /** Directory supplied by the caller. Empty shows an explanation. */
  options?: AssigneePickerOption[]
  /** Selected ids. */
  selectedIds?: string[]
  /** Locale id for empty and search copy. */
  locale?: string
}
