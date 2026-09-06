/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Drag } from '@expcat/tigercat-vue/Drag'
import type { DragItem } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

const items: DragItem[] = [
  { id: 'a', index: 0 },
  { id: 'b', index: 1 }
]

describe('Drag (Vue)', () => {
  it('renders items with the same drag bindings as useDrag', () => {
    render(Drag, { props: { items } })
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(screen.getByText('a')).toHaveAttribute('draggable', 'true')
  })

  it('has no obvious a11y violations', async () => {
    const { container } = render(Drag, { props: { items } })
    await expectNoA11yViolationsIsolated(container)
  })
})
