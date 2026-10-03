/**
 * @vitest-environment happy-dom
 */
import React, { useState } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { ContextMenu, ContextMenuItem, ContextMenuMenu } from '@expcat/tigercat-react/ContextMenu'
import { Input } from '@expcat/tigercat-react/Input'
import { Modal } from '@expcat/tigercat-react/Modal'
import { NumberKeyboard } from '@expcat/tigercat-react/NumberKeyboard'
import { Spotlight } from '@expcat/tigercat-react/Spotlight'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { flushOverlayOutsideDismiss } from '../utils/frame-scheduler'
import { OverlayOutletProvider, OverlayPortal } from '../../packages/react/src/utils/overlay-outlet'

const confirmName = enUS.common!.okText!

describe('overlay dismiss inside ConfigProvider', () => {
  it('keeps committed layers mounted through StrictMode replay and reopening', async () => {
    function Demo() {
      const [open, setOpen] = useState(true)
      return (
        <OverlayOutletProvider>
          <button type="button" onClick={() => setOpen(true)}>
            Open commands
          </button>
          {open ? (
            <OverlayPortal>
              <div role="dialog" aria-label="Strict mode commands">
                <button type="button" onClick={() => setOpen(false)}>
                  Close commands
                </button>
              </div>
            </OverlayPortal>
          ) : null}
        </OverlayOutletProvider>
      )
    }
    const { unmount } = render(
      <React.StrictMode>
        <Demo />
      </React.StrictMode>
    )
    await screen.findByRole('dialog', { name: 'Strict mode commands' })
    fireEvent.click(screen.getByRole('button', { name: 'Close commands' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: 'Open commands' }))
    await screen.findByRole('dialog', { name: 'Strict mode commands' })
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    unmount()
    await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeNull())
  })

  it('hydrates a server-rendered open layer without replacing its DOM', async () => {
    const tree = (
      <OverlayOutletProvider>
        <OverlayPortal>
          <div role="dialog" aria-label="Server layer">
            Open content
          </div>
        </OverlayPortal>
      </OverlayOutletProvider>
    )
    const container = document.createElement('div')
    container.innerHTML = renderToString(tree)
    document.body.appendChild(container)
    const serverLayer = container.querySelector('[role="dialog"]')
    expect(serverLayer).toBeTruthy()
    const recoverable: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    try {
      await act(async () => {
        root = hydrateRoot(container, tree, {
          onRecoverableError: (error) => recoverable.push(error)
        })
      })
      expect(recoverable).toEqual([])
      expect(container.querySelector('[role="dialog"]')).toBe(serverLayer)
    } finally {
      await act(async () => root?.unmount())
      container.remove()
    }
  })

  it('keeps a number keyboard closed after confirm and scrim when focus opens it', async () => {
    function Demo() {
      const [value, setValue] = useState('4558')
      const [open, setOpen] = useState(false)
      return (
        <ConfigProvider>
          <Input
            value={value}
            onChange={(next) => setValue(String(next ?? ''))}
            onFocus={() => setOpen(true)}
          />
          <NumberKeyboard
            value={value}
            open={open}
            mode="amount"
            onChange={(next) => setValue(String(next ?? ''))}
            onOpenChange={setOpen}
            onConfirm={() => setOpen(false)}
          />
        </ConfigProvider>
      )
    }
    render(<Demo />)
    const input = document.querySelector('input') as HTMLInputElement
    input.focus()
    expect(await screen.findByRole('dialog')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: confirmName }))
    await flushOverlayOutsideDismiss()
    expect(screen.queryByRole('dialog')).toBeNull()

    input.focus()
    expect(await screen.findByRole('dialog')).toBeTruthy()
    const scrim = document.querySelector('.fixed.inset-0')
    expect(scrim).toBeTruthy()
    fireEvent.click(scrim!)
    await flushOverlayOutsideDismiss()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes a context menu on Escape and outside click', async () => {
    render(
      <ConfigProvider>
        <ContextMenu>
          <div>Surface</div>
          <ContextMenuMenu>
            <ContextMenuItem>Copy</ContextMenuItem>
          </ContextMenuMenu>
        </ContextMenu>
      </ConfigProvider>
    )
    const trigger = document.querySelector('[data-tiger-context-menu-trigger]') as HTMLElement
    fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20 })
    await flushOverlayOutsideDismiss()
    expect(document.querySelector('[data-tiger-context-menu]')).toBeTruthy()
    fireEvent.keyDown(document, { key: 'Escape' })
    await flushOverlayOutsideDismiss()
    expect(document.querySelector('[data-tiger-context-menu]')).toBeNull()

    fireEvent.contextMenu(trigger, { clientX: 24, clientY: 24 })
    await flushOverlayOutsideDismiss()
    const outside = document.createElement('button')
    outside.type = 'button'
    document.body.appendChild(outside)
    fireEvent.click(outside)
    outside.remove()
    await flushOverlayOutsideDismiss()
    expect(document.querySelector('[data-tiger-context-menu]')).toBeNull()
  })

  it('closes spotlight on Escape and the mask', async () => {
    function Demo() {
      const [open, setOpen] = useState(true)
      return (
        <ConfigProvider>
          <button type="button" onClick={() => setOpen(true)}>
            Reopen
          </button>
          <Spotlight open={open} items={[{ key: 'a', label: 'Alpha' }]} onOpenChange={setOpen} />
        </ConfigProvider>
      )
    }
    render(<Demo />)
    expect(document.querySelector('[role="dialog"]')).toBeTruthy()
    fireEvent.keyDown(document.querySelector('input')!, { key: 'Escape' })
    await flushOverlayOutsideDismiss()
    expect(document.querySelector('[role="dialog"]')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Reopen' }))
    await flushOverlayOutsideDismiss()
    const mask = document.querySelector('[data-tiger-spotlight-root] .absolute.inset-0')
    expect(mask).toBeTruthy()
    fireEvent.click(mask!)
    await flushOverlayOutsideDismiss()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('closes a nested modal without leaving the parent inert', async () => {
    function Demo() {
      const [outerOpen, setOuterOpen] = useState(true)
      const [innerOpen, setInnerOpen] = useState(false)
      return (
        <ConfigProvider>
          <Modal
            open={outerOpen}
            title="Outer"
            onOpenChange={setOuterOpen}
            footer={
              <button type="button" onClick={() => setOuterOpen(false)}>
                Close outer
              </button>
            }>
            <button type="button" onClick={() => setInnerOpen(true)}>
              Continue
            </button>
            <Modal open={innerOpen} title="Inner" showDefaultFooter onOpenChange={setInnerOpen}>
              Nested
            </Modal>
          </Modal>
        </ConfigProvider>
      )
    }
    render(<Demo />)
    expect(await screen.findByRole('dialog', { name: 'Outer' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    const inner = await screen.findByRole('dialog', { name: 'Inner' })
    const outer = screen.getByRole('dialog', { name: 'Outer' })
    expect(inner.closest('[inert]')).toBeNull()
    expect(inner.closest('[data-tiger-overlay-host]')?.id).toBe(outer.getAttribute('aria-owns'))
    fireEvent.click(screen.getByRole('button', { name: confirmName }))
    await flushOverlayOutsideDismiss()
    expect(screen.queryByRole('dialog', { name: 'Inner' })).toBeNull()
    const closeOuter = screen.getByRole('button', { name: 'Close outer' })
    expect(closeOuter.closest('[inert]')).toBeNull()
    fireEvent.click(closeOuter)
    await flushOverlayOutsideDismiss()
    expect(screen.queryByRole('dialog', { name: 'Outer' })).toBeNull()
  })
})
