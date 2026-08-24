/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { cleanup as cleanupVue } from '@testing-library/vue'
import { cleanup as cleanupReact } from '@testing-library/react'
import { render as renderVue, waitFor } from '@testing-library/vue'
import { render as renderReact, fireEvent as fireEventReact } from '@testing-library/react'
import { createElement } from 'react'
import { Modal } from '@expcat/tigercat-vue/Modal'
import { Image as ReactImage } from '@expcat/tigercat-react/Image'
import { resetTestDocument } from '../utils/dom-cleanup'

function emptyAnonymousBodyHosts(): HTMLDivElement[] {
  return Array.from(document.body.querySelectorAll(':scope > div')).filter(
    (el) => el.attributes.length === 0 && el.childNodes.length === 0
  )
}

describe('resetTestDocument', () => {
  it('strips leftover empty hosts, html theme attrs, and body overflow', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    document.body.style.overflow = 'hidden'
    document.documentElement.className = 'dark'
    document.documentElement.setAttribute('data-tiger-style', 'modern')
    document.documentElement.style.setProperty('--tiger-primary', '#10b981')

    resetTestDocument()

    expect(document.body.childElementCount).toBe(0)
    expect(emptyAnonymousBodyHosts()).toEqual([])
    expect(document.body.style.overflow).toBe('')
    expect(document.body.getAttribute('class')).toBeNull()
    expect(document.documentElement.className).toBe('')
    expect(document.documentElement.getAttribute('data-tiger-style')).toBeNull()
    expect(document.documentElement.getAttribute('style')).toBeNull()
  })

  it('removes Vue Teleport root hosts that Testing Library cleanup leaves behind', async () => {
    renderVue(Modal, { props: { open: true, title: 'Leak probe' } })
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).toBeTruthy()
    })

    cleanupVue()

    resetTestDocument()

    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(emptyAnonymousBodyHosts()).toEqual([])
    expect(document.body.childElementCount).toBe(0)
    expect(document.body.style.overflow).toBe('')
  })

  it('removes React portal preview leftovers after Testing Library cleanup', () => {
    const { container } = renderReact(
      createElement(ReactImage, { src: '/leak-probe.jpg', alt: 'Leak probe' })
    )

    fireEventReact.click(container.firstElementChild as Element)
    expect(document.querySelector('[aria-label="Close preview"]')).toBeTruthy()

    cleanupReact()
    resetTestDocument()

    expect(document.querySelector('[aria-label="Close preview"]')).toBeNull()
    expect(emptyAnonymousBodyHosts()).toEqual([])
    expect(document.body.childElementCount).toBe(0)
  })
})
