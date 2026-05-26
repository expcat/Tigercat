import { describe, expect, it } from 'vitest'
import {
  computeOrgChartLayout,
  getOrgChartLinkPath,
  getOrgChartNodeAriaLabel,
  normalizeOrgChartData
} from '@expcat/tigercat-core'
import type { OrgChartNode } from '@expcat/tigercat-core'

const orgData: OrgChartNode = {
  id: 'ceo',
  label: 'Ada',
  title: 'CEO',
  children: [
    { id: 'eng', label: 'Lin', title: 'Engineering' },
    {
      id: 'ops',
      label: 'Mira',
      title: 'Operations',
      children: [
        { id: 'support', label: 'Noor' },
        { id: 'finance', label: 'Iris' }
      ]
    }
  ]
}

describe('org-chart-utils', () => {
  it('normalizes single root data into an array', () => {
    expect(normalizeOrgChartData(orgData)).toEqual([orgData])
    expect(normalizeOrgChartData([orgData])).toEqual([orgData])
  })

  it('lays out parent nodes centered over their descendants', () => {
    const layout = computeOrgChartLayout(orgData, {
      nodeWidth: 100,
      nodeHeight: 40,
      levelGap: 60,
      siblingGap: 20
    })

    const ceo = layout.nodes.find((node) => node.id === 'ceo')
    const eng = layout.nodes.find((node) => node.id === 'eng')
    const ops = layout.nodes.find((node) => node.id === 'ops')

    expect(eng?.x).toBe(0)
    expect(ops?.x).toBe(180)
    expect(ceo?.x).toBe(90)
    expect(layout.depth).toBe(3)
  })

  it('creates links between every parent and child', () => {
    const layout = computeOrgChartLayout(orgData)

    expect(layout.links.map((link) => `${link.sourceId}->${link.targetId}`)).toEqual([
      'ceo->eng',
      'ceo->ops',
      'ops->support',
      'ops->finance'
    ])
  })

  it('returns empty layout for empty forests', () => {
    expect(computeOrgChartLayout([])).toEqual({
      nodes: [],
      links: [],
      width: 0,
      height: 0,
      depth: 0
    })
  })

  it('lays out multiple root nodes as siblings', () => {
    const layout = computeOrgChartLayout([orgData, { id: 'board', label: 'Board' }], {
      nodeWidth: 100,
      siblingGap: 20
    })

    expect(layout.nodes.find((node) => node.id === 'board')?.x).toBe(360)
    expect(layout.width).toBe(460)
  })

  it('supports horizontal direction by flipping coordinates', () => {
    const layout = computeOrgChartLayout(orgData, {
      nodeWidth: 100,
      nodeHeight: 40,
      levelGap: 60,
      siblingGap: 20,
      direction: 'horizontal'
    })

    const ceo = layout.nodes.find((node) => node.id === 'ceo')
    const eng = layout.nodes.find((node) => node.id === 'eng')

    expect(ceo?.x).toBe(0)
    expect(ceo?.y).toBe(90)
    expect(eng?.x).toBe(100)
    expect(eng?.y).toBe(0)
  })

  it('builds stable curved link paths', () => {
    expect(
      getOrgChartLinkPath({
        sourceId: 'a',
        targetId: 'b',
        sourceX: 50,
        sourceY: 40,
        targetX: 150,
        targetY: 100
      })
    ).toBe('M 50 40 C 50 70, 150 70, 150 100')
  })

  it('combines node text for accessible labels', () => {
    expect(
      getOrgChartNodeAriaLabel({ id: 'n', label: 'Ada', title: 'CEO', subtitle: 'Platform' })
    ).toBe('Ada, CEO, Platform')
  })
})
