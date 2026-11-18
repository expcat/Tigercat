/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { PrintLayout, PrintPageBreak } from '@expcat/tigercat-react/PrintLayout'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('PrintLayout', () => {
  it('renders children content', () => {
    render(
      <PrintLayout>
        <p>Page content</p>
      </PrintLayout>
    )
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('applies print layout base classes', () => {
    const { container } = render(<PrintLayout>content</PrintLayout>)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('tiger-print-layout')
  })

  it('renders header when showHeader + headerText', () => {
    render(
      <PrintLayout showHeader headerText="Page Header">
        content
      </PrintLayout>
    )
    expect(screen.getByText('Page Header')).toBeInTheDocument()
  })

  it('renders footer when showFooter + footerText', () => {
    render(
      <PrintLayout showFooter footerText="Page Footer">
        content
      </PrintLayout>
    )
    expect(screen.getByText('Page Footer')).toBeInTheDocument()
  })

  it('renders headerRender over headerText', () => {
    render(
      <PrintLayout showHeader headerText="text" headerRender={<span>Render Header</span>}>
        content
      </PrintLayout>
    )
    expect(screen.getByText('Render Header')).toBeInTheDocument()
    expect(screen.queryByText('text')).not.toBeInTheDocument()
  })

  it('renders footerRender over footerText', () => {
    render(
      <PrintLayout showFooter footerText="text" footerRender={<span>Render Footer</span>}>
        content
      </PrintLayout>
    )
    expect(screen.getByText('Render Footer')).toBeInTheDocument()
    expect(screen.queryByText('text')).not.toBeInTheDocument()
  })

  it('omits false headers and footers, falls back to text, and preserves zero', () => {
    const { container, rerender } = render(
      <PrintLayout showHeader showFooter headerRender={false} footerRender={false}>
        content
      </PrintLayout>
    )
    expect(container.querySelector('thead')).not.toBeInTheDocument()
    expect(container.querySelector('tfoot')).not.toBeInTheDocument()

    rerender(
      <PrintLayout
        showHeader
        showFooter
        headerRender={false}
        footerRender={false}
        headerText="Fallback header"
        footerText="Fallback footer">
        content
      </PrintLayout>
    )
    expect(container.querySelector('thead')).toHaveTextContent('Fallback header')
    expect(container.querySelector('tfoot')).toHaveTextContent('Fallback footer')

    rerender(
      <PrintLayout showHeader showFooter headerRender={0} footerRender={0}>
        content
      </PrintLayout>
    )
    expect(container.querySelector('thead')).toHaveTextContent('0')
    expect(container.querySelector('tfoot')).toHaveTextContent('0')
  })

  it('does not render header when showHeader is false', () => {
    render(
      <PrintLayout showHeader={false} headerText="Hidden">
        content
      </PrintLayout>
    )
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('does not render footer when showFooter is false', () => {
    render(
      <PrintLayout showFooter={false} footerText="Hidden">
        content
      </PrintLayout>
    )
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('applies page size class', () => {
    const { container } = render(<PrintLayout pageSize="A4">content</PrintLayout>)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.width).toBe('210mm')
    expect(el.style.minHeight).toBe('297mm')
    expect(el.getAttribute('data-tiger-print')).toContain('A4')
  })

  it('applies landscape orientation dimensions', () => {
    const { container } = render(
      <PrintLayout pageSize="A4" orientation="landscape">
        content
      </PrintLayout>
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.style.width).toBe('297mm')
    expect(el.style.minHeight).toBe('210mm')
  })

  it('merges custom className', () => {
    const { container } = render(<PrintLayout className="custom-print">content</PrintLayout>)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('custom-print')
  })

  it('passes through HTML attributes', () => {
    render(
      <PrintLayout data-testid="print-el" id="my-print">
        content
      </PrintLayout>
    )
    expect(screen.getByTestId('print-el')).toBeInTheDocument()
    expect(screen.getByTestId('print-el').id).toBe('my-print')
  })

  it('wraps content in tiger-print-content div', () => {
    const { container } = render(
      <PrintLayout>
        <span>inner</span>
      </PrintLayout>
    )
    const contentDiv = container.querySelector('.tiger-print-content')
    expect(contentDiv).toBeInTheDocument()
    expect(contentDiv!.textContent).toBe('inner')
  })

  it('does not leak showPageBreaks prop onto the DOM', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { container } = render(
      <PrintLayout data-testid="print-el" showPageBreaks={false}>
        content
      </PrintLayout>
    )
    const el = container.querySelector('.tiger-print-layout') as HTMLElement
    expect(el.hasAttribute('showpagebreaks')).toBe(false)
    const leaked = errorSpy.mock.calls.some((args) =>
      args.some((arg) => String(arg).includes('does not recognize'))
    )
    expect(leaked).toBe(false)
    errorSpy.mockRestore()
  })

  it('keeps header, footer, and page-break label on paper ink', () => {
    const { container } = render(
      <PrintLayout showHeader showFooter headerText="Head" footerText="Foot">
        <PrintPageBreak />
      </PrintLayout>
    )
    const nodes = [
      container.querySelector('th'),
      container.querySelector('tfoot td'),
      container.querySelector('span')
    ]
    for (const node of nodes) {
      expect(node?.className ?? '').toContain('text-[#111827]')
      expect(node?.className ?? '').not.toContain('tiger-text-secondary')
    }
  })

  it('previews at least two landscape pages and hides that preview from print', () => {
    const { container } = render(
      <PrintLayout orientation="landscape" bind={{ contentHeightMm: 250 }}>
        content
      </PrintLayout>
    )
    const preview = container.querySelector('[data-tiger-print-preview]')
    expect(preview?.className ?? '').toContain('print:hidden')
    expect(preview?.querySelectorAll('[data-page-number]').length ?? 0).toBeGreaterThanOrEqual(2)
  })

  it('previews three pages for a 1000px page height and 500mm of content', () => {
    const { container } = render(
      <PrintLayout pageWidth="210mm" pageHeight="1000px" bind={{ contentHeightMm: 500 }}>
        content
      </PrintLayout>
    )
    expect(
      container.querySelectorAll('[data-tiger-print-preview] [data-page-number]')
    ).toHaveLength(3)
  })
})

describe('PrintPageBreak', () => {
  it('renders a div with page break class', () => {
    const { container } = render(<PrintPageBreak />)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('print:break-before-page')
  })

  it('has aria-hidden true', () => {
    const { container } = render(<PrintPageBreak />)
    const el = container.firstElementChild as HTMLElement
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders as div element', () => {
    const { container } = render(<PrintPageBreak />)
    expect(container.firstElementChild!.tagName).toBe('DIV')
  })

  it('shows the on-screen dashed indicator by default inside a PrintLayout', () => {
    const { container } = render(
      <PrintLayout>
        <PrintPageBreak />
      </PrintLayout>
    )
    const el = container.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(el.className).toContain('print:break-before-page')
    expect(el.textContent?.trim().length).toBeGreaterThan(0)
  })

  it('hides the on-screen indicator but keeps the print break when showPageBreaks is false', () => {
    const { container } = render(
      <PrintLayout showPageBreaks={false}>
        <PrintPageBreak />
      </PrintLayout>
    )
    const el = container.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(el.className).toContain('print:break-before-page')
    expect(el.textContent?.trim()).toBe('')
  })

  describe('a11y', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <PrintLayout>
          <p>Content</p>
        </PrintLayout>
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
