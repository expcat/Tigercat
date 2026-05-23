/**
 * Time format helpers for composite components
 */

export const formatChatTime = (
  value?: string | number | Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!value) return ''
  if (value instanceof Date) return value.toLocaleTimeString(locale, options)
  if (typeof value === 'number') return new Date(value).toLocaleTimeString(locale, options)
  return value
}

export const formatCommentTime = (
  value?: string | number | Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (value == null || value === '') return ''
  if (value instanceof Date) return value.toLocaleString(locale, options)
  if (typeof value === 'number') return new Date(value).toLocaleString(locale, options)
  return value
}
