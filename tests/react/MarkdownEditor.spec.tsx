/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { MarkdownEditor } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function renderEditor(props: Record<string, unknown> = {}) {
  return render(<MarkdownEditor value="# Hello" {...props} />)
}

describe('MarkdownEditor', () => {
  describe('Rendering', () => {
    it('renders textarea and preview by default', () => {
      const { container } = renderEditor()
      expect(container.querySelector('textarea')).toBeTruthy()
      expect(container.querySelector('[aria-label="Markdown preview"]')).toBeTruthy()
    })

    it('renders toolbar buttons', () => {
      const { container } = renderEditor()
      expect(
        container.querySelectorAll('[aria-label="Markdown formatting"] button').length
      ).toBeGreaterThan(0)
    })

    it('renders custom toolbar', () => {
      const { container } = renderEditor({ toolbar: [{ name: 'bold', label: 'Bold' }] })
      expect(container.querySelectorAll('[aria-label="Markdown formatting"] button')).toHaveLength(
        1
      )
    })

    it('hides formatting toolbar when toolbar is false', () => {
      const { container } = renderEditor({ toolbar: false })
      expect(container.querySelector('[aria-label="Markdown formatting"]')).toBeNull()
    })
  })

  describe('Modes', () => {
    it('sets data-mode attribute', () => {
      const { container } = renderEditor({ mode: 'preview' })
      expect(container.firstElementChild?.getAttribute('data-mode')).toBe('preview')
    })

    it('renders only preview in preview mode', () => {
      const { container } = renderEditor({ mode: 'preview' })
      expect(container.querySelector('textarea')).toBeNull()
      expect(container.querySelector('[aria-label="Markdown preview"]')).toBeTruthy()
    })

    it('renders only textarea in edit mode', () => {
      const { container } = renderEditor({ mode: 'edit' })
      expect(container.querySelector('textarea')).toBeTruthy()
      expect(container.querySelector('[aria-label="Markdown preview"]')).toBeNull()
    })

    it('calls onModeChange when mode button is clicked', () => {
      const onModeChange = vi.fn()
      const { getByRole } = renderEditor({ defaultMode: 'edit', onModeChange })
      fireEvent.click(getByRole('button', { name: 'Preview' }))
      expect(onModeChange).toHaveBeenCalledWith('preview')
    })
  })

  describe('Preview', () => {
    it('renders markdown as html', () => {
      const { container } = renderEditor({ value: '## Title\n\n**Bold**' })
      const preview = container.querySelector('[aria-label="Markdown preview"]') as HTMLElement
      expect(preview.innerHTML).toContain('<h2>Title</h2>')
      expect(preview.innerHTML).toContain('<strong>Bold</strong>')
    })

    it('uses custom renderer', () => {
      const { container } = renderEditor({ renderer: { render: () => '<p>custom</p>' } })
      expect(container.querySelector('[aria-label="Markdown preview"]')?.innerHTML).toContain(
        'custom'
      )
    })

    it('shows placeholder in empty preview', () => {
      const { container } = renderEditor({ value: '', placeholder: 'Write markdown...' })
      expect(container.querySelector('[aria-label="Markdown preview"]')?.textContent).toBe(
        'Write markdown...'
      )
    })
  })

  describe('Events', () => {
    it('calls onChange on textarea input', () => {
      const onChange = vi.fn()
      const { container } = renderEditor({ value: undefined, defaultValue: 'hello', onChange })
      const textarea = container.querySelector('textarea')!
      fireEvent.change(textarea, { target: { value: 'hello world' } })
      expect(onChange).toHaveBeenCalledWith('hello world')
    })

    it('applies toolbar action to selection', () => {
      const onChange = vi.fn()
      const { container, getByRole } = renderEditor({
        value: undefined,
        defaultValue: 'hello',
        onChange
      })
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement
      textarea.selectionStart = 0
      textarea.selectionEnd = 5
      fireEvent.click(getByRole('button', { name: 'Bold (Ctrl+B)' }))
      expect(onChange).toHaveBeenCalledWith('**hello**')
    })

    it('handles keyboard shortcuts', () => {
      const onChange = vi.fn()
      const { container } = renderEditor({ value: undefined, defaultValue: 'hello', onChange })
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement
      textarea.selectionStart = 0
      textarea.selectionEnd = 5
      fireEvent.keyDown(textarea, { key: 'b', ctrlKey: true })
      expect(onChange).toHaveBeenCalledWith('**hello**')
    })

    it('inserts spaces for tab', () => {
      const onChange = vi.fn()
      const { container } = renderEditor({ value: undefined, defaultValue: 'a', onChange })
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement
      textarea.selectionStart = 1
      textarea.selectionEnd = 1
      fireEvent.keyDown(textarea, { key: 'Tab' })
      expect(onChange).toHaveBeenCalledWith('a  ')
    })
  })

  describe('States', () => {
    it('applies height', () => {
      const { container } = renderEditor({ height: 420 })
      expect((container.firstElementChild as HTMLElement).style.height).toBe('420px')
    })

    it('disables textarea and formatting buttons', () => {
      const { container } = renderEditor({ disabled: true })
      expect((container.querySelector('textarea') as HTMLTextAreaElement).disabled).toBe(true)
      expect(
        (container.querySelector('[aria-label="Markdown formatting"] button') as HTMLButtonElement)
          .disabled
      ).toBe(true)
    })

    it('sets textarea readonly', () => {
      const { container } = renderEditor({ readOnly: true })
      expect((container.querySelector('textarea') as HTMLTextAreaElement).readOnly).toBe(true)
    })

    it('applies custom className', () => {
      const { container } = renderEditor({ className: 'custom-editor' })
      expect(container.firstElementChild?.className).toContain('custom-editor')
    })
  })

  describe('Accessibility', () => {
    it('labels editor and preview regions', () => {
      const { container } = renderEditor()
      expect(container.querySelector('[aria-label="Markdown editor"]')).toBeTruthy()
      expect(container.querySelector('[aria-label="Markdown preview"]')).toBeTruthy()
    })

    it('has no accessibility violations', async () => {
      const { container } = render(<MarkdownEditor />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
