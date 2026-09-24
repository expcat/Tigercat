/**
 * Non-color status channels. Color still comes from the accent scale.
 * Chart series pick a line, a pattern, and an icon by palette index.
 */

export const CHART_PALETTE_COUNT = 6

export interface StatusChannel {
  line: 'solid' | 'dashed' | 'dotted'
  pattern: string
  icon: string
}

export const STATUS_CHANNELS: readonly StatusChannel[] = [
  { line: 'solid', pattern: 'fill', icon: 'status-circle' },
  { line: 'dashed', pattern: 'stripe', icon: 'status-square' },
  { line: 'dotted', pattern: 'dot', icon: 'status-triangle' },
  { line: 'solid', pattern: 'cross', icon: 'status-diamond' },
  { line: 'dashed', pattern: 'wave', icon: 'status-plus' },
  { line: 'dotted', pattern: 'grid', icon: 'status-minus' }
]

export function chartStatusChannel(index: number): StatusChannel {
  const count = STATUS_CHANNELS.length
  const safe = ((Math.trunc(index) % count) + count) % count
  return STATUS_CHANNELS[safe]!
}
