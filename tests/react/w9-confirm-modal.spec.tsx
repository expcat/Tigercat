/**
 * @vitest-environment happy-dom
 */
import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
