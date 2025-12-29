/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { Upload } from '@tigercat/vue'
import {
  renderWithProps,
  expectNoA11yViolations,
} from '../utils'

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
          default: 'Custom Upload Button',
        },
      })
      
      expect(getByText('Custom Upload Button')).toBeInTheDocument()
    })

    it('should render drag area when drag prop is true', () => {
      const { container } = renderWithProps(Upload, {
        drag: true,
      })
      
      const dragArea = container.querySelector('[role="button"]')
      expect(dragArea).toBeInTheDocument()
      expect(dragArea).toHaveTextContent('Click to upload')
      expect(dragArea).toHaveTextContent('or drag and drop')
    })

    it('should show accept info in drag area', () => {
      const { container } = renderWithProps(Upload, {
        drag: true,
        accept: 'image/*',
      })
      
      expect(container).toHaveTextContent('Accepted: image/*')
    })

    it('should show max size info in drag area', () => {
      const { container } = renderWithProps(Upload, {
        drag: true,
        maxSize: 5 * 1024 * 1024,
      })
      
      expect(container).toHaveTextContent('Max size: 5.00 MB')
    })
  })

  describe('Props', () => {
    it('should set accept attribute on input', () => {
      const { container } = renderWithProps(Upload, {
        accept: 'image/*',
      })
      
      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', 'image/*')
    })

    it('should set multiple attribute when multiple is true', () => {
      const { container } = renderWithProps(Upload, {
        multiple: true,
      })
      
      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('multiple')
    })

    it('should disable input when disabled is true', () => {
      const { container } = renderWithProps(Upload, {
        disabled: true,
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
            status: 'success',
          },
        ],
        showFileList: false,
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
          onChange,
        },
      })
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
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
            status: 'success',
          },
        ],
        onRemove,
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
            status: 'success',
          },
        ],
        limit: 1,
        onExceed,
      })
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['content'], 'test2.txt', { type: 'text/plain' })
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      })
      
      await fireEvent.change(input)
      
      await waitFor(() => {
        expect(onExceed).toHaveBeenCalled()
      })
    })
  })

  describe('File Validation', () => {
    it('should validate file type', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { container } = renderWithProps(Upload, {
        accept: 'image/*',
      })
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      })
      
      await fireEvent.change(input)
      
      await waitFor(() => {
        expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('type is not accepted'))
      })
      
      consoleWarn.mockRestore()
    })

    it('should validate file size', async () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { container } = renderWithProps(Upload, {
        maxSize: 50,
      })
      
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      // Create content that's definitely larger than 50 bytes
      const largeContent = 'x'.repeat(100)
      const file = new File([largeContent], 'test.txt', { type: 'text/plain' })
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      })
      
      await fireEvent.change(input)
      
      await waitFor(() => {
        expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('exceeds maximum size'))
      })
      
      consoleWarn.mockRestore()
    })
  })

  describe('List Types', () => {
    it('should render text list by default', () => {
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test.jpg',
            status: 'success',
          },
        ],
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
            url: 'https://example.com/test.jpg',
          },
        ],
        listType: 'picture-card',
      })
      
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/test.jpg')
    })
  })

  describe('States', () => {
    it('should show disabled state on button', () => {
      const { container } = renderWithProps(Upload, {
        disabled: true,
      })
      
      const button = container.querySelector('button')
      expect(button).toBeDisabled()
    })

    it('should show disabled state on drag area', () => {
      const { container } = renderWithProps(Upload, {
        drag: true,
        disabled: true,
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
            status: 'success',
          },
        ],
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
            status: 'error',
          },
        ],
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
            status: 'uploading',
          },
        ],
      })
      
      const uploadingIcon = container.querySelector('[aria-label="Uploading"]')
      expect(uploadingIcon).toBeInTheDocument()
    })
  })

  describe('Drag and Drop', () => {
    it('should handle drag over event', async () => {
      const { container } = renderWithProps(Upload, {
        drag: true,
      })
      
      const dragArea = container.querySelector('[role="button"]') as HTMLElement
      
      await fireEvent.dragOver(dragArea)
      
      // Should add dragging state classes
      expect(dragArea.className).toContain('border-')
    })

    it('should handle drop event', async () => {
      const onChange = vi.fn()
      const { container } = render(Upload, {
        props: {
          drag: true,
          onChange,
        },
      })
      
      const dragArea = container.querySelector('[role="button"]') as HTMLElement
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      
      const dataTransfer = {
        files: [file],
      }
      
      await fireEvent.drop(dragArea, { dataTransfer })
      
      await waitFor(() => {
        expect(onChange).toHaveBeenCalled()
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
        drag: true,
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
            status: 'success',
          },
        ],
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
            status: 'success',
          },
        ],
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
            status: 'success',
          },
        ],
      })
      
      await expectNoA11yViolations(container)
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot with default props', () => {
      const { container } = render(Upload)
      expect(container).toMatchSnapshot()
    })

    it('should match snapshot with drag mode', () => {
      const { container } = renderWithProps(Upload, {
        drag: true,
        accept: 'image/*',
        maxSize: 5 * 1024 * 1024,
      })
      expect(container).toMatchSnapshot()
    })

    it('should match snapshot with file list', () => {
      const { container } = renderWithProps(Upload, {
        fileList: [
          {
            uid: 'file-1',
            name: 'test1.jpg',
            status: 'success',
            size: 1024,
          },
          {
            uid: 'file-2',
            name: 'test2.png',
            status: 'uploading',
            progress: 50,
          },
          {
            uid: 'file-3',
            name: 'test3.pdf',
            status: 'error',
            error: 'Upload failed',
          },
        ],
      })
      expect(container).toMatchSnapshot()
    })

    it('should match snapshot with picture-card list type', () => {
      const { container } = renderWithProps(Upload, {
        listType: 'picture-card',
        fileList: [
          {
            uid: 'file-1',
            name: 'test.jpg',
            status: 'success',
            url: 'https://example.com/test.jpg',
          },
        ],
      })
      expect(container).toMatchSnapshot()
    })
  })
})
