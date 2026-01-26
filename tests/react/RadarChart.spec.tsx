import { describe, it, expect } from 'vitest'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { RadarChart } from '@expcat/tigercat-react'
import { renderWithProps, expectNoA11yViolations } from '../utils/render-helpers-react'

describe('RadarChart', () => {
  it('renders radar area and points', () => {
    const { container } = renderWithProps(RadarChart, {
      data: [
        { label: 'A', value: 80 },
        { label: 'B', value: 65 },
        { label: 'C', value: 90 }
      ]
    })

    expect(container.querySelectorAll('path[data-radar-area]')).toHaveLength(1)
    expect(container.querySelectorAll('circle[data-radar-point]')).toHaveLength(3)
  })

  it('passes basic a11y checks', async () => {
    const { container } = renderWithProps(RadarChart, {
      data: [
        { label: 'A', value: 80 },
        { label: 'B', value: 65 },
        { label: 'C', value: 90 }
      ]
    })

    await expectNoA11yViolations(container)
  })

  it('renders multiple series', () => {
    const { container } = renderWithProps(RadarChart, {
      series: [
        {
          name: 'Series A',
          data: [
            { label: 'A', value: 80 },
            { label: 'B', value: 65 },
            { label: 'C', value: 90 }
          ]
        },
        {
          name: 'Series B',
          data: [
            { label: 'A', value: 70 },
            { label: 'B', value: 75 },
            { label: 'C', value: 60 }
          ]
        }
      ]
    })

    expect(container.querySelectorAll('path[data-radar-area]')).toHaveLength(2)
  })

  it('renders level labels', () => {
    const { container } = renderWithProps(RadarChart, {
      data: [
        { label: 'A', value: 80 },
        { label: 'B', value: 65 },
        { label: 'C', value: 90 }
      ],
      levels: 3,
      showLevelLabels: true
    })

    expect(container.querySelectorAll('text[data-radar-level-label]')).toHaveLength(3)
  })

  it('applies hover highlight opacity', () => {
    const { container } = renderWithProps(RadarChart, {
      series: [
        {
          name: 'Series A',
          data: [
            { label: 'A', value: 80 },
            { label: 'B', value: 65 },
            { label: 'C', value: 90 }
          ]
        },
        {
          name: 'Series B',
          data: [
            { label: 'A', value: 70 },
            { label: 'B', value: 75 },
            { label: 'C', value: 60 }
          ]
        }
      ],
      activeSeriesIndex: 1,
      hoverOpacity: 1,
      mutedOpacity: 0.2
    })

    const seriesA = container.querySelector('g[data-series-name="Series A"]')
    const seriesB = container.querySelector('g[data-series-name="Series B"]')
    expect(seriesA).toHaveAttribute('opacity', '0.2')
    expect(seriesB).toHaveAttribute('opacity', '1')
  })

  it('renders tooltip titles on points', () => {
    const { container } = renderWithProps(RadarChart, {
      data: [
        { label: 'A', value: 80 },
        { label: 'B', value: 65 },
        { label: 'C', value: 90 }
      ]
    })

    expect(container.querySelectorAll('circle[data-radar-point] title')).toHaveLength(3)
  })

  it('can disable tooltip titles', () => {
    const { container } = renderWithProps(RadarChart, {
      data: [
        { label: 'A', value: 80 },
        { label: 'B', value: 65 }
      ],
      showTooltip: false
    })

    expect(container.querySelectorAll('circle[data-radar-point] title')).toHaveLength(0)
  })

  it('selects series on click when selectable', async () => {
    const user = userEvent.setup()
    const { container } = renderWithProps(RadarChart, {
      series: [
        {
          name: 'Series A',
          data: [
            { label: 'A', value: 80 },
            { label: 'B', value: 65 },
            { label: 'C', value: 90 }
          ]
        },
        {
          name: 'Series B',
          data: [
            { label: 'A', value: 70 },
            { label: 'B', value: 75 },
            { label: 'C', value: 60 }
          ]
        }
      ],
      selectable: true,
      mutedOpacity: 0.2
    })

    const seriesA = container.querySelector('g[data-series-name="Series A"]') as SVGGElement
    const seriesB = container.querySelector('g[data-series-name="Series B"]') as SVGGElement

    await user.click(seriesA)
    expect(seriesA).toHaveAttribute('opacity', '1')
    expect(seriesB).toHaveAttribute('opacity', '0.2')
  })

  it('renders legend when enabled', () => {
    const { container } = renderWithProps(RadarChart, {
      series: [
        { name: 'Series A', data: [{ label: 'A', value: 80 }] },
        { name: 'Series B', data: [{ label: 'A', value: 70 }] }
      ],
      showLegend: true
    })

    expect(container.querySelectorAll('button')).toHaveLength(2)
  })
})
