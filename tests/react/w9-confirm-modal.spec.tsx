/**
 * @vitest-environment happy-dom
 */
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { confirmModal } from '@expcat/tigercat-react/Modal'

describe('confirmModal', () => {
  it('renders on the config provider host and resolves from OK', async () => {
    render(
      <ConfigProvider>
        <div>host</div>
      </ConfigProvider>
    )
    const pending = confirmModal({ title: 'Delete', content: 'This item' })
    expect(await screen.findByRole('dialog', { name: 'Delete' })).toBeTruthy()
    expect(screen.getByText('This item')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    await expect(pending).resolves.toBeUndefined()
  })

  it('waits for onOk to resolve before closing and adopts its result', async () => {
    render(<ConfigProvider />)
    let resolveOk!: (value: string) => void
    const okResult = new Promise<string>((resolve) => {
      resolveOk = resolve
    })
    let pending!: Promise<unknown>
    await act(async () => {
      pending = confirmModal({ title: 'Delete', onOk: () => okResult })
    })
    const settled = vi.fn()
    void pending.then(settled, settled)

    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(screen.getByRole('dialog', { name: 'Delete' })).toBeInTheDocument()
    expect(settled).not.toHaveBeenCalled()

    await act(async () => resolveOk('deleted'))
    expect(screen.queryByRole('dialog', { name: 'Delete' })).not.toBeInTheDocument()
    await expect(pending).resolves.toBe('deleted')
  })

  it.each(['false', 'rejection', 'preventDefault'] as const)(
    'keeps the dialog and confirmation pending after onOk %s',
    async (outcome) => {
      render(<ConfigProvider />)
      let pending!: Promise<unknown>
      await act(async () => {
        pending = confirmModal({
          title: 'Delete',
          onOk: (event) => {
            if (outcome === 'preventDefault') event.preventDefault()
            if (outcome === 'rejection') return Promise.reject(new Error('retry'))
            return outcome === 'false' ? false : undefined
          }
        })
      })
      const settled = vi.fn()
      void pending.then(settled, settled)

      await userEvent.click(screen.getByRole('button', { name: 'OK' }))
      expect(screen.getByRole('dialog', { name: 'Delete' })).toBeInTheDocument()
      expect(settled).not.toHaveBeenCalled()

      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      await expect(pending).rejects.toThrow('cancel')
    }
  )
})
