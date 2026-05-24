import { bench, describe } from 'vitest'
import { calculateVirtualRange, getFixedVirtualRange } from '@expcat/tigercat-core'

function makeFrameScrollTops(frameCount: number, step: number): number[] {
  return Array.from({ length: frameCount }, (_, index) => index * step)
}

describe('Virtual scroll frame simulation', () => {
  const frameScrollTops = makeFrameScrollTops(60, 72)

  bench('VirtualTable range calculation across 60 frames', () => {
    for (const scrollTop of frameScrollTops) {
      calculateVirtualRange(scrollTop, 600, 100_000, 48, 5)
    }
  })

  bench('VirtualList fixed range calculation across 60 frames', () => {
    for (const scrollTop of frameScrollTops) {
      getFixedVirtualRange(scrollTop, 600, 48, 100_000, 5)
    }
  })
})
