/**
 * Value stored on the record itself.
 * Inherited names such as toString, constructor, and __proto__ are not values.
 */
export function ownRecordValue<Value>(record: object, key: unknown): Value | undefined {
  if (typeof key !== 'string' || !Object.hasOwn(record, key)) return undefined
  const descriptor = Object.getOwnPropertyDescriptor(record, key)
  if (!descriptor || !Object.hasOwn(descriptor, 'value')) return undefined
  return descriptor.value as Value
}
