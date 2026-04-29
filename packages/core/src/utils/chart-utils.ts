/**
 * Chart utilities — backward-compatible barrel.
 *
 * The original 28 KB monolith was split into `chart/{color,scale,axis,path,format}.ts`
 * (PR-12, 2026-04). This file preserves the original public surface so existing
 * imports continue to work; new code should prefer the granular sub-paths
 * (e.g. `import { createLinePath } from '@expcat/tigercat-core/.../utils/chart/path'`)
 * once `chart/` is exposed via package exports.
 */

export * from './chart'
