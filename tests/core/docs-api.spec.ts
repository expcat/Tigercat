import { describe, expect, it } from 'vitest'

import {
  MAX_COMPACT_PROPS,
  buildRequiredPropSnippet,
  collectPublicHookExports,
  getVisiblePropRows,
  isEmptyComponentSnippet,
  mergeHeritageMembers,
  resolveUsageSnippet,
  shouldUseFrameworkRuntimeProps
} from '../../scripts/lib/docs-api.mjs'

function row(name: string, origin: 'own' | 'inherited' = 'own') {
  return { name, type: 'unknown', defaultValue: '-', description: '-', kind: 'prop', origin }
}

describe('mergeHeritageMembers', () => {
  it('merges parent fields into a child Props interface', () => {
    const details = new Map([
      [
        'PieChartProps',
        {
          name: 'PieChartProps',
          heritage: [],
          members: [row('data'), row('innerRadius?')]
        }
      ],
      [
        'DonutChartProps',
        {
          name: 'DonutChartProps',
          heritage: ['PieChartProps'],
          members: [row('innerRadiusRatio?'), row('animated?')]
        }
      ]
    ])

    const merged = mergeHeritageMembers('DonutChartProps', details)

    expect(merged.map((member) => member.name)).toEqual([
      'innerRadiusRatio?',
      'animated?',
      'data',
      'innerRadius?'
    ])
    expect(merged.find((member) => member.name === 'data')?.origin).toBe('inherited')
    expect(merged.find((member) => member.name === 'animated?')?.origin).toBe('own')
  })
})

describe('getVisiblePropRows', () => {
  it('keeps required inherited data and thin-extend own fields', () => {
    const visible = getVisiblePropRows('DonutChart', [
      row('innerRadiusRatio?'),
      row('centerValue?'),
      row('centerLabel?'),
      row('animated?'),
      row('data', 'inherited'),
      row('width?', 'inherited'),
      row('height?', 'inherited'),
      row('className?', 'inherited')
    ])

    expect(visible.map((member) => member.name)).toEqual([
      'data',
      'innerRadiusRatio?',
      'centerValue?',
      'centerLabel?',
      'animated?'
    ])
  })

  it('keeps open even when it is not among the first type fields', () => {
    const visible = getVisiblePropRows('Select', [
      row('size?'),
      row('placeholder?'),
      row('searchable?'),
      row('open?'),
      row('locale?')
    ])

    expect(visible.map((member) => member.name)).toEqual(['open?', 'locale?', 'size?'])
  })

  it('does not dump every Table field into the compact table', () => {
    const rows = Array.from({ length: 49 }, (_, index) => row(`extra${index}?`))
    rows[0] = row('columns')
    rows[2] = row('dataSource?')
    rows[8] = row('pagination?')
    rows[9] = row('sort?')
    rows[10] = row('filters?')
    rows[20] = row('rowSelection?')
    rows[21] = row('expandable?')
    rows[22] = row('rowKey?')
    rows[30] = row('virtual?')

    const visible = getVisiblePropRows('Table', rows)

    expect(visible.length).toBeLessThanOrEqual(MAX_COMPACT_PROPS)
    expect(visible.map((member) => member.name)).toEqual([
      'columns',
      'dataSource?',
      'pagination?',
      'sort?',
      'filters?',
      'rowSelection?',
      'expandable?',
      'rowKey?'
    ])
  })
})

describe('shouldUseFrameworkRuntimeProps', () => {
  it('prefers ChartLegend runtime props over the chart mixin', () => {
    const coreByName = new Map([
      ['ChartLegendProps', { name: 'ChartLegendProps', heritage: [] }],
      ['PieChartProps', { name: 'PieChartProps', heritage: ['ChartLegendProps'] }]
    ])

    expect(shouldUseFrameworkRuntimeProps('ChartLegendProps', coreByName, [])).toBe(true)
  })

  it('does not treat Donut extending Pie as a reason to drop Pie core fields', () => {
    const coreByName = new Map([
      ['PieChartProps', { name: 'PieChartProps', heritage: [] }],
      ['DonutChartProps', { name: 'DonutChartProps', heritage: ['PieChartProps'] }]
    ])

    expect(shouldUseFrameworkRuntimeProps('PieChartProps', coreByName, ['CorePieChartProps'])).toBe(
      false
    )
  })
})

describe('usage snippets', () => {
  it('does not treat command APIs as empty JSX components', () => {
    expect(resolveUsageSnippet('Message', 'React', [], null)).toBe("Message.info('Saved')")
    expect(resolveUsageSnippet('LoadingBar', 'Vue', [], '<LoadingBar />')).toBe(
      'LoadingBar.start()'
    )
    expect(
      isEmptyComponentSnippet('Message', resolveUsageSnippet('Message', 'Vue', [], null))
    ).toBe(false)
  })

  it('binds required props instead of listing an empty component', () => {
    expect(resolveUsageSnippet('Tour', 'Vue', ['steps'], null)).toBe('<Tour :steps="steps" />')
    expect(resolveUsageSnippet('Image', 'React', [], '<Image />')).toBe('<Image src="..." />')
    expect(buildRequiredPropSnippet('ChartTooltip', ['content'], 'React')).toBe(
      '<ChartTooltip content={content} />'
    )
    expect(
      isEmptyComponentSnippet('FormItem', resolveUsageSnippet('FormItem', 'Vue', [], null))
    ).toBe(false)
  })
})

describe('collectPublicHookExports', () => {
  it('indexes hooks exported from hooks/composables entry paths', () => {
    const react = `
export { ConfigProvider, useTigerConfig } from './components/ConfigProvider'
export { useFormController } from './hooks/useFormController'
export { useChartInteraction } from './hooks/useChartInteraction'
export { useDrag } from './hooks/useDrag'
export { useControlledState } from './hooks/useControlledState'
`
    const vue = `
export { useFormController } from './composables/useFormController'
export { useChartInteraction } from './composables/useChartInteraction'
export { useDrag } from './composables/useDrag'
`

    expect(collectPublicHookExports(react)).toEqual([
      'useChartInteraction',
      'useControlledState',
      'useDrag',
      'useFormController'
    ])
    expect(collectPublicHookExports(vue)).toEqual([
      'useChartInteraction',
      'useDrag',
      'useFormController'
    ])
  })
})
