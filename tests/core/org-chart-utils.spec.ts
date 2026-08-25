import { describe, expect, it } from 'vitest'
import {
  computeOrgChartLayout,
  getOrgChartLinkPath,
  getOrgChartNodeAriaLabel,
  normalizeOrgChartData,
  orgChartNodeLabelClasses,
  orgChartNodeRectClasses,
  orgChartNodeSubtitleClasses,
  orgChartNodeTitleClasses
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
    expect(ceo?.width).toBe(100)
    expect(ceo?.height).toBe(40)
    expect(eng?.width).toBe(100)
    expect(eng?.height).toBe(40)
    expect(layout.nodes.every((node) => node.width === 100 && node.height === 40)).toBe(true)
  })

  it('keeps default nodeWidth x nodeHeight when direction is horizontal', () => {
    const layout = computeOrgChartLayout(orgData, { direction: 'horizontal' })

    expect(layout.nodes.every((node) => node.width === 160 && node.height === 72)).toBe(true)
    expect(layout.nodes.some((node) => node.width === 72 && node.height === 160)).toBe(false)
  })

  it('keeps default nodeWidth x nodeHeight in vertical layout', () => {
    const layout = computeOrgChartLayout(orgData)

    expect(layout.nodes.every((node) => node.width === 160 && node.height === 72)).toBe(true)
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

  it('lands node fill on registered surface, not locked white or bg/fill aliases', () => {
    expect(orgChartNodeRectClasses).toContain('--tiger-surface')
    expect(orgChartNodeRectClasses).toContain('--tiger-org-node-bg')
    expect(orgChartNodeRectClasses).toContain('--tiger-org-node-bg,var(--tiger-surface')
    expect(orgChartNodeRectClasses).toContain('--tiger-border')
    expect(orgChartNodeRectClasses).toContain('drop-shadow-sm')
    expect(orgChartNodeRectClasses).not.toContain('--tiger-bg')
    expect(orgChartNodeRectClasses).not.toContain('--tiger-fill')
    expect(orgChartNodeRectClasses).not.toContain('fill-[var(--tiger-bg,#ffffff)]')
    expect(orgChartNodeRectClasses).not.toContain('--tiger-surface-muted')

    const overrideIdx = orgChartNodeRectClasses.indexOf('--tiger-org-node-bg')
    const semanticIdx = orgChartNodeRectClasses.indexOf('--tiger-surface')
    expect(overrideIdx).toBeGreaterThan(-1)
    expect(semanticIdx).toBeGreaterThan(overrideIdx)
  })

  it('lands node label on registered text, not muted alias', () => {
    expect(orgChartNodeLabelClasses).toContain('--tiger-text')
    expect(orgChartNodeLabelClasses).toContain('--tiger-org-label,var(--tiger-text')
    expect(orgChartNodeLabelClasses).not.toContain('--tiger-text-muted')
    expect(orgChartNodeLabelClasses).not.toContain('--tiger-text-secondary')

    const overrideIdx = orgChartNodeLabelClasses.indexOf('--tiger-org-label')
    const semanticIdx = orgChartNodeLabelClasses.indexOf('--tiger-text,#111827')
    expect(overrideIdx).toBeGreaterThan(-1)
    expect(semanticIdx).toBeGreaterThan(overrideIdx)
  })

  it('lands node title and subtitle on registered text-secondary, not muted alias', () => {
    expect(orgChartNodeTitleClasses).toContain('--tiger-text-secondary')
    expect(orgChartNodeTitleClasses).toContain('--tiger-org-title,var(--tiger-text-secondary')
    expect(orgChartNodeTitleClasses).not.toContain('--tiger-text-muted')
    expect(orgChartNodeTitleClasses).not.toContain('--tiger-text-muted,#6b7280')

    expect(orgChartNodeSubtitleClasses).toContain('--tiger-text-secondary')
    expect(orgChartNodeSubtitleClasses).toContain('--tiger-org-subtitle,var(--tiger-text-secondary')
    expect(orgChartNodeSubtitleClasses).not.toContain('--tiger-text-muted')
    expect(orgChartNodeSubtitleClasses).not.toContain('--tiger-text-muted,#6b7280')

    const titleOverrideIdx = orgChartNodeTitleClasses.indexOf('--tiger-org-title')
    const titleSemanticIdx = orgChartNodeTitleClasses.indexOf('--tiger-text-secondary')
    expect(titleOverrideIdx).toBeGreaterThan(-1)
    expect(titleSemanticIdx).toBeGreaterThan(titleOverrideIdx)

    const subtitleOverrideIdx = orgChartNodeSubtitleClasses.indexOf('--tiger-org-subtitle')
    const subtitleSemanticIdx = orgChartNodeSubtitleClasses.indexOf('--tiger-text-secondary')
    expect(subtitleOverrideIdx).toBeGreaterThan(-1)
    expect(subtitleSemanticIdx).toBeGreaterThan(subtitleOverrideIdx)
  })
})
