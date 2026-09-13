/**
 * Coerce FormItem context values for widgets that must not treat `''`
 * (the named-field missing-key sentinel) as a string.
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
): number | [number, number] | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined
  if (range) {
    if (
      Array.isArray(raw) &&
      raw.length === 2 &&
      typeof raw[0] === 'number' &&
      typeof raw[1] === 'number' &&
      Number.isFinite(raw[0]) &&
      Number.isFinite(raw[1])
    ) {
      return [raw[0], raw[1]]
    }
    return undefined
  }
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : undefined
}
