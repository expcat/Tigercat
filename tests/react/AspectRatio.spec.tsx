/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { AspectRatio } from '@expcat/tigercat-react/AspectRatio'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-aspect-ratio]') as HTMLElement
}

function getContent(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-aspect-ratio-content]') as HTMLElement
}

describe('AspectRatio', () => {
  describe('Rendering', () => {
    it('renders children inside the filling content wrapper', () => {
      const { container, getByText } = render(
        <AspectRatio>
          <p>cover content</p>
        </AspectRatio>
      )
      expect(getContent(container).contains(getByText('cover content'))).toBe(true)
    })

    it('always renders the content wrapper, even without children', () => {
      const { container } = render(<AspectRatio />)
      expect(getContent(container)).not.toBeNull()
    })

    it('exposes root and content positioning classes', () => {
      const { container } = render(<AspectRatio />)
      expect(getRoot(container).className).toContain('relative')
      expect(getRoot(container).className).toContain('w-full')
      expect(getContent(container).className).toContain('absolute')
      expect(getContent(container).className).toContain('inset-0')
    })

    it('applies className to the root and contentClassName to the wrapper', () => {
      const { container } = render(
        <AspectRatio className="rounded-lg" contentClassName="p-2">
          <p>body</p>
        </AspectRatio>
      )
      expect(getRoot(container).className).toContain('rounded-lg')
      expect(getRoot(container).className).not.toContain('p-2')
      expect(getContent(container).className).toContain('p-2')
      expect(getContent(container).className).not.toContain('rounded-lg')
    })

    it('forwards extra props and the ref to the root element', () => {
      const rootRef = React.createRef<HTMLDivElement>()
      const { container } = render(
        <AspectRatio ref={rootRef} id="hero-frame" aria-label="主视觉">
          <p>body</p>
        </AspectRatio>
      )
      expect(rootRef.current).toBe(getRoot(container))
      expect(getRoot(container).id).toBe('hero-frame')
      expect(getRoot(container).getAttribute('aria-label')).toBe('主视觉')
    })
  })

  describe('ratio', () => {
    it('applies the default 16 / 9 ratio', () => {
      const { container } = render(<AspectRatio />)
      expect(getRoot(container).style.aspectRatio).toBe('16 / 9')
    })

    it('accepts fraction strings', () => {
      const { container } = render(<AspectRatio ratio="4/3" />)
      expect(getRoot(container).style.aspectRatio).toBe('4 / 3')
    })

    it('accepts numeric ratios', () => {
      const { container } = render(<AspectRatio ratio={1.5} />)
      // The CSSOM serializes a bare aspect-ratio number as '<value> / 1'
      expect(getRoot(container).style.aspectRatio).toBe('1.5 / 1')
    })

    it('falls back to the default ratio on invalid input', () => {
      const { container } = render(<AspectRatio ratio="broken" />)
      expect(getRoot(container).style.aspectRatio).toBe('16 / 9')
    })
  })

  describe('style integration', () => {
    it('merges the style prop with the ratio style', () => {
      const { container } = render(
        <AspectRatio style={{ border: '1px solid red' }}>
          <p>body</p>
        </AspectRatio>
      )
      const root = getRoot(container)
      expect(root.style.border).toBe('1px solid red')
      expect(root.style.aspectRatio).toBe('16 / 9')
    })

    it('lets an explicit style aspect-ratio override the prop', () => {
      const { container } = render(<AspectRatio style={{ aspectRatio: '1 / 1' }} />)
      expect(getRoot(container).style.aspectRatio).toBe('1 / 1')
    })
  })

  describe('a11y', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <AspectRatio>
          <p>可访问的封面文案</p>
        </AspectRatio>
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
