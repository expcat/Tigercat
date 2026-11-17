/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import { TreeMapChart } from '@expcat/tigercat-vue/TreeMapChart'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { renderWithProps, expectNoA11yViolations } from '../utils'

const defaultSize = { width: 400, height: 300 }
const sampleData = [
  { label: 'A', value: 40 },
  { label: 'B', value: 30 },
  { label: 'C', value: 20 },
  { label: 'D', value: 10 }
]

describe('TreeMapChart (Vue)', () => {
  it.each([{ showTooltip: false }, { selectedIndex: 0 }])(
    'moves the tab stop independently of tooltip and selection: %j',
    async (options) => {
      const { container } = renderWithProps(TreeMapChart, {
        ...defaultSize,
        data: sampleData.slice(0, 2),
        selectable: true,
        ...options
      })
      const [first, second] = container.querySelectorAll<SVGElement>('[data-treemap-node]')
      first.focus()
      await fireEvent.keyDown(first, { key: 'ArrowRight' })
      expect(document.activeElement).toBe(second)
      expect(first).toHaveAttribute('tabindex', '-1')
      expect(second).toHaveAttribute('tabindex', '0')
    }
  )

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
    nodes[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
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
  it('ignores hover and click on legend-hidden marks', async () => {
    const onHover = vi.fn()
    const onClick = vi.fn()
    const { container } = renderWithProps(TreeMapChart, {
      data: [
        { label: 'Hidden', children: [{ label: 'Child', value: 40 }] },
        { label: 'Visible', value: 20 }
      ],
      showLegend: true,
      hoverable: true,
      selectable: true,
      'onUpdate:hoveredIndex': onHover,
      onNodeClick: onClick
    })
    await fireEvent.click(container.querySelector('[data-legend-item]')!)
    onHover.mockClear()
    const hidden = container.querySelector('[data-treemap-node][data-index="1"]')!
    await fireEvent.mouseEnter(hidden)
    await fireEvent.click(hidden)
    expect(onHover).not.toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
    expect(hidden).toHaveAttribute('pointer-events', 'none')
    expect(hidden).not.toHaveAttribute('tabindex')
  })

  it('names the svg from the title or the zh-CN treemap label', () => {
    const untitled = renderWithProps(TreeMapChart, {
      data: sampleData,
      locale: zhCN,
      ...defaultSize
    })
    expect(untitled.container.querySelector('svg')).toHaveAttribute('aria-label', '矩形树图')
    untitled.unmount()

    const titled = renderWithProps(TreeMapChart, {
      data: sampleData,
      locale: zhCN,
      title: '份额',
      ...defaultSize
    })
    expect(titled.container.querySelector('svg')).toHaveAttribute('aria-label', '份额')
  })

  it('keeps focus on the first side-by-side leaf for ArrowDown', async () => {
    const { container } = renderWithProps(TreeMapChart, {
      ...defaultSize,
      data: [
        { label: 'A', value: 40 },
        { label: 'B', value: 30 }
      ],
      onNodeClick: vi.fn()
    })
    const [first, second] = container.querySelectorAll<SVGElement>('[data-treemap-node]')
    expect(Number(second.getAttribute('x'))).toBeGreaterThan(Number(first.getAttribute('x')))
    expect(second.getAttribute('y')).toBe(first.getAttribute('y'))
    first.focus()
    await fireEvent.keyDown(first, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(first)
    await fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(second)
  })
})
