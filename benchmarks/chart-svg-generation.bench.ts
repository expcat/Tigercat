import { bench, describe } from 'vitest'
import {
  createAreaPath,
  createLinePath,
  createPieArcPath,
  createPolygonPath,
  getPieArcs,
  getRadarPoints
} from '@expcat/tigercat-core'

function makePoints(count: number): Array<{ x: number; y: number }> {
  return Array.from({ length: count }, (_, index) => ({
    x: index * 8,
    y: 100 + Math.sin(index / 8) * 40 + Math.cos(index / 13) * 18
  }))
}

describe('Chart SVG path generation', () => {
  const pointSets = {
    100: makePoints(100),
    500: makePoints(500),
    1000: makePoints(1000)
  }
  const pieData = Array.from({ length: 120 }, (_, index) => ({
    name: `Slice ${index}`,
    value: (index % 9) + 1
  }))
  const radarData = Array.from({ length: 80 }, (_, index) => ({
    label: `Axis ${index}`,
    value: (index % 12) + 1
  }))

  for (const [label, points] of Object.entries(pointSets)) {
    bench(`line path with ${label} points`, () => {
      createLinePath(points, 'linear')
    })

    bench(`monotone area path with ${label} points`, () => {
      createAreaPath(points, 180, 'monotone')
    })
  }

  bench('pie arcs and donut paths for 120 slices', () => {
    const arcs = getPieArcs(pieData, { padAngle: 0.005 })
    for (const arc of arcs) {
      createPieArcPath({
        cx: 160,
        cy: 160,
        innerRadius: 72,
        outerRadius: 140,
        startAngle: arc.startAngle,
        endAngle: arc.endAngle
      })
    }
  })

  bench('radar polygon generation for 80 axes', () => {
    const radarPoints = getRadarPoints(radarData, { cx: 160, cy: 160, radius: 120 })
    createPolygonPath(radarPoints)
  })
})
