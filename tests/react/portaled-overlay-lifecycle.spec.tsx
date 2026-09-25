/**
 * @vitest-environment happy-dom
 */

import { useState } from 'react'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderOverlayPortal } from '../../packages/react/src/utils/overlay'

describe('React portaled overlay teardown', () => {
  it('removes a portaled layer when the host unmounts', () => {
    function Host() {
      const [open, setOpen] = useState(true)
      return (
        <div>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
          {open ? renderOverlayPortal(<div data-panel="">menu</div>, document.body) : null}
        </div>
      )
    }

    const view = render(<Host />)
    expect(document.querySelector('[data-panel]')).not.toBeNull()
    fireEvent.click(view.getByText('Close'))
    expect(document.querySelector('[data-panel]')).toBeNull()
    view.unmount()
  })

  it('drops a portaled layer when the owner window fires pagehide', () => {
    const view = render(
      <div>{renderOverlayPortal(<div data-panel="">menu</div>, document.body)}</div>
    )
    const layer = document.querySelector('[data-panel]')?.closest('[data-tiger-overlay-layer]')
    expect(layer).not.toBeNull()
    window.dispatchEvent(new Event('pagehide'))
    expect(document.querySelector('[data-panel]')).toBeNull()
    if (layer) document.body.appendChild(layer)
    view.unmount()
  })
})
