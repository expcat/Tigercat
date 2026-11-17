/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { RichTextEditor } from '@expcat/tigercat-vue/RichTextEditor'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils'

function renderEditor(props: Record<string, unknown> = {}) {
  return render(RichTextEditor, {
    props: {
      modelValue: '<p>Hello</p>',
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

    it('uses locale text for bind table and image buttons', () => {
      const { container } = renderEditor({ bind: true, locale: zhCN })
      const buttons = container.querySelectorAll('[data-tiger-rte-bind] button')
      expect(buttons[0]?.textContent).toBe('表格')
      expect(buttons[1]?.textContent).toBe('图片')
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
        modelValue: '',
        placeholder: 'Type here...'
      })
      expect(container.textContent).toContain('Type here...')
    })

    it('should not show placeholder when content exists', () => {
      const { container } = renderEditor({
        modelValue: '<p>content</p>',
        placeholder: 'Type here...'
      })
      const placeholders = container.querySelectorAll('[aria-hidden]')
      expect(placeholders.length).toBe(0)
    })

    it('does not cover an image-only document with the placeholder', () => {
      const { container } = renderEditor({
        modelValue: '<p><img src="https://example.com/a.png" alt="a"></p>',
        placeholder: 'Type here...'
      })
      expect(container.textContent).not.toContain('Type here...')
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

    it('should have no accessibility violations', async () => {
      const { container } = render(RichTextEditor)
      await expectNoA11yViolationsIsolated(container)
    })

    it('uses ConfigProvider locale for toolbar and editor labels', () => {
      const { container } = render({
        render() {
          return h(ConfigProvider, { locale: zhCN }, () =>
            h(RichTextEditor, { modelValue: '<p>你好</p>' })
          )
        }
      })

      expect(container.querySelector('[aria-label="富文本格式工具栏"]')).toBeTruthy()
      expect(container.querySelector('[aria-label="富文本编辑器"]')).toBeTruthy()
      expect(container.querySelector('[aria-label="加粗"]')).toBeTruthy()
      expect(container.querySelector('[aria-label="斜体"]')).toBeTruthy()
    })

    it('should have aria-pressed on format buttons', () => {
      const toolbar = [
        { name: 'bold', label: 'Bold' },
        { name: 'heading1', label: 'H1' }
      ]
      const { container } = renderEditor({ toolbar })
      const buttons = container.querySelectorAll('[role="toolbar"] button')
      expect(buttons[0].getAttribute('aria-pressed')).toBe('false')
      expect(buttons[1].getAttribute('aria-pressed')).toBe('false')
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

    it('merges leftover style with the height box', () => {
      const { container } = renderEditor({
        height: 320,
        style: { marginTop: '8px' }
      })
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper.style.height).toBe('320px')
      expect(wrapper.style.marginTop).toBe('8px')
    })

    it('accepts a string style without crashing', () => {
      const { container } = renderEditor({
        style: 'margin-top: 13px'
      })
      const wrapper = container.firstElementChild as HTMLElement
      expect(wrapper).toBeTruthy()
      expect(wrapper.style.height).toBe('300px')
      expect(wrapper.style.marginTop).toBe('13px')
    })
  })

  describe('Events', () => {
    it('should emit update:modelValue on input', async () => {
      const { container, emitted } = renderEditor()
      const editor = container.querySelector('[role="textbox"]') as HTMLElement
      editor.innerHTML = '<p>New content</p>'
      await fireEvent.input(editor)
      const events = emitted()['update:modelValue']
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

    it('syncs custom toolbar action changes through the engine', async () => {
      const toolbar = [
        {
          name: 'insertCustom',
          label: 'Custom',
          action: (element: HTMLElement) => {
            element.innerHTML = '<p>Custom value</p>'
          }
        }
      ]
      const { getByRole, emitted } = renderEditor({ toolbar })

      await fireEvent.click(getByRole('button', { name: 'Custom' }))

      expect(emitted()['update:modelValue'].at(-1)?.[0]).toBe('<p>Custom value</p>')
    })

    it('should render markdown mode content through the engine', () => {
      const { container } = renderEditor({ modelValue: '# Title', mode: 'markdown' })
      const editor = container.querySelector('[role="textbox"]') as HTMLElement
      expect(editor.innerHTML).toContain('<h1>Title</h1>')
    })

    it('should emit plain mode content as text', async () => {
      const { container, emitted } = renderEditor({ modelValue: 'Hello', mode: 'plain' })
      const editor = container.querySelector('[role="textbox"]') as HTMLElement
      editor.innerHTML = '<p>Hello <strong>world</strong></p>'
      await fireEvent.input(editor)
      expect(emitted()['update:modelValue'][0][0]).toBe('Hello world')
    })

    it('prevents toolbar mousedown so the editor keeps its selection', async () => {
      const { getByRole } = renderEditor({
        toolbar: [{ name: 'bold', label: 'Bold' }]
      })
      const button = getByRole('button', { name: 'Bold' })
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
      button.dispatchEvent(event)
      expect(event.defaultPrevented).toBe(true)
    })

    it('lets a read-only editor take focus', () => {
      const { container } = renderEditor({ readOnly: true })
      const editor = container.querySelector('[role="textbox"]') as HTMLElement
      expect(editor.tabIndex).toBe(0)
    })

    it('opens a localized link field and focuses it', async () => {
      const { container } = render({
        render() {
          return h(RichTextEditor, { modelValue: '<p>Hello</p>', locale: zhCN })
        }
      })
      const link = container.querySelector('[aria-label="链接"]') as HTMLButtonElement
      await fireEvent.click(link)
      const input = container.querySelector('form input') as HTMLInputElement
      expect(input.placeholder).toBe('输入链接地址')
      expect(document.activeElement).toBe(input)
    })

    it('announces a rejected image paste in the active locale', async () => {
      const { container } = render({
        render() {
          return h(RichTextEditor, { modelValue: '<p>Hello</p>', locale: zhCN })
        }
      })
      const editor = container.querySelector('[role="textbox"]') as HTMLElement
      const paste = new Event('paste', { bubbles: true, cancelable: true })
      Object.defineProperty(paste, 'clipboardData', {
        value: {
          files: [{ type: 'image/png', size: 1_500_001, name: 'big.png' }],
          getData: () => ''
        }
      })
      editor.dispatchEvent(paste)
      const status = document.querySelector('[data-tiger-live-region="polite"]') as HTMLElement
      await waitFor(() => {
        expect(status.textContent).toContain('图片未粘贴')
        expect(status.textContent).not.toContain('Image was not pasted.')
      })
    })

    it('keeps caller keydown, blur, paste, and click listeners and still runs hotkeys', async () => {
      const counts = { keydown: 0, blur: 0, paste: 0, click: 0 }
      const doc = document as Document & { execCommand?: () => boolean }
      if (typeof doc.execCommand !== 'function') doc.execCommand = () => true
      const exec = vi.spyOn(document, 'execCommand').mockImplementation(() => true)
      const { container } = render({
        render() {
          return h(RichTextEditor, {
            modelValue: '<p>Hello</p>',
            onKeydown: () => {
              counts.keydown += 1
            },
            onBlur: () => {
              counts.blur += 1
            },
            onPaste: () => {
              counts.paste += 1
            },
            onClick: () => {
              counts.click += 1
            }
          })
        }
      })
      const editor = container.querySelector('[role="textbox"]') as HTMLElement
      await fireEvent.keyDown(editor, { key: 'b', ctrlKey: true })
      await fireEvent.blur(editor)
      await fireEvent.paste(editor)
      await fireEvent.click(editor)
      expect(counts).toEqual({ keydown: 1, blur: 1, paste: 1, click: 1 })
      expect(exec.mock.calls.some((call) => call[0] === 'bold')).toBe(true)
      exec.mockRestore()
    })
  })

  describe('Form integration', () => {
    it('follows FormItem value changes after mount', async () => {
      const model = ref({ body: '<p>Original</p>' })
      const Host = defineComponent({
        setup() {
          return () =>
            h(Form, { modelValue: model.value }, () =>
              h(FormItem, { name: 'body', label: 'Body' }, () => h(RichTextEditor))
            )
        }
      })
      const { container } = render(Host)
      const editor = container.querySelector('[role="textbox"]') as HTMLElement
      await nextTick()
      expect(editor.innerHTML).toContain('Original')

      model.value = { body: '<p>Replacement</p>' }
      await nextTick()
      expect(editor.innerHTML).toContain('Replacement')
    })
  })
})
