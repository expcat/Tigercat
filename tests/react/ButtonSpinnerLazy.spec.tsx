/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const { getSpinnerSVGMock } = vi.hoisted(() => ({
  getSpinnerSVGMock: vi.fn(() => ({
    viewBox: '0 0 24 24',
    elements: [
      {
        type: 'circle',
        attrs: {
          cx: '12',
          cy: '12',
          r: '10'
        }
      }
    ]
  }))
}))

vi.mock('@expcat/tigercat-core', async () => {
  const actual =
    await vi.importActual<typeof import('@expcat/tigercat-core')>('@expcat/tigercat-core')

  return {
    ...actual,
    getSpinnerSVG: getSpinnerSVGMock
  }
})

describe('React Button default spinner lazy creation', () => {
  beforeEach(() => {
    getSpinnerSVGMock.mockClear()
  })

  it('does not create the default spinner on module import or idle render', async () => {
    const { Button } = await import('../../packages/react/src/components/Button')

    expect(getSpinnerSVGMock).not.toHaveBeenCalled()

    render(<Button>Idle</Button>)

    expect(screen.getByRole('button', { name: 'Idle' })).toBeInTheDocument()
    expect(getSpinnerSVGMock).not.toHaveBeenCalled()
  })

  it('creates the default spinner only when loading without a custom loadingIcon', async () => {
    const { Button } = await import('../../packages/react/src/components/Button')

    render(<Button loading>Loading</Button>)

    expect(screen.getByRole('button', { name: 'Loading' })).toBeDisabled()
    expect(getSpinnerSVGMock).toHaveBeenCalledTimes(1)
    expect(getSpinnerSVGMock).toHaveBeenCalledWith('spinner')
  })

  it('does not create the default spinner when loadingIcon is provided', async () => {
    const { Button } = await import('../../packages/react/src/components/Button')

    render(
      <Button loading loadingIcon={<span data-testid="custom-loading-icon">Custom</span>}>
        Submit
      </Button>
    )

    expect(screen.getByTestId('custom-loading-icon')).toBeInTheDocument()
    expect(getSpinnerSVGMock).not.toHaveBeenCalled()
  })
})
