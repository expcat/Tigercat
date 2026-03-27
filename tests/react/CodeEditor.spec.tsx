/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { CodeEditor } from '@expcat/tigercat-react'

function renderCodeEditor(props: Record<string, unknown> = {}) {
  return render(<CodeEditor value="const x = 1" language="javascript" {...props} />)
}

describe('CodeEditor', () => {
  describe('Rendering', () => {
    it('should render with textarea', () => {
      const { container } = renderCodeEditor()
      const textarea = container.querySelector('textarea')
      expect(textarea).toBeTruthy()
    })

    it('should render with code value', () => {
      const { container } = renderCodeEditor()
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement
      expect(textarea.value).toBe('const x = 1')
    })

    it('should have code editor aria label', () => {
      const { container } = renderCodeEditor()
      const textarea = container.querySelector('[aria-label="Code editor"]')
      expect(textarea).toBeTruthy()
    })

    it('should set data-language attribute', () => {
      const { container } = renderCodeEditor({ language: 'typescript' })
      const root = container.firstElementChild as HTMLElement
      expect(root.getAttribute('data-language')).toBe('typescript')
    })

    it('should set data-theme attribute', () => {
      const { container } = renderCodeEditor({ theme: 'dark' })
      const root = container.firstElementChild as HTMLElement
      expect(root.getAttribute('data-theme')).toBe('dark')
    })
  })

  describe('Line numbers', () => {
    it('should show line numbers by default', () => {
      const { container } = renderCodeEditor({ value: 'a\nb\nc' })
      const lineNumbers = container.querySelector('[aria-hidden="true"]')
      expect(lineNumbers).toBeTruthy()
      expect(lineNumbers?.textContent).toContain('1')
      expect(lineNumbers?.textContent).toContain('3')
    })

    it('should hide line numbers when disabled', () => {
      const { container } = renderCodeEditor({ lineNumbers: false })
      const gutter = container.querySelector('.select-none')
      expect(gutter).toBeNull()
    })
  })

  describe('Theme', () => {
    it('should apply light theme classes', () => {
      const { container } = renderCodeEditor({ theme: 'light' })
      const root = container.firstElementChild as HTMLElement
      expect(root.className).toContain('bg-white')
    })

    it('should apply dark theme classes', () => {
      const { container } = renderCodeEditor({ theme: 'dark' })
      const root = container.firstElementChild as HTMLElement
      expect(root.className).toContain('bg-gray-900')
    })
  })

  describe('Disabled', () => {
    it('should disable textarea', () => {
      const { container } = renderCodeEditor({ disabled: true })
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement
      expect(textarea.disabled).toBe(true)
    })

    it('should apply disabled classes', () => {
      const { container } = renderCodeEditor({ disabled: true })
      const root = container.firstElementChild as HTMLElement
      expect(root.className).toContain('opacity-60')
    })
  })

  describe('ReadOnly', () => {
    it('should set textarea readonly', () => {
      const { container } = renderCodeEditor({ readOnly: true })
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement
      expect(textarea.readOnly).toBe(true)
    })
  })

  describe('Events', () => {
    it('should call onChange on input', () => {
      const onChange = vi.fn()
      const { container } = renderCodeEditor({
        value: undefined,
        defaultValue: 'hello',
        onChange
      })
      const textarea = container.querySelector('textarea')!
      fireEvent.change(textarea, { target: { value: 'hello world' } })
      expect(onChange).toHaveBeenCalledWith('hello world')
    })
  })

  describe('Syntax highlighting', () => {
    it('should highlight keywords in JavaScript', () => {
      const { container } = renderCodeEditor({
        value: 'const x = 1',
        language: 'javascript'
      })
      const highlighted = container.querySelector('[aria-hidden="true"] span')
      expect(highlighted).toBeTruthy()
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = renderCodeEditor({ className: 'my-editor' })
      const root = container.firstElementChild as HTMLElement
      expect(root.className).toContain('my-editor')
    })
  })

  describe('Placeholder', () => {
    it('should set placeholder on textarea', () => {
      const { container } = renderCodeEditor({
        value: '',
        placeholder: 'Type code...'
      })
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement
      expect(textarea.placeholder).toBe('Type code...')
    })
  })
})
