/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { createRef, useState } from 'react'
import { Tag } from '@expcat/tigercat-react/Tag'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { resetDevWarnCache } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'

describe('Tag', () => {
  it('renders content without a live region', () => {
    const { container } = render(<Tag>Test Tag</Tag>)

    expect(screen.getByText('Test Tag')).toBeInTheDocument()
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
  })

  it('lets a user role override the root', () => {
    render(<Tag role="listitem">Item</Tag>)
    expect(screen.getByRole('listitem')).toBeInTheDocument()
    expect(screen.getByText('Item')).toBeInTheDocument()
  })

  it('forwards ref to the root span', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Tag ref={ref}>Ref</Tag>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(ref.current?.textContent).toContain('Ref')
  })

  it('merges className onto root element', () => {
    const { container } = render(<Tag className="custom-class">Tag</Tag>)
    expect(container.firstElementChild).toHaveClass('custom-class')
  })

  it('warns when color is passed instead of variant', () => {
    resetDevWarnCache()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    render(<Tag color="green">Color prop</Tag>)

    expect(screen.getByText('Color prop')).toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith('[Tigercat] Tag does not support color. Use variant instead.')
    warn.mockRestore()
  })

  it('does not render close button when closable=false', () => {
    const { container } = render(<Tag closable={false}>Tag</Tag>)
    expect(container.querySelector('button')).not.toBeInTheDocument()
  })

  it('calls onClose and stays visible unless the parent unmounts it', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Tag closable onClose={onClose}>
        Closable Tag
      </Tag>
    )

    await user.click(screen.getByRole('button', { name: 'Close tag' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Closable Tag')).toBeInTheDocument()
  })

  it('hides when the parent unmounts a list item after close', async () => {
    const user = userEvent.setup()

    function List() {
      const [items, setItems] = useState(['Alpha', 'Beta'])
      return (
        <>
          {items.map((item) => (
            <Tag
              key={item}
              closable
              onClose={() => setItems((cur) => cur.filter((x) => x !== item))}>
              {item}
            </Tag>
          ))}
        </>
      )
    }

    render(<List />)
    await user.click(screen.getAllByRole('button', { name: 'Close tag' })[0])
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('stops propagation when close button is clicked', async () => {
    const user = userEvent.setup()
    const onWrapperClick = vi.fn()

    render(
      <span onClick={onWrapperClick}>
        <Tag closable>Closable Tag</Tag>
      </span>
    )

    await user.click(screen.getByRole('button', { name: 'Close tag' }))
    expect(onWrapperClick).not.toHaveBeenCalled()
  })

  it('uses official locale objects for the close name', () => {
    const { rerender } = render(
      <ConfigProvider locale={zhCN}>
        <Tag closable>标签</Tag>
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: '关闭标签' })).toBeInTheDocument()

    rerender(
      <ConfigProvider locale={zhTW}>
        <Tag closable>標籤</Tag>
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: '關閉標籤' })).toBeInTheDocument()
  })

  it('renders custom closeAriaLabel on close button', () => {
    render(
      <Tag closable closeAriaLabel="Remove">
        Tag
      </Tag>
    )

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('applies a pill shape when requested', () => {
    const { container } = render(<Tag pill>Pill</Tag>)
    expect(container.firstElementChild?.className).toContain('--tiger-radius-pill')
  })
})
