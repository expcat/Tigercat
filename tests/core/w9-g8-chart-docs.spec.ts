import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

function interfaceBody(source: string, name: string): string {
  const start = source.indexOf(`export interface ${name}`)
  expect(start).toBeGreaterThan(-1)
  const open = source.indexOf('{', start)
  let depth = 0
  for (let index = open; index < source.length; index += 1) {
    const char = source[index]
    if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return source.slice(open + 1, index)
    }
  }
  throw new Error(`unclosed ${name}`)
}

function propDoc(body: string, prop: string): string {
  const marker = body.indexOf('\n  ' + prop + '?:')
  expect(marker).toBeGreaterThan(-1)
  const commentEnd = body.lastIndexOf('*/', marker)
  const commentStart = body.lastIndexOf('/**', commentEnd)
  expect(commentStart).toBeGreaterThan(-1)
  expect(body.slice(commentEnd + 2, marker).trim()).toBe('')
  return body.slice(commentStart, commentEnd + 2)
}

function propLine(relativePath: string, prop: string): string {
  const line = read(relativePath)
    .split('\n')
    .find((row) => row.includes('`' + prop + '?`'))
  expect(line).toBeTruthy()
  return line ?? ''
}

const responsiveCharts = [
  ['packages/core/src/types/chart-cartesian.ts', 'AreaChartProps', 'area-chart.md', 'AreaChart'],
  ['packages/core/src/types/chart-cartesian.ts', 'BarChartProps', 'bar-chart.md', 'BarChart'],
  [
    'packages/core/src/types/chart-visualization.ts',
    'FunnelChartProps',
    'funnel-chart.md',
    'FunnelChart'
  ],
  ['packages/core/src/types/chart-radial.ts', 'GaugeChartProps', 'gauge-chart.md', 'GaugeChart'],
  [
    'packages/core/src/types/chart-visualization.ts',
    'HeatmapChartProps',
    'heatmap-chart.md',
    'HeatmapChart'
  ],
  ['packages/core/src/types/chart-cartesian.ts', 'LineChartProps', 'line-chart.md', 'LineChart'],
  ['packages/core/src/types/chart-radial.ts', 'PieChartProps', 'pie-chart.md', 'PieChart'],
  ['packages/core/src/types/chart-radial.ts', 'RadarChartProps', 'radar-chart.md', 'RadarChart'],
  [
    'packages/core/src/types/chart-cartesian.ts',
    'ScatterChartProps',
    'scatter-chart.md',
    'ScatterChart'
  ],
  [
    'packages/core/src/types/chart-visualization.ts',
    'SunburstChartProps',
    'sunburst-chart.md',
    'SunburstChart'
  ],
  [
    'packages/core/src/types/chart-visualization.ts',
    'TreeMapChartProps',
    'tree-map-chart.md',
    'TreeMapChart'
  ]
] as const

describe('C138-F02 responsive default comment', () => {
  it.each(responsiveCharts)(
    '%s %s documents responsive default true',
    (typeFile, interfaceName, docFile, component) => {
      const doc = propDoc(interfaceBody(read(typeFile), interfaceName), 'responsive')
      expect(doc).toContain('@default true')
      expect(doc).not.toContain('@default false')
      expect(read('packages/vue/src/components/' + component + '.ts')).toContain(
        'responsive: { type: Boolean, default: true }'
      )
      expect(read('packages/react/src/components/' + component + '.tsx')).toContain(
        'responsive = true'
      )
      const line = propLine('skills/tigercat/references/shared/props/' + docFile, 'responsive')
      expect(line).toContain('`true`')
      expect(line).not.toContain('`false`')
    }
  )
})

const padding24 = [
  ['packages/core/src/types/chart-visualization.ts', 'FunnelChartProps', 'funnel-chart.md'],
  ['packages/core/src/types/gantt.ts', 'GanttProps', 'gantt.md'],
  ['packages/core/src/types/chart-radial.ts', 'GaugeChartProps', 'gauge-chart.md'],
  ['packages/core/src/types/org-chart.ts', 'OrgChartProps', 'org-chart.md'],
  ['packages/core/src/types/chart-radial.ts', 'PieChartProps', 'pie-chart.md']
] as const

describe('C146-F04 padding default comment', () => {
  it.each(padding24)('%s %s documents padding default 24', (typeFile, interfaceName, docFile) => {
    const doc = propDoc(interfaceBody(read(typeFile), interfaceName), 'padding')
    expect(doc).toContain('@default 24')
    expect(doc).not.toContain('bottom: 52')
    const line = propLine('skills/tigercat/references/shared/props/' + docFile, 'padding')
    expect(line).toContain('default `24`')
    expect(line).not.toContain('bottom: 52')
  })

  it('documents RadarChart padding default 36', () => {
    const doc = propDoc(
      interfaceBody(read('packages/core/src/types/chart-radial.ts'), 'RadarChartProps'),
      'padding'
    )
    expect(doc).toContain('@default 36')
    expect(doc).not.toContain('bottom: 52')
    const line = propLine('skills/tigercat/references/shared/props/radar-chart.md', 'padding')
    expect(line).toContain('default `36`')
    expect(line).not.toContain('bottom: 52')
  })
})

describe('C146-F03 funnel gradient comment', () => {
  it('describes a gradient along the funnel direction', () => {
    const doc = propDoc(
      interfaceBody(read('packages/core/src/types/chart-visualization.ts'), 'FunnelChartProps'),
      'gradient'
    )
    expect(doc).toContain('沿漏斗方向渐变')
    expect(doc).not.toMatch(/垂直|vertical/i)
    const line = propLine('skills/tigercat/references/shared/props/funnel-chart.md', 'gradient')
    expect(line).toContain('沿漏斗方向渐变')
    expect(line).not.toMatch(/垂直|vertical/i)
  })
})
