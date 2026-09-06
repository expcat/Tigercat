/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Drag } from '@expcat/tigercat-react/Drag'
import type { DragItem } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const items: DragItem[] = [
  { id: 'a', index: 0 },
  { id: 'b', index: 1 }
]

describe('Drag (React)', () => {
  it('renders items with the same drag bindings as useDrag', () => {
    render(
      <Drag
        items={items}
        renderItem={(item, { dragItemProps }) => (
          <li {...dragItemProps} role="listitem">
            {String(item.id)}
          </li>
        )}
      />
    )
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(screen.getByText('a')).toHaveAttribute('draggable', 'true')
  })

  it('has no obvious a11y violations', async () => {
    const { container } = render(<Drag items={items} />)
    await expectNoA11yViolationsIsolated(container)
  })
})
