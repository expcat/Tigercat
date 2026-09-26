import { DEMO_NAV_GROUPS } from './app-config'

/** Group that contains the active example route. Home has none. */
export function navGroupKeyForPath(pathname: string): string | null {
  for (const group of DEMO_NAV_GROUPS) {
    if (
      group.items.some((item) => (item.path === '/' ? pathname === '/' : pathname === item.path))
    ) {
      return group.key
    }
  }
  return null
}

/**
 * Search shows every matching group. Otherwise only the one accordion group
 * is open, and only if that group is still in the filtered list.
 */
export function navOpenKeys(options: {
  query: string
  visibleGroupKeys: readonly string[]
  openGroupKey: string | null
}): string[] {
  if (options.query.trim()) return [...options.visibleGroupKeys]
  if (options.openGroupKey && options.visibleGroupKeys.includes(options.openGroupKey)) {
    return [options.openGroupKey]
  }
  return []
}

/** Collapse `onChange` in accordion mode: the remaining key, or none. */
export function navGroupFromCollapseChange(
  next: string | number | readonly (string | number)[] | undefined
): string | null {
  if (next == null) return null
  const keys = Array.isArray(next) ? next : [next]
  if (keys.length === 0) return null
  return String(keys[keys.length - 1])
}
