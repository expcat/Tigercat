import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OrgChart } from '@expcat/tigercat-react/OrgChart'
import { getOrgChartNodeMarkerGeometry, type OrgChartNode } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const data: OrgChartNode = {
  id: 'ceo',
  label: 'Ada',
  title: 'CEO',
  subtitle: 'Platform',
  children: [
    { id: 'eng', label: 'Lin', title: 'Engineering' },
    { id: 'ops', label: 'Mira', title: 'Operations' }
  ]
}

describe('OrgChart', () => {
  it('writes only allowlisted avatar addresses into svg image', () => {
    const withAvatar: OrgChartNode = {
      id: 'ceo',
      label: 'Ada',
      avatar: 'https://example.com/ada.png',
      children: [{ id: 'bad', label: 'Eve', avatar: 'javascript:alert(1)' }]
    }
    const { container } = render(<OrgChart data={withAvatar} />)
    const images = [...container.querySelectorAll('image')].map((node) => node.getAttribute('href'))
    expect(images).toEqual(['https://example.com/ada.png'])
  })

  it('renders svg nodes and links', () => {
    const { container } = render(<OrgChart data={data} />)

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-org-chart-nodes="true"] > g')).toHaveLength(3)
    expect(container.querySelectorAll('[data-org-chart-links="true"] path')).toHaveLength(2)
  })

  it('renders title, subtitle, svg title and desc', () => {
    const { container, getByText } = render(
      <OrgChart data={data} title="Org" desc="Company structure" />
    )

    expect(container.querySelector('title')?.textContent).toBe('Org')
    expect(container.querySelector('desc')?.textContent).toBe('Company structure')
    expect(getByText('Ada')).toBeInTheDocument()
    expect(getByText('Platform')).toBeInTheDocument()
  })

  it('selects nodes when selectable', () => {
    const onSelectedIdChange = vi.fn()
    const onNodeClick = vi.fn()
    const { getByRole } = render(
      <OrgChart
        data={data}
        selectable
        onSelectedIdChange={onSelectedIdChange}
        onNodeClick={onNodeClick}
      />
    )

    fireEvent.click(getByRole('button', { name: 'Ada, CEO, Platform' }))

    expect(onSelectedIdChange).toHaveBeenCalledWith('ceo')
    expect(onNodeClick).toHaveBeenCalledWith(data)
  })

  it('emits hover events when hoverable', () => {
    const onNodeHover = vi.fn()
    const { getByRole } = render(<OrgChart data={data} hoverable onNodeHover={onNodeHover} />)

    fireEvent.mouseEnter(getByRole('button', { name: 'Lin, Engineering' }))
    fireEvent.mouseLeave(getByRole('button', { name: 'Lin, Engineering' }))

    expect(onNodeHover).toHaveBeenCalledWith(data.children?.[0])
    expect(onNodeHover).toHaveBeenCalledWith(null)
  })

  it('supports keyboard selection', () => {
    const onSelectedIdChange = vi.fn()
    const { getByRole } = render(
      <OrgChart data={data} selectable onSelectedIdChange={onSelectedIdChange} />
    )

    fireEvent.keyDown(getByRole('button', { name: 'Mira, Operations' }), { key: 'Enter' })

    expect(onSelectedIdChange).toHaveBeenCalledWith('ops')
  })

  it.each([
    { orientation: 'vertical' as const, nodeWidth: 160, nodeHeight: 72 },
    { orientation: 'horizontal' as const, nodeWidth: 180, nodeHeight: 48 }
  ])(
    'keeps every left accent inside the $orientation card',
    ({ orientation, nodeWidth, nodeHeight }) => {
      const { container } = render(
        <OrgChart
          data={data}
          orientation={orientation}
          nodeWidth={nodeWidth}
          nodeHeight={nodeHeight}
        />
      )
      const nodes = [...container.querySelectorAll('[data-org-chart-nodes="true"] > g')]
      expect(nodes.length).toBeGreaterThan(1)
      const markerBoxes = nodes.map((node) => {
        const card = node.querySelector('[data-org-node-part="card"]')
        const marker = node.querySelector('[data-org-node-part="marker"]')
        const stroke = node.querySelector('[data-org-node-part="stroke"]')
        const geometry = getOrgChartNodeMarkerGeometry(nodeWidth, nodeHeight)
        expect(card).toHaveAttribute('width', String(nodeWidth))
        expect(card).toHaveAttribute('height', String(nodeHeight))
        expect(card).toHaveAttribute('rx', String(geometry.radius))
        expect(marker).toHaveAttribute('x', String(geometry.marker.x))
        expect(marker).toHaveAttribute('y', String(geometry.marker.y))
        expect(marker).toHaveAttribute('width', String(geometry.marker.width))
        expect(marker).toHaveAttribute('height', String(geometry.marker.height))
        expect(marker).not.toHaveAttribute('rx')
        expect(marker).toHaveAttribute('stroke', 'none')
        const clipRef = marker?.getAttribute('clip-path') ?? ''
        expect(clipRef).toMatch(/^url\(#tiger-org-node-.+\)$/)
        const clip = node.querySelector(`#${clipRef.slice(5, -1)} rect`)
        expect(clip).toHaveAttribute('rx', String(geometry.clip.rx))
        expect(clip).toHaveAttribute('x', String(geometry.clip.x))
        expect(clip).toHaveAttribute('width', String(geometry.clip.width))
        expect(clip).toHaveAttribute('height', String(geometry.clip.height))
        expect(stroke).toHaveAttribute('fill', 'none')
        expect(stroke).toHaveAttribute('stroke-width', String(geometry.strokeWidth))
        expect(
          [...node.querySelectorAll('[data-org-node-part]')].map((el) =>
            el.getAttribute('data-org-node-part')
          )
        ).toEqual(['card', 'marker', 'stroke'])
        return ['x', 'y', 'width', 'height'].map((attr) => marker?.getAttribute(attr)).join(',')
      })
      expect(new Set(markerBoxes).size).toBe(1)
    }
  )

  it('paints a thicker border on the selected node only', () => {
    const { container } = render(<OrgChart data={data} selectable selectedId="eng" />)
    const strokes = [...container.querySelectorAll('[data-org-node-part="stroke"]')]
    const selected = strokes.filter((node) => node.getAttribute('stroke-width') === '2')
    expect(selected).toHaveLength(1)
    expect(selected[0]?.getAttribute('style')).toContain('stroke')
    expect(strokes.filter((node) => node.getAttribute('stroke-width') === '1')).toHaveLength(2)
  })

  it('supports horizontal direction', () => {
    const { container } = render(<OrgChart data={data} orientation="horizontal" />)

    expect(container.querySelector('[data-series-type="org-chart"]')).toBeInTheDocument()
    const nodeRect = container.querySelector('[data-org-chart-nodes="true"] > g > rect')
    expect(nodeRect).toHaveAttribute('width', '160')
    expect(nodeRect).toHaveAttribute('height', '72')
  })
  it('hides subtitles when disabled', () => {
    const { queryByText } = render(<OrgChart data={data} showSubtitles={false} />)

    expect(queryByText('Platform')).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<OrgChart data={data} title="Org chart" />)
    await expectNoA11yViolationsIsolated(container)
  })

  describe('Edge Cases and Boundary', () => {
    it('prevents disabled nodes from becoming selectable', () => {
      const onSelectedIdChange = vi.fn()
      const onNodeClick = vi.fn()
      const disabledData: OrgChartNode = { ...data, disabled: true }
      const { getByRole } = render(
        <OrgChart
          data={disabledData}
          selectable
          onSelectedIdChange={onSelectedIdChange}
          onNodeClick={onNodeClick}
        />
      )

      fireEvent.click(getByRole('group', { name: 'Ada, CEO, Platform' }))

      expect(onSelectedIdChange).not.toHaveBeenCalled()
      expect(onNodeClick).not.toHaveBeenCalled()
    })

    it('applies custom aria label to the chart image', () => {
      const { getByRole } = render(<OrgChart data={data} ariaLabel="Leadership chart" />)

      expect(getByRole('group', { name: 'Leadership chart' })).toBeInTheDocument()
    })
  })
})
