import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { Drawer } from '@expcat/tigercat-react/Drawer'
import { Loading } from '@expcat/tigercat-react/Loading'

// Keep passive work pending; render/act otherwise flushes it before assertions.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useEffect: () => undefined
}))

describe('feedback before passive effects', () => {
  it('covers an open Drawer before the first paint', () => {
    const onOpenChange = vi.fn()
    render(<Drawer open title="First frame" onOpenChange={onOpenChange} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    const mask = document.querySelector('[data-tiger-drawer-mask]')
    expect(mask).toBeInTheDocument()
    fireEvent.click(mask!)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('covers and inerts a Loading region before the first paint', () => {
    render(
      <Loading spinning delay={0}>
        <button type="button">Content</button>
      </Loading>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Content').closest('[inert]')).toBeInTheDocument()
  })
})
