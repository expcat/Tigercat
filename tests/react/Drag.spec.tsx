/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Drag } from '@expcat/tigercat-react/Drag'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import type { DragItem } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const items: DragItem[] = [
  { id: 'a', index: 0 },
  { id: 'b', index: 1 }
]

describe('Drag (React)', () => {
  it('reorders default items using only the keyboard', () => {
    function Host() {
      const [value, setValue] = React.useState(items)
      return <Drag items={value} onItemsChange={setValue} />
    }
    render(<Host />)
    const first = screen.getAllByRole('listitem')[0]
    expect.soft(first).toHaveAttribute('tabindex', '0')
    first.focus()
    expect.soft(first).toHaveFocus()
    fireEvent.keyDown(first, { key: ' ' })
    fireEvent.keyDown(first, { key: 'ArrowDown' })
    fireEvent.keyDown(first, { key: 'Enter' })

    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(['b', 'a'])
  })

  it.each([false, true])(
    'announces the hovered position in zh-CN (cross-container: %s)',
    (cross) => {
      function Host() {
        const [source, setSource] = React.useState<DragItem[]>(
          cross ? [items[0]] : [...items, { id: 0, index: 2 }]
        )
        const [target, setTarget] = React.useState<DragItem[]>([
          { id: 'b', index: 0 },
          { id: 0, index: 1 }
        ])
        return (
          <ConfigProvider locale={zhCN}>
            <Drag
              items={source}
              onItemsChange={setSource}
              containerId="source"
              config={{ crossContainer: cross }}
            />
            {cross ? (
              <Drag
                items={target}
                onItemsChange={setTarget}
                containerId="target"
                config={{ crossContainer: true }}
              />
            ) : null}
          </ConfigProvider>
        )
      }
      const { container } = render(<Host />)
      fireEvent.dragStart(screen.getByText('a'))
      fireEvent.dragOver(screen.getByText('0'))

      expect(container.querySelector('[data-tiger-drag-live]')).toHaveTextContent(
        `从第 1 项到第 ${cross ? 2 : 3} 项`
      )
      fireEvent.drop(screen.getByText('0'))
      expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(
        cross ? ['b', 'a', '0'] : ['b', '0', 'a']
      )
    }
  )

  it('forwards native attributes, style and clicks to the root', () => {
    const onClick = vi.fn()
    render(
      <Drag
        items={items}
        id="drag-root"
        data-probe="root"
        aria-label="Drag list"
        style={{ margin: 13 }}
        onClick={onClick}
      />
    )
    const root = screen.getByRole('list')
    expect.soft(root).toHaveAttribute('id', 'drag-root')
    expect.soft(root).toHaveAttribute('data-probe', 'root')
    expect.soft(root).toHaveAttribute('aria-label', 'Drag list')
    expect.soft(root).toHaveStyle({ margin: '13px' })
    fireEvent.click(root)
    expect(onClick).toHaveBeenCalledOnce()
  })

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
