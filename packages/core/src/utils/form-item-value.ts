import { readFiniteFormNumber } from './form-validation'

/**
 * Coerce FormItem context values for widgets that must not treat `''`
 * (the named-field missing-key sentinel) as a string.
 *
 * A named field passes `''` for a missing key. That is empty, and so are
 * `null` and `undefined`. Widgets that are form-bound must paint that empty
 * value instead of keeping a private previous value.
 */

export function resolveFormItemSeed<T>(
  publicValue: T | undefined,
  formName: string | undefined,
  formValue: unknown,
  coerce: (raw: unknown) => T | undefined
): T | undefined {
  if (publicValue !== undefined) return publicValue
  if (!formName) return undefined
  return coerce(formValue)
}

export function coerceBooleanFormValue(raw: unknown): boolean | undefined {
  if (raw === undefined) return undefined
  if (typeof raw === 'boolean') return raw
  if (raw === '' || raw === null) return false
  return Boolean(raw)
}

export function coerceArrayFormValue<T = unknown>(raw: unknown): T[] | undefined {
  if (raw === undefined) return undefined
  if (Array.isArray(raw)) return raw as T[]
  if (raw === '' || raw === null) return []
  return undefined
}

export function coerceChoiceFormValue(raw: unknown): string | number | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined
  if (typeof raw === 'string' || typeof raw === 'number') return raw
  return undefined
}

export function coerceSliderFormValue(
  raw: unknown,
  range: boolean
): number | [number, number] | null {
  if (range) {
    if (Array.isArray(raw) && raw.length === 2) {
      const start = readFiniteFormNumber(raw[0])
      const end = readFiniteFormNumber(raw[1])
      if (start !== null && end !== null) return [start, end]
    }
    return null
  }
  if (raw === undefined) return null
  return readFiniteFormNumber(raw)
}

/**
 * Finite number or numeric string. Missing, `''`, and `null` are empty (`null`).
 * `undefined` means the widget is not form-bound and may stay uncontrolled.
 */
export function coerceNumberFormValue(raw: unknown): number | null | undefined {
  if (raw === undefined) return undefined
  if (raw === null || raw === '') return null
  return readFiniteFormNumber(raw)
}

/** Text fields must not render `null` as the string `"null"`. */
export function coerceTextFormValue(raw: unknown): string {
  if (raw === undefined || raw === null) return ''
  if (typeof raw === 'string') return raw
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw)
  return ''
}

/** Tag lists. Missing, `''`, and `null` are an empty list, not the last list. */
export function coerceTagsFormValue(raw: unknown): string[] | null {
  if (Array.isArray(raw)) return raw.map((item) => String(item))
  if (raw === undefined || raw === null || raw === '') return null
  return null
}
