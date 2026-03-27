/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { PrintLayout, PrintPageBreak } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'

describe('PrintLayout', () => {
  it('renders content area', () => {
    render(PrintLayout, {
      slots: { default: '<p>Page content</p>' }
    })
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('applies print layout base classes', () => {
    const { container } = render(PrintLayout, {
      slots: { default: 'content' }
    })
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('tiger-print-layout')
  })

  it('renders header when showHeader + headerText', () => {
    render(PrintLayout, {
      props: { showHeader: true, headerText: 'Page Header' },
      slots: { default: 'content' }
    })
    expect(screen.getByText('Page Header')).toBeInTheDocument()
  })

  it('renders footer when showFooter + footerText', () => {
    render(PrintLayout, {
      props: { showFooter: true, footerText: 'Page Footer' },
      slots: { default: 'content' }
    })
    expect(screen.getByText('Page Footer')).toBeInTheDocument()
  })

  it('renders header slot over headerText', () => {
    render(PrintLayout, {
      props: { showHeader: true, headerText: 'text' },
      slots: {
        default: 'content',
        header: '<span>Slot Header</span>'
      }
    })
    expect(screen.getByText('Slot Header')).toBeInTheDocument()
    expect(screen.queryByText('text')).not.toBeInTheDocument()
  })

  it('renders footer slot over footerText', () => {
    render(PrintLayout, {
      props: { showFooter: true, footerText: 'text' },
      slots: {
        default: 'content',
        footer: '<span>Slot Footer</span>'
      }
    })
    expect(screen.getByText('Slot Footer')).toBeInTheDocument()
    expect(screen.queryByText('text')).not.toBeInTheDocument()
  })

  it('does not render header when showHeader is false', () => {
    render(PrintLayout, {
      props: { showHeader: false, headerText: 'Hidden Header' },
      slots: { default: 'content' }
    })
    expect(screen.queryByText('Hidden Header')).not.toBeInTheDocument()
  })

  it('does not render footer when showFooter is false', () => {
    render(PrintLayout, {
      props: { showFooter: false, footerText: 'Hidden Footer' },
      slots: { default: 'content' }
    })
    expect(screen.queryByText('Hidden Footer')).not.toBeInTheDocument()
  })

  it('applies page size class', () => {
    const { container } = render(PrintLayout, {
      props: { pageSize: 'A4' },
      slots: { default: 'content' }
    })
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('max-w-[210mm]')
  })

  it('applies landscape orientation dimensions', () => {
    const { container } = render(PrintLayout, {
      props: { pageSize: 'A4', orientation: 'landscape' },
      slots: { default: 'content' }
    })
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('max-w-[297mm]')
  })

  it('merges custom className', () => {
    const { container } = render(PrintLayout, {
      props: { className: 'custom-print' },
      slots: { default: 'content' }
    })
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('custom-print')
  })

  it('passes through HTML attributes', () => {
    render(PrintLayout, {
      attrs: { 'data-testid': 'print-el', id: 'my-print' },
      slots: { default: 'content' }
    })
    expect(screen.getByTestId('print-el')).toBeInTheDocument()
    expect(screen.getByTestId('print-el').id).toBe('my-print')
  })

  it('wraps content in tiger-print-content div', () => {
    const { container } = render(PrintLayout, {
      slots: { default: '<span>inner</span>' }
    })
    const contentDiv = container.querySelector('.tiger-print-content')
    expect(contentDiv).toBeInTheDocument()
    expect(contentDiv!.textContent).toBe('inner')
  })
})

describe('PrintPageBreak', () => {
  it('renders a div with page break class', () => {
    const { container } = render(PrintPageBreak)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('print:break-before-page')
  })

  it('has aria-hidden true', () => {
    const { container } = render(PrintPageBreak)
    const el = container.firstElementChild as HTMLElement
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders as div element', () => {
    const { container } = render(PrintPageBreak)
    expect(container.firstElementChild!.tagName).toBe('DIV')
  })

  describe('a11y', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(PrintLayout, {
        slots: { default: '<p>Content</p>' }
      })
      await expectNoA11yViolations(container)
    })
  })
})
