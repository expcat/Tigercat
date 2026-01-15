/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { Upload, ConfigProvider } from '@expcat/tigercat-vue'
import { defineComponent, h } from 'vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

describe('Upload', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(Upload)

      const input = container.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Select File')
    })

    it('should render with custom slot content', () => {
      const { getByText } = render(Upload, {
        slots: {
          default: 'Custom Upload Button'
        }
      })

      expect(getByText('Custom Upload Button')).toBeInTheDocument()
    })

    it('should render drag area when drag prop is true', () => {
      const { container } = renderWithProps(Upload, {
        drag: true
      })

      const dragArea = container.querySelector('[role="button"]')
      expect(dragArea).toBeInTheDocument()
      expect(dragArea).toHaveTextContent('Click to upload')
      expect(dragArea).toHaveTextContent('or drag and drop')
    })

    it('should show accept info in drag area', () => {
      const { container } = renderWithProps(Upload, {
        drag: true,
        accept: 'image/*'
      })

      expect(container).toHaveTextContent('Accepted: image/*')
    })

    it('should show max size info in drag area', () => {
      const { container } = renderWithProps(Upload, {
        drag: true,
        maxSize: 5 * 1024 * 1024
      })

      expect(container).toHaveTextContent('Max size: 5.00 MB')
    })

    it('should use locale upload texts when provided', () => {
      const { container } = renderWithProps(Upload, {
        drag: true,
        accept: 'image/*',
        locale: {
          upload: {
            clickToUploadText: '点击上传',
            dragAndDropText: '或拖拽到此处',
            acceptInfoText: '支持：{accept}'
          }
        }
      })

      expect(container).toHaveTextContent('点击上传')
      expect(container).toHaveTextContent('或拖拽到此处')
      expect(container).toHaveTextContent('支持：image/*')
    })

    it('should prefer labels overrides over locale', () => {
      const { container } = renderWithProps(Upload, {
        drag: true,
        accept: 'image/*',
        locale: {
          upload: {
            acceptInfoText: '支持：{accept}'
          }
        },
        labels: {
          acceptInfoText: '仅允许：{accept}'
        }
      })

      expect(container).toHaveTextContent('仅允许：image/*')
      expect(container).not.toHaveTextContent('支持：image/*')
    })

    it('should use ConfigProvider locale when locale prop is not provided', () => {
      const Wrapper = defineComponent({
        setup() {
          return () =>
            h(
              ConfigProvider,
              {
                locale: {
                  upload: {
                    clickToUploadText: '点击上传',
                    dragAndDropText: '或拖拽到此处'
                  }
                }
              },
              {
                default: () => h(Upload, { drag: true })
              }
            )
        }
      })

      const { container } = render(Wrapper)
      expect(container).toHaveTextContent('点击上传')
      expect(container).toHaveTextContent('或拖拽到此处')
    })
  })

  describe('Props', () => {
    it('should set accept attribute on input', () => {
      const { container } = renderWithProps(Upload, {
        accept: 'image/*'
      })

      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', 'image/*')
    })

    it('should set multiple attribute when multiple is true', () => {
      const { container } = renderWithProps(Upload, {
        multiple: true
      })

      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('multiple')
    })

    it('should disable input when disabled is true', () => {
      const { container } = renderWithProps(Upload, {
        disabled: true
      })

      const input = container.querySelector('input[type="file"]')
      expect(input).toBeDisabled()
    })

    it('should hide file list when showFileList is false', () => {
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test.jpg',
            status: 'success'
          }
        ],
        showFileList: false
      })

      const fileList = container.querySelector('[role="list"]')
      expect(fileList).not.toBeInTheDocument()
    })
  })

  describe('Events', () => {
    it('should emit change event when file is selected', async () => {
      const onChange = vi.fn()
      const { container } = render(Upload, {
        props: {
          onChange
        }
      })

      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      })

      await fireEvent.change(input)

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled()
      })
    })

    it('should emit remove event when file is removed', async () => {
      const onRemove = vi.fn()
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test.jpg',
            status: 'success'
          }
        ],
        onRemove
      })

      const removeButton = container.querySelector('[aria-label*="Remove"]') as HTMLButtonElement
      await fireEvent.click(removeButton)

      expect(onRemove).toHaveBeenCalled()
    })

    it('should emit exceed event when file limit is exceeded', async () => {
      const onExceed = vi.fn()
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test1.jpg',
            status: 'success'
          }
        ],
        limit: 1,
        onExceed
      })

      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['content'], 'test2.txt', { type: 'text/plain' })

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      })

      await fireEvent.change(input)

      await waitFor(() => {
        expect(onExceed).toHaveBeenCalled()
      })
    })

    it('should accumulate multiple selected files into fileList', async () => {
      const { container, emitted } = renderWithProps(Upload, {
        multiple: true,
        fileList: []
      })

      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const file1 = new File(['a'], 'a.txt', { type: 'text/plain' })
      const file2 = new File(['b'], 'b.txt', { type: 'text/plain' })

      Object.defineProperty(input, 'files', {
        value: [file1, file2],
        writable: false
      })

      await fireEvent.change(input)

      await waitFor(() => {
        expect(emitted()).toHaveProperty('update:file-list')
      })

      const updates = emitted()['update:file-list'] as unknown[]
      const last = updates[updates.length - 1] as [unknown]
      const lastList = last[0] as Array<{ name: string }>
      expect(lastList).toHaveLength(2)
      expect(lastList.map((f) => f.name)).toEqual(['a.txt', 'b.txt'])
    })
  })

  describe('File Validation', () => {
    it('should validate file type', async () => {
      const onChange = vi.fn()
      const { container, emitted } = renderWithProps(Upload, {
        accept: 'image/*',
        onChange
      })

      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      })

      await fireEvent.change(input)

      await waitFor(() => {
        expect(onChange).not.toHaveBeenCalled()
      })

      expect(emitted()).not.toHaveProperty('update:file-list')
      expect(container.querySelector('[role="list"]')).not.toBeInTheDocument()
    })

    it('should validate file size', async () => {
      const onChange = vi.fn()
      const { container, emitted } = renderWithProps(Upload, {
        maxSize: 50,
        onChange
      })

      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      // Create content that's definitely larger than 50 bytes
      const largeContent = 'x'.repeat(100)
      const file = new File([largeContent], 'test.txt', { type: 'text/plain' })

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      })

      await fireEvent.change(input)

      await waitFor(() => {
        expect(onChange).not.toHaveBeenCalled()
      })

      expect(emitted()).not.toHaveProperty('update:file-list')
      expect(container.querySelector('[role="list"]')).not.toBeInTheDocument()
    })

    it('should prevent upload when beforeUpload throws', async () => {
      const beforeUpload = vi.fn(() => {
        throw new Error('boom')
      })
      const onChange = vi.fn()
      const { container, emitted } = renderWithProps(Upload, {
        beforeUpload,
        onChange
      })

      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      })

      await fireEvent.change(input)

      await waitFor(() => {
        expect(beforeUpload).toHaveBeenCalled()
        expect(onChange).not.toHaveBeenCalled()
      })

      expect(emitted()).not.toHaveProperty('update:file-list')
      expect(container.querySelector('[role="list"]')).not.toBeInTheDocument()
    })
  })

  describe('List Types', () => {
    it('should render text list by default', () => {
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test.jpg',
            status: 'success'
          }
        ]
      })

      const fileList = container.querySelector('[role="list"]')
      expect(fileList).toBeInTheDocument()
    })

    it('should render picture card list when listType is picture-card', () => {
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test.jpg',
            status: 'success',
            url: 'https://example.com/test.jpg'
          }
        ],
        listType: 'picture-card'
      })

      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/test.jpg')
    })
  })

  describe('States', () => {
    it('should show disabled state on button', () => {
      const { container } = renderWithProps(Upload, {
        disabled: true
      })

      const button = container.querySelector('button')
      expect(button).toBeDisabled()
    })

    it('should show disabled state on drag area', () => {
      const { container } = renderWithProps(Upload, {
        drag: true,
        disabled: true
      })

      const dragArea = container.querySelector('[role="button"]')
      expect(dragArea).toHaveAttribute('aria-disabled', 'true')
      expect(dragArea).toHaveAttribute('tabindex', '-1')
    })

    it('should display success status icon', () => {
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test.jpg',
            status: 'success'
          }
        ]
      })

      const successIcon = container.querySelector('[aria-label="Success"]')
      expect(successIcon).toBeInTheDocument()
    })

    it('should display error status icon', () => {
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test.jpg',
            status: 'error'
          }
        ]
      })

      const errorIcon = container.querySelector('[aria-label="Error"]')
      expect(errorIcon).toBeInTheDocument()
    })

    it('should display uploading status icon', () => {
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test.jpg',
            status: 'uploading'
          }
        ]
      })

      const uploadingIcon = container.querySelector('[aria-label="Uploading"]')
      expect(uploadingIcon).toBeInTheDocument()
    })
  })

  describe('Drag and Drop', () => {
    it('should handle drag over event', async () => {
      const { container } = renderWithProps(Upload, {
        drag: true
      })

      const dragArea = container.querySelector('[role="button"]') as HTMLElement

      await fireEvent.dragOver(dragArea)

      // Should add dragging state classes
      expect(dragArea.className).toContain('cursor-copy')
    })

    it('should handle drop event', async () => {
      const onChange = vi.fn()
      const { container } = render(Upload, {
        props: {
          drag: true,
          onChange
        }
      })

      const dragArea = container.querySelector('[role="button"]') as HTMLElement
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })

      const dataTransfer = {
        files: [file]
      }

      await fireEvent.drop(dragArea, { dataTransfer })

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled()
      })
    })
  })

  describe('Keyboard Interaction', () => {
    it('should open file dialog on Enter/Space in drag mode', async () => {
      const { container } = renderWithProps(Upload, {
        drag: true
      })

      const dragArea = container.querySelector('[role="button"]') as HTMLElement
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      await fireEvent.keyDown(dragArea, { key: 'Enter' })
      await fireEvent.keyDown(dragArea, { key: ' ' })

      expect(clickSpy).toHaveBeenCalled()
    })

    it('should not open file dialog on keydown when disabled', async () => {
      const { container } = renderWithProps(Upload, {
        drag: true,
        disabled: true
      })

      const dragArea = container.querySelector('[role="button"]') as HTMLElement
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      await fireEvent.keyDown(dragArea, { key: 'Enter' })
      await fireEvent.keyDown(dragArea, { key: ' ' })

      expect(clickSpy).not.toHaveBeenCalled()
    })
  })

  describe('Controlled and Uncontrolled', () => {
    it('should work in uncontrolled mode', async () => {
      const { container } = render(Upload)

      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      })

      await fireEvent.change(input)

      await waitFor(() => {
        const fileList = container.querySelector('[role="list"]')
        expect(fileList).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on upload button', () => {
      const { container } = renderWithProps(Upload, {})

      const button = container.querySelector('button')
      expect(button).toHaveAttribute('aria-label', 'Upload file')
    })

    it('should have proper ARIA attributes on drag area', () => {
      const { container } = renderWithProps(Upload, {
        drag: true
      })

      const dragArea = container.querySelector('[role="button"]')
      expect(dragArea).toHaveAttribute('role', 'button')
      expect(dragArea).toHaveAttribute('aria-label', 'Upload file by clicking or dragging')
      expect(dragArea).toHaveAttribute('tabindex', '0')
    })

    it('should have proper ARIA attributes on file list', () => {
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test.jpg',
            status: 'success'
          }
        ]
      })

      const fileList = container.querySelector('[role="list"]')
      expect(fileList).toHaveAttribute('aria-label', 'Uploaded files')
    })

    it('should have descriptive aria-label on remove button', () => {
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test.jpg',
            status: 'success'
          }
        ]
      })

      const removeButton = container.querySelector('[aria-label*="Remove"]')
      expect(removeButton).toHaveAttribute('aria-label', 'Remove test.jpg')
    })

    it('should pass accessibility checks', async () => {
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test.jpg',
            status: 'success'
          }
        ]
      })

      await expectNoA11yViolations(container)
    })
  })

  // 快照测试在组件重构后容易变脆；保留关键行为断言即可
})
