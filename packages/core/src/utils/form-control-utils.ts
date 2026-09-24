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

export function callUnknownEventHandler(handler: unknown, event: Event): void {
  if (typeof handler === 'function') {
    handler(event)
    return
  }
  if (Array.isArray(handler)) {
    for (const item of handler) callUnknownEventHandler(item, event)
  }
}

/** Static flag on RadioGroup / CheckboxGroup so FormItem can skip htmlFor. */
export const TIGER_FORM_ITEM_LABEL_MODE = 'tigerFormItemLabelMode'

export function markFormItemGroupControl<T>(component: T): T {
  ;(component as T & { [TIGER_FORM_ITEM_LABEL_MODE]: 'group' })[TIGER_FORM_ITEM_LABEL_MODE] =
    'group'
  return component
}

export function isFormItemGroupControl(type: unknown): boolean {
  if (type == null || (typeof type !== 'object' && typeof type !== 'function')) return false
  return (type as Record<string, unknown>)[TIGER_FORM_ITEM_LABEL_MODE] === 'group'
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

const FOCUSABLE_INVALID_SELECTOR = [
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(',')

function canProgramFocus(element: HTMLElement): boolean {
  if (element.hasAttribute('disabled')) return false
  if (element.getAttribute('aria-disabled') === 'true') return false
  if (element.getAttribute('aria-hidden') === 'true') return false
  if (element.matches('input[type="hidden"]')) return false
  if (element.getAttribute('tabindex') === '-1') return false
  return typeof element.focus === 'function'
}

function firstFocusableInvalid(node: HTMLElement): HTMLElement | null {
  if (canProgramFocus(node) && node.matches(FOCUSABLE_INVALID_SELECTOR)) return node
  const nested = node.querySelectorAll<HTMLElement>(FOCUSABLE_INVALID_SELECTOR)
  for (const element of nested) {
    if (canProgramFocus(element)) return element
  }
  return null
}

/** Focus the first invalid control that can take focus. Group wrappers are skipped. */
export function focusFirstInvalidField(root: ParentNode | null | undefined): void {
  if (!root || typeof (root as Element).querySelectorAll !== 'function') {
    return
  }
  const invalids = (root as Element).querySelectorAll<HTMLElement>('[aria-invalid="true"]')
  for (const node of invalids) {
    const target = firstFocusableInvalid(node)
    if (!target) continue
    target.focus()
    target.scrollIntoView({ block: 'nearest' })
    return
  }
}

/**
 * Blur the control inside `root` that still holds the caret so a pending
 * edit (number text, tag) commits before validation reads the model.
 */
export function commitFocusedFormControl(root: ParentNode | null | undefined): void {
  if (!root || typeof (root as Element).contains !== 'function') return
  const owner = (root as Node).ownerDocument
  const active = owner?.activeElement
  if (!(active instanceof HTMLElement)) return
  if (!(root as Node).contains(active)) return
  active.blur()
}

/** Disabled fields stay out of the native submit set. Read-only fields stay in. */
export function shouldSubmitNativeField(options: {
  name?: string
  disabled?: boolean
}): boolean {
  return Boolean(options.name) && !options.disabled
}
