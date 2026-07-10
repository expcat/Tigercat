import { bench, describe } from 'vitest'
import {
  calculateVirtualRange,
  dynamicSizeStrategy,
  getFixedVirtualRange
} from '@expcat/tigercat-core'

function makeFrameScrollTops(frameCount: number, step: number): number[] {
  return Array.from({ length: frameCount }, (_, index) => index * step)
}

describe('Virtual scroll frame simulation', () => {
  const frameScrollTops = makeFrameScrollTops(60, 72)
  const dynamicStrategy = dynamicSizeStrategy(48, 100_000)
  for (let index = 0; index < 1_000; index += 10) {
    dynamicStrategy.updateItemHeight?.(index, 40 + (index % 5))
  }
  const dynamicFrameScrollTops = makeFrameScrollTops(60, 72).map(
    (offset) => 100_000 * 48 - 120_000 + offset
  )
  let dynamicMeasureVersion = 0

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

  bench('VirtualList dynamic range with measurement updates across 60 tail frames', () => {
    const measuredIndex = 99_900 + (dynamicMeasureVersion % 50)
    dynamicStrategy.updateItemHeight?.(measuredIndex, 40 + (dynamicMeasureVersion % 7))
    dynamicMeasureVersion++
    for (const scrollTop of dynamicFrameScrollTops) {
      dynamicStrategy.getRange(scrollTop, 600, 100_000, 5)
    }
  })
})
