/** Escape a string so it can be used literally inside a RegExp. */
export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
