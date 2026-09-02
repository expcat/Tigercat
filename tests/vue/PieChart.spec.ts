/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { h } from 'vue'
import { PieChart } from '@expcat/tigercat-vue/PieChart'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { renderWithProps, expectNoA11yViolations } from '../utils'
import { render } from '@testing-library/vue'

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

  it('uses the locale slice name when a datum has no label', () => {
    const { container } = renderWithProps(PieChart, {
      data: [{ value: 10 }, { value: 5 }],
      showLegend: true,
      ...defaultSize
    })
    expect(container.querySelector('[role="list"]')?.textContent).toContain('Slice 1')
  })

  it('renders a localized legend name', () => {
    const { container } = render({
      setup() {
        return () =>
          h(ConfigProvider, { locale: zhCN }, () =>
            h(PieChart, { data, showLegend: true, ...defaultSize })
          )
      }
    })
    expect(container.querySelector('[role="list"][aria-label="图表图例"]')).toBeTruthy()
  })

  describe('interaction', () => {
    it('triggers hover events when hoverable', () => {
      const onHoveredIndexChange = vi.fn()
      const { container } = renderWithProps(PieChart, {
        data,
        hoverable: true,
        'onUpdate:hoveredIndex': onHoveredIndexChange,
        ...defaultSize
      })
      container
        .querySelector('path[data-pie-slice]')
        ?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      expect(onHoveredIndexChange).toHaveBeenCalledWith(0)
    })

    it('emits slice-click as (index, datum) without selectable', () => {
      const { container, emitted } = renderWithProps(PieChart, { data, ...defaultSize })
      container
        .querySelectorAll('path[data-pie-slice]')[1]
        .dispatchEvent(new MouseEvent('click', { bubbles: true }))
      expect(emitted()['slice-click']?.[0]).toEqual([1, data[1]])
    })
  })
})
