import { describe, it, expect, vi } from 'vitest'
import { TreeMapChart } from '@expcat/tigercat-react/TreeMapChart'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'
import { fireEvent } from '@testing-library/react'

const defaultSize = { width: 400, height: 300 }
const sampleData = [
  { label: 'A', value: 40 },
  { label: 'B', value: 30 },
  { label: 'C', value: 20 },
  { label: 'D', value: 10 }
]

describe('TreeMapChart (React)', () => {
  it('renders SVG with rect nodes', () => {
    const { container } = renderWithProps(TreeMapChart, { data: sampleData, ...defaultSize })
    expect(container.querySelectorAll('[data-treemap-node]')).toHaveLength(4)
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(TreeMapChart, { data: [], ...defaultSize })
    expect(container.querySelectorAll('[data-treemap-node]')).toHaveLength(0)
  })

  it('fires node click for the drawn cell without selectable', () => {
    const onNodeClick = vi.fn()
    const data = [
      { label: 'A', value: 10 },
      { label: 'B', value: 90 }
    ]
    const { container } = renderWithProps(TreeMapChart, { data, onNodeClick, ...defaultSize })
    const nodes = container.querySelectorAll('[data-treemap-node]')
    fireEvent.click(nodes[1])
    const index = Number(nodes[1].getAttribute('data-index'))
    const datum = onNodeClick.mock.calls[0][1]
    expect(onNodeClick).toHaveBeenCalledWith(index, datum)
    expect(data.some((item) => item.label === datum.label && item.value === datum.value)).toBe(true)
  })

  it('draws nested parents', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: [
        {
          label: 'Parent',
          value: 100,
          children: [
            { label: 'Child1', value: 60 },
            { label: 'Child2', value: 40 }
          ]
        }
      ],
      ...defaultSize
    })
    expect(container.querySelectorAll('[data-treemap-node]').length).toBeGreaterThanOrEqual(3)
  })

  it('keeps nodeRadius on the SVG attribute', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      nodeRadius: 8,
      ...defaultSize
    })
    expect(container.querySelector('[data-treemap-node]')).toHaveAttribute('rx', '8')
  })

  it('applies className on the outer wrapper', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      className: 'my-treemap',
      ...defaultSize
    })
    expect(container.firstElementChild).toHaveClass('my-treemap')
  })

  it('paints gradient fills in chart user space', () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      gradient: true,
      ...defaultSize
    })
    expect(container.querySelector('linearGradient')).toHaveAttribute(
      'gradientUnits',
      'userSpaceOnUse'
    )
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(TreeMapChart, {
      data: sampleData,
      title: 'Share',
      ...defaultSize
    })
    await expectNoA11yViolations(container)
  })

  it('hides decorative nodes from the accessibility tree by default', () => {
    const { container } = renderWithProps(TreeMapChart, { data: sampleData, ...defaultSize })
    const node = container.querySelector('[data-treemap-node]')
    expect(node).toHaveAttribute('aria-hidden', 'true')
    expect(node).not.toHaveAttribute('role')
  })
})
