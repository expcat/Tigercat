import { classNames } from './class-names'
import type { MentionsSize } from '../types/mentions'

const sizeMap: Record<MentionsSize, string> = {
  sm: 'text-sm py-1 px-2',
  md: 'text-sm py-2 px-3',
  lg: 'text-base py-2.5 px-4'
}

export function getMentionsInputClasses(size: MentionsSize, disabled: boolean): string {
  return classNames(
    'w-full rounded-lg border transition-colors resize-none',
    'bg-[var(--tiger-mentions-bg,var(--tiger-surface,#ffffff))]',
    'border-[var(--tiger-mentions-border,var(--tiger-border,#d1d5db))]',
    'text-[var(--tiger-mentions-text,var(--tiger-text,#111827))]',
    'placeholder:text-[var(--tiger-mentions-placeholder,var(--tiger-text-muted,#9ca3af))]',
    sizeMap[size],
    disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-mentions-ring,var(--tiger-ring,#2563eb))]'
  )
}

export const mentionsDropdownClasses = classNames(
  'absolute z-50 mt-1 w-48 max-h-48 overflow-auto rounded-lg border shadow-lg',
  'bg-[var(--tiger-mentions-dropdown-bg,var(--tiger-surface,#ffffff))]',
  'border-[var(--tiger-mentions-dropdown-border,var(--tiger-border,#d1d5db))]'
)

export function getMentionsOptionClasses(isActive: boolean, isDisabled: boolean): string {
  return classNames(
    'px-3 py-2 text-sm cursor-pointer transition-colors',
    isDisabled
      ? 'opacity-40 cursor-not-allowed'
      : isActive
        ? 'bg-[var(--tiger-mentions-option-active,var(--tiger-primary,#2563eb))]/10 text-[var(--tiger-mentions-option-active-text,var(--tiger-primary,#2563eb))]'
        : 'text-[var(--tiger-mentions-option-text,var(--tiger-text,#111827))] hover:bg-[var(--tiger-mentions-option-hover,var(--tiger-fill-hover,#f3f4f6))]'
  )
}

/**
 * Extract the current mention query from the textarea value and cursor position
 */
export function extractMentionQuery(
  text: string,
  cursorPos: number,
  prefix: string
): { query: string; startPos: number } | null {
  // Look backward from cursor for the prefix character
  const before = text.slice(0, cursorPos)
  const lastPrefixIdx = before.lastIndexOf(prefix)
  if (lastPrefixIdx === -1) return null

  // Prefix must be at start or after a whitespace
  if (lastPrefixIdx > 0 && !/\s/.test(before[lastPrefixIdx - 1])) return null

  const query = before.slice(lastPrefixIdx + prefix.length)
  // No spaces allowed in query
  if (/\s/.test(query)) return null

  return { query, startPos: lastPrefixIdx }
}
