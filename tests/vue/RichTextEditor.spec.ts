/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { RichTextEditor } from '@expcat/tigercat-vue'

function renderEditor(props: Record<string, unknown> = {}) {
  return render(RichTextEditor, {
    props: {
      value: '<p>Hello</p>',
      ...props
    }
  })
}

describe('RichTextEditor', () => {
  describe('Rendering', () => {
    it('should render the component', () => {
      const { container } = renderEditor()
      expect(container.querySelector('[role="textbox"]')).toBeTruthy()
    })

    it('should render toolbar', () => {
      const { container } = renderEditor()
      const toolbar = container.querySelector('[role="toolbar"]')
      expect(toolbar).toBeTruthy()
    })

    it('should render toolbar buttons', () => {
      const { container } = renderEditor()
      const buttons = container.querySelectorAll('[role="toolbar"] button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should render with custom toolbar', () => {
      const toolbar = [
        { name: 'bold', label: 'B' },
        { name: 'italic', label: 'I' }
      ]
      const { container } = renderEditor({ toolbar })
      const buttons = container.querySelectorAll('[role="toolbar"] button')
      expect(buttons.length).toBe(2)
    })
  })

  describe('Placeholder', () => {
    it('should show placeholder when empty', () => {
      const { container } = renderEditor({
        value: '',
        placeholder: 'Type here...'
      })
      expect(container.textContent).toContain('Type here...')
    })

    it('should not show placeholder when content exists', () => {
      const { container } = renderEditor({
        value: '<p>content</p>',
        placeholder: 'Type here...'
      })
      const placeholders = container.querySelectorAll('[aria-hidden]')
      expect(placeholders.length).toBe(0)
    })
  })

  describe('Disabled state', () => {
    it('should disable toolbar buttons when disabled', () => {
      const { container } = renderEditor({ disabled: true })
      const buttons = container.querySelectorAll('[role="toolbar"] button')
      buttons.forEach((btn) => {
        expect((btn as HTMLButtonElement).disabled).toBe(true)
      })
    })

    it('should set contenteditable to false when disabled', () => {
      const { container } = renderEditor({ disabled: true })
      const editor = container.querySelector('[role="textbox"]')
      expect(editor?.getAttribute('contenteditable')).toBe('false')
    })
  })

  describe('ReadOnly state', () => {
    it('should set contenteditable to false when readOnly', () => {
      const { container } = renderEditor({ readOnly: true })
      const editor = container.querySelector('[role="textbox"]')
      expect(editor?.getAttribute('contenteditable')).toBe('false')
    })

    it('should disable toolbar buttons when readOnly', () => {
      const { container } = renderEditor({ readOnly: true })
      const buttons = container.querySelectorAll('[role="toolbar"] button')
      buttons.forEach((btn) => {
        expect((btn as HTMLButtonElement).disabled).toBe(true)
      })
    })

    it('should have aria-readonly attribute', () => {
      const { container } = renderEditor({ readOnly: true })
      const editor = container.querySelector('[role="textbox"]')
      expect(editor?.getAttribute('aria-readonly')).toBe('true')
    })
  })

  describe('Accessibility', () => {
    it('should have role="textbox" on editor area', () => {
      const { container } = renderEditor()
      expect(container.querySelector('[role="textbox"]')).toBeTruthy()
    })

    it('should have role="toolbar" on toolbar', () => {
      const { container } = renderEditor()
      expect(container.querySelector('[role="toolbar"]')).toBeTruthy()
    })

    it('should have aria-multiline on editor', () => {
      const { container } = renderEditor()
      const editor = container.querySelector('[role="textbox"]')
      expect(editor?.getAttribute('aria-multiline')).toBe('true')
    })

    it('should have aria-label on toolbar buttons', () => {
      const { container } = renderEditor()
      const buttons = container.querySelectorAll('[role="toolbar"] button')
      buttons.forEach((btn) => {
        expect(btn.getAttribute('aria-label')).toBeTruthy()
      })
    })

    it('should have aria-pressed on inline format buttons', () => {
      const toolbar = [
        { name: 'bold', label: 'Bold' },
        { name: 'heading1', label: 'H1' }
      ]
      const { container } = renderEditor({ toolbar })
      const buttons = container.querySelectorAll('[role="toolbar"] button')
      // bold is inline -> aria-pressed should be present
      expect(buttons[0].getAttribute('aria-pressed')).toBeTruthy()
      // heading1 is block -> no aria-pressed
      expect(buttons[1].getAttribute('aria-pressed')).toBeNull()
    })
  })

  describe('Height', () => {
    it('should apply numeric height as px', () => {
      const { container } = renderEditor({ height: 400 })
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.style.height).toBe('400px')
    })

    it('should apply string height as-is', () => {
      const { container } = renderEditor({ height: '50vh' })
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.style.height).toBe('50vh')
    })
  })

  describe('Events', () => {
    it('should emit update:value on input', async () => {
      const { container, emitted } = renderEditor()
      const editor = container.querySelector('[role="textbox"]') as HTMLElement
      editor.innerHTML = '<p>New content</p>'
      await fireEvent.input(editor)
      const events = emitted()['update:value']
      expect(events).toBeTruthy()
      expect(events.length).toBeGreaterThan(0)
    })

    it('should emit change on input', async () => {
      const { container, emitted } = renderEditor()
      const editor = container.querySelector('[role="textbox"]') as HTMLElement
      editor.innerHTML = '<p>Changed</p>'
      await fireEvent.input(editor)
      const events = emitted()['change']
      expect(events).toBeTruthy()
    })
  })
})
