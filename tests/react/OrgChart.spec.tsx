import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OrgChart } from '@expcat/tigercat-react'
import type { OrgChartNode } from '@expcat/tigercat-core'
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

  it('supports horizontal direction', () => {
    const { container } = render(<OrgChart data={data} direction="horizontal" />)

    expect(container.querySelector('[data-series-type="org-chart"]')).toBeInTheDocument()
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
      expect(onNodeClick).toHaveBeenCalledWith(disabledData)
    })

    it('applies custom aria label to the chart image', () => {
      const { getByRole } = render(<OrgChart data={data} ariaLabel="Leadership chart" />)

      expect(getByRole('img', { name: 'Leadership chart' })).toBeInTheDocument()
    })
  })
})
