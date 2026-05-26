/**
 * @vitest-environment happy-dom
 */

import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { OrgChart } from '@expcat/tigercat-vue'
import type { OrgChartNode } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

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
    const { container } = render(OrgChart, { props: { data } })

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-org-chart-nodes="true"] > g')).toHaveLength(3)
    expect(container.querySelectorAll('[data-org-chart-links="true"] path')).toHaveLength(2)
  })

  it('renders title, subtitle, svg title and desc', () => {
    const { container, getByText } = render(OrgChart, {
      props: { data, title: 'Org', desc: 'Company structure' }
    })

    expect(container.querySelector('title')?.textContent).toBe('Org')
    expect(container.querySelector('desc')?.textContent).toBe('Company structure')
    expect(getByText('Ada')).toBeInTheDocument()
    expect(getByText('Platform')).toBeInTheDocument()
  })

  it('selects nodes when selectable', async () => {
    const { getByRole, emitted } = render(OrgChart, { props: { data, selectable: true } })

    await fireEvent.click(getByRole('button', { name: 'Ada, CEO, Platform' }))

    expect(emitted()['update:selectedId']).toEqual([['ceo']])
    expect(emitted()['node-click']).toEqual([[data]])
  })

  it('emits hover events when hoverable', async () => {
    const { getByRole, emitted } = render(OrgChart, { props: { data, hoverable: true } })

    await fireEvent.mouseEnter(getByRole('button', { name: 'Lin, Engineering' }))
    await fireEvent.mouseLeave(getByRole('button', { name: 'Lin, Engineering' }))

    expect(emitted()['node-hover']).toEqual([[data.children?.[0]], [null]])
  })

  it('supports keyboard selection', async () => {
    const { getByRole, emitted } = render(OrgChart, { props: { data, selectable: true } })

    await fireEvent.keyDown(getByRole('button', { name: 'Mira, Operations' }), { key: 'Enter' })

    expect(emitted()['update:selectedId']).toEqual([['ops']])
  })

  it('supports horizontal direction', () => {
    const { container } = render(OrgChart, { props: { data, direction: 'horizontal' } })

    expect(container.querySelector('[data-series-type="org-chart"]')).toBeInTheDocument()
  })

  it('applies custom colors and className', () => {
    const { container } = render(OrgChart, {
      props: { data, colors: ['#ff0000'], className: 'org' }
    })

    expect(container.querySelector('svg.org')).toBeInTheDocument()
    expect(container.querySelector('rect[fill="#ff0000"]')).toBeInTheDocument()
  })

  it('hides subtitles when disabled', () => {
    const { queryByText } = render(OrgChart, { props: { data, showSubtitles: false } })

    expect(queryByText('Platform')).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(OrgChart, { props: { data, title: 'Org chart' } })
    await expectNoA11yViolationsIsolated(container)
  })
})
