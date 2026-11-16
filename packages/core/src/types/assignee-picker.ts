import type { TigerLocale } from './locale'

export interface AssigneePickerOption {
  id: string
  name: string
  department?: string
}

export interface AssigneePickerProps {
  /** Directory supplied by the caller. Empty shows an explanation. */
  options?: AssigneePickerOption[]
  /** Selected ids. Vue writes them with v-model:selected-ids; React uses onChange. */
  selectedIds?: string[]
  /** Locale object for empty and search copy. */
  locale?: Partial<TigerLocale>
}
