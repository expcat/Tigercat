import { describe, it, expect } from 'vitest'
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
})
