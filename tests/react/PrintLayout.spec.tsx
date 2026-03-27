/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { PrintLayout, PrintPageBreak } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

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
    expect(el.className).toContain('max-w-[210mm]')
  })

  it('applies landscape orientation dimensions', () => {
    const { container } = render(
      <PrintLayout pageSize="A4" orientation="landscape">
        content
      </PrintLayout>
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('max-w-[297mm]')
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

  describe('a11y', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <PrintLayout>
          <p>Content</p>
        </PrintLayout>
      )
      await expectNoA11yViolations(container)
    })
  })
})
