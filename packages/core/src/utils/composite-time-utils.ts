/**
 * Time format helpers for composite components
 */

export const formatChatTime = (value?: string | number | Date): string => {
  if (!value) return ''
  if (value instanceof Date) return value.toLocaleTimeString()
  if (typeof value === 'number') return new Date(value).toLocaleTimeString()
  return value
}

export const formatCommentTime = (value?: string | number | Date): string => {
  if (value == null || value === '') return ''
  if (value instanceof Date) return value.toLocaleString()
  if (typeof value === 'number') return new Date(value).toLocaleString()
  return value
}
