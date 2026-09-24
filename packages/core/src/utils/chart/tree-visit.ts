/**
 * One seen/visiting set for chart trees. Cycles and duplicate keys are skipped.
 */

import { devWarn } from '../dev-warn'

export interface ChartTreeVisit {
  enter(key: string, cycle: [string, string], duplicate: [string, string]): boolean
  leave(key: string): void
}

export function createChartTreeVisit(): ChartTreeVisit {
  const seen = new Set<string>()
  const visiting = new Set<string>()

  return {
    enter(key, cycle, duplicate) {
      if (visiting.has(key)) {
        devWarn(cycle[0], cycle[1])
        return false
      }
      if (seen.has(key)) {
        devWarn(duplicate[0], duplicate[1])
        return false
      }
      seen.add(key)
      visiting.add(key)
      return true
    },
    leave(key) {
      visiting.delete(key)
    }
  }
}

const identityKeys = new WeakMap<object, string>()
let identitySeq = 0

/** Stable key for a node. Explicit ids win; otherwise the object identity is reused. */
export function chartTreeNodeKey(node: object, id?: string | number | null): string {
  if (id !== undefined && id !== null && String(id) !== '') return `id:${String(id)}`
  const existing = identityKeys.get(node)
  if (existing) return existing
  identitySeq += 1
  const key = `ref:${identitySeq}`
  identityKeys.set(node, key)
  return key
}
