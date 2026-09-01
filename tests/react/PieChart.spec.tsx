import { describe, it, expect, vi } from 'vitest'
import { PieChart } from '@expcat/tigercat-react/PieChart'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'
import { fireEvent, render } from '@testing-library/react'

const defaultSize = { width: 240, height: 160 }
const data = [
  { value: 40, label: 'Apples' },
  { value: 30, label: 'Pears' }
]

describe('PieChart', () => {
  it('renders slices', () => {
    const { container } = renderWithProps(PieChart, {
      data: [{ value: 40 }, { value: 30 }, { value: 20 }],
      ...defaultSize
    })
    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(3)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(PieChart, { data, title: 'Fruit' })
    await expectNoA11yViolations(container)
  })

  it('hides decorative slices from the accessibility tree by default', () => {
    const { container } = renderWithProps(PieChart, { data, ...defaultSize })
    const slices = container.querySelectorAll('path[data-pie-slice]')
    expect(slices[0]).toHaveAttribute('aria-hidden', 'true')
    expect(slices[0]).not.toHaveAttribute('role')
  })

  it('uses a single tab stop when selectable', () => {
    const { container } = renderWithProps(PieChart, { data, selectable: true, ...defaultSize })
    const slices = container.querySelectorAll('path[data-pie-slice]')
    expect(slices[0]).toHaveAttribute('role', 'button')
    expect(slices[0]).toHaveAttribute('tabindex', '0')
    expect(slices[1]).toHaveAttribute('tabindex', '-1')
  })

  it('renders empty state with no data', () => {
    const { container } = renderWithProps(PieChart, { data: [], ...defaultSize })
    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(0)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('skips non-positive values', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { container } = renderWithProps(PieChart, {
      data: [{ value: 10 }, { value: 0 }, { value: Number.NaN }],
      ...defaultSize
    })
    expect(container.querySelectorAll('path[data-pie-slice]')).toHaveLength(1)
    warn.mockRestore()
  })

  it('uses the locale slice name when a datum has no label', () => {
    const { container } = renderWithProps(PieChart, {
      data: [{ value: 10 }, { value: 5 }],
      showLegend: true,
      ...defaultSize
    })
    expect(container.querySelector('[role="list"]')?.textContent).toContain('Slice 1')
  })

  it('uses zh-CN legend name from ConfigProvider', () => {
    const { container } = render(
      <ConfigProvider locale={zhCN}>
        <PieChart data={data} showLegend width={240} height={160} />
      </ConfigProvider>
    )
    expect(container.querySelector('[role="list"]')).toHaveAttribute('aria-label', '图表图例')
  })

  it('paints gradient fills in pie user space', () => {
    const { container } = renderWithProps(PieChart, { data, gradient: true, ...defaultSize })
    const gradient = container.querySelector('linearGradient')
    expect(gradient).toHaveAttribute('gradientUnits', 'userSpaceOnUse')
    expect(container.querySelector('path[data-pie-slice]')?.getAttribute('fill')).toMatch(
      /^url\(#tiger-pie-/
    )
  })

  describe('interaction', () => {
    it('triggers hover events when hoverable', () => {
      const onHoveredIndexChange = vi.fn()
      const { container } = renderWithProps(PieChart, {
        data,
        hoverable: true,
        onHoveredIndexChange,
        ...defaultSize
      })
      fireEvent.mouseEnter(container.querySelector('path[data-pie-slice]')!)
      expect(onHoveredIndexChange).toHaveBeenCalledWith(0)
    })

    it('fires slice click without selectable', () => {
      const onSliceClick = vi.fn()
      const { container } = renderWithProps(PieChart, {
        data,
        onSliceClick,
        ...defaultSize
      })
      fireEvent.click(container.querySelectorAll('path[data-pie-slice]')[1])
      expect(onSliceClick).toHaveBeenCalledWith(1, data[1])
    })

    it('opens tooltip from keyboard focus', () => {
      const { container } = renderWithProps(PieChart, {
        data,
        selectable: true,
        showTooltip: true,
        ...defaultSize
      })
      fireEvent.focus(container.querySelector('path[data-pie-slice]')!)
      expect(document.body.querySelector('[role="tooltip"]')?.textContent).toContain('Apples')
    })
  })
})
