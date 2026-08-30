/**
 * FormItem value extraction and a11y helpers shared by Vue / React.
 */

export type ExtractedFormChange = { found: true; value: unknown } | { found: false }

function isEventTarget(value: unknown): value is {
  type?: unknown
  checked?: unknown
  value?: unknown
} {
  return value !== null && typeof value === 'object'
}

function isNonFieldValueObject(value: unknown): boolean {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }
  const record = value as Record<string, unknown>
  return 'empty' in record || 'fileList' in record || 'originFileObj' in record
}

/**
 * Turn a change argument into a form field value.
 *
 * - Native checkbox → `target.checked`
 * - Native radio → `target.value` (not `checked`)
 * - Other events → `target.value`
 * - Primitives / arrays pass through (`0` / `''` write; `undefined` does not)
 * - Objects with `empty` / `fileList` / `originFileObj` are not field values
 */
export function extractFormChangeValue(argument: unknown): ExtractedFormChange {
  if (argument === undefined) {
    return { found: false }
  }

  if (argument !== null && typeof argument === 'object' && 'target' in argument) {
    const target = (argument as { target: unknown }).target
    if (isEventTarget(target)) {
      const type = typeof target.type === 'string' ? target.type.toLowerCase() : ''
      if (type === 'checkbox') {
        return { found: true, value: target.checked }
      }
      if (type === 'radio') {
        return { found: true, value: target.value }
      }
      return { found: true, value: target.value }
    }
  }

  if (isNonFieldValueObject(argument)) {
    return { found: false }
  }

  return { found: true, value: argument }
}

export function mergeAriaDescribedBy(
  existing: string | undefined,
  next: string | undefined
): string | undefined {
  if (!existing) return next
  if (!next) return existing
  const parts = new Set(
    `${existing} ${next}`
      .split(' ')
      .map((s) => s.trim())
      .filter(Boolean)
  )
  return Array.from(parts).join(' ')
}

export function focusFirstInvalidField(root: ParentNode | null | undefined): void {
  if (!root || typeof (root as Element).querySelector !== 'function') {
    return
  }
  const invalid = (root as Element).querySelector<HTMLElement>('[aria-invalid="true"]')
  invalid?.focus()
  invalid?.scrollIntoView({ block: 'nearest' })
}
