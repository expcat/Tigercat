import {
  createTypeaheadBuffer,
  findTypeaheadMatchIndex,
  isTypeaheadCharacter,
  type TypeaheadBuffer
} from './focus-utils'

export const TYPEAHEAD_MATCH_ATTR = 'data-tiger-typeahead-match'

export interface TypeaheadHighlight {
  query: string
  index: number
}

export function createTypeaheadHighlight(timeoutMs?: number): {
  buffer: TypeaheadBuffer
  push(character: string, labels: readonly string[], fromIndex: number, disabled?: readonly boolean[], now?: number): TypeaheadHighlight | null
  reset(): void
} {
  const buffer = createTypeaheadBuffer(timeoutMs)
  return {
    buffer,
    push(character, labels, fromIndex, disabled, now) {
      if (!isTypeaheadCharacter(character)) return null
      const query = buffer.push(character, now)
      const index = findTypeaheadMatchIndex(labels, query, fromIndex, disabled)
      if (index < 0) return { query, index: -1 }
      return { query, index }
    },
    reset() {
      buffer.reset()
    }
  }
}

/** True when the label is the current typeahead match. Does not open a search field. */
export function isTypeaheadHighlight(label: string, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase()
  if (!needle) return false
  return label.trim().toLocaleLowerCase().startsWith(needle)
}

export function typeaheadShortcutColumn(shortcut: string | undefined): string | null {
  if (!shortcut) return null
  const text = shortcut.trim()
  return text ? text : null
}

export function markTypeaheadMatch(elements: readonly HTMLElement[], index: number): void {
  elements.forEach((element, itemIndex) => {
    if (itemIndex === index) element.setAttribute(TYPEAHEAD_MATCH_ATTR, 'true')
    else element.removeAttribute(TYPEAHEAD_MATCH_ATTR)
  })
}
