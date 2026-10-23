/**
 * @vitest-environment happy-dom
 *
 * Anchored overlays render inline on the first commit and move into the
 * resolved portal target on the next one. The focus scope must follow the
 * swapped container node instead of staying bound to the unmounted inline
 * node (which used to leave stale inert behind and an unmarked panel).
 */

import { useLayoutEffect, useRef, useState } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderOverlayPortal, useFocusTrap } from '../../packages/react/src/utils/overlay'

function Probe({ open }: { open: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [target, setTarget] = useState<HTMLElement | null>(null)
  useFocusTrap({ enabled: open, containerRef, inert: true, autoFocus: true })
  useLayoutEffect(() => {
    setTarget((current) => current ?? document.getElementById('probe-target'))
  }, [open])
  if (!open) return null
  return renderOverlayPortal(
    <div ref={containerRef} data-testid="panel" tabIndex={-1}>
      <button type="button">inside</button>
    </div>,
    target
  )
}

describe('useFocusTrap container rebind', () => {
  it('re-binds the scope when the portal target swaps the container node', () => {
    const launcher = document.createElement('button')
    launcher.textContent = 'launch'
    const root = document.createElement('div')
    const target = document.createElement('div')
    target.id = 'probe-target'
    document.body.append(launcher, root, target)
    launcher.focus()

    const view = render(<Probe open />, { container: root })
    const panel = screen.getByTestId('panel')

    expect(target.contains(panel)).toBe(true)
    expect(panel).toHaveAttribute('data-tiger-modal')
    expect(target).not.toHaveAttribute('inert')
    expect(panel.contains(document.activeElement)).toBe(true)

    const inside = screen.getByText('inside')
    inside.focus()
    view.rerender(<Probe open />)
    expect(document.activeElement).toBe(inside)

    view.rerender(<Probe open={false} />)
    expect(document.body.querySelector('[inert]')).toBeNull()
    expect(document.activeElement).toBe(launcher)

    const iframe = document.createElement('iframe')
    document.body.appendChild(iframe)
    const iframeDocument = iframe.contentDocument!
    const iframeLauncher = iframeDocument.createElement('button')
    iframeDocument.body.append(iframeLauncher, target)
    iframeLauncher.focus()
    view.rerender(<Probe open />)
    expect(
      target.querySelector('[data-testid="panel"]')?.contains(iframeDocument.activeElement)
    ).toBe(true)
    view.rerender(<Probe open={false} />)
    expect(iframeDocument.activeElement).toBe(iframeLauncher)

    view.unmount()
    iframe.remove()
    launcher.remove()
    root.remove()
    target.remove()
  })
})
