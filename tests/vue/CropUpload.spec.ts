/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { CropUpload } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

function createFile(name: string, size: number, type = 'image/png'): File {
  const content = new ArrayBuffer(size)
  return new File([content], name, { type })
}

function mockFileReader(result = 'data:image/png;base64,abc') {
  const original = globalThis.FileReader
  const instances: { onload: ((ev: unknown) => void) | null; onerror: (() => void) | null }[] = []
  function MockFileReader(this: {
    readAsDataURL: () => void
    onload: ((ev: unknown) => void) | null
    onerror: (() => void) | null
    result: string
  }) {
    this.onload = null
    this.onerror = null
    this.result = result
    instances.push(this)
    this.readAsDataURL = () => {
      Promise.resolve().then(() => this.onload?.({ target: { result } }))
    }
  }
  globalThis.FileReader = MockFileReader as unknown as typeof FileReader
  return {
    triggerError: () => instances[instances.length - 1]?.onerror?.(),
    restore: () => {
      globalThis.FileReader = original
    }
  }
}

describe('CropUpload', () => {
  describe('Rendering', () => {
    it('renders trigger button with proper role', () => {
      const { container } = render(CropUpload)
      const trigger = container.querySelector('[role="button"]')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('aria-label', 'Select image to crop and upload')
    })

    it('renders default trigger text and icon', () => {
      const { container } = render(CropUpload)
      expect(container.textContent).toContain('选择图片')
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('renders custom slot content', () => {
      const { container } = render(CropUpload, {
        slots: {
          default: '<span data-testid="custom">Custom Trigger</span>'
        }
      })
      expect(container.querySelector('[data-testid="custom"]')).toBeInTheDocument()
    })

    it('has hidden file input with default accept', () => {
      const { container } = render(CropUpload)
      const input = container.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('accept', 'image/*')
      expect((input as HTMLElement).style.display).toBe('none')
    })

    it('wraps in tiger-crop-upload container', () => {
      const { container } = render(CropUpload)
      expect(container.querySelector('.tiger-crop-upload')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('respects custom accept prop', () => {
      const { container } = render(CropUpload, {
        props: { accept: '.png,.jpg' }
      })
      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', '.png,.jpg')
    })

    it('applies disabled state with aria-disabled and tabindex=-1', () => {
      const { container } = render(CropUpload, {
        props: { disabled: true }
      })
      const trigger = container.querySelector('[role="button"]')
      expect(trigger).toHaveAttribute('aria-disabled', 'true')
      expect(trigger).toHaveAttribute('tabindex', '-1')
    })

    it('merges custom className', () => {
      const { container } = render(CropUpload, {
        props: { className: 'my-upload' }
      })
      const trigger = container.querySelector('[role="button"]')
      expect(trigger?.className).toContain('my-upload')
    })

    it('applies custom style', () => {
      const { container } = render(CropUpload, {
        props: { style: { width: '200px' } }
      })
      const trigger = container.querySelector('[role="button"]')
      expect(trigger).toHaveStyle({ width: '200px' })
    })
  })

  describe('File Selection', () => {
    it('opens file input on trigger click', async () => {
      const { container } = render(CropUpload)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      const trigger = container.querySelector('[role="button"]')!
      await fireEvent.click(trigger)
      expect(clickSpy).toHaveBeenCalled()
    })

    it('does not open file input when disabled', async () => {
      const { container } = render(CropUpload, { props: { disabled: true } })
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      const trigger = container.querySelector('[role="button"]')!
      await fireEvent.click(trigger)
      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('reads file successfully without error on valid selection', async () => {
      const mock = mockFileReader()
      const { container, emitted } = render(CropUpload)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      const file = createFile('test.png', 1024)
      Object.defineProperty(input, 'files', { value: [file], configurable: true })
      await fireEvent.change(input)

      // Wait for async FileReader to resolve
      await new Promise((r) => setTimeout(r, 10))
      expect(emitted().error).toBeUndefined()
      mock.restore()
    })

    it('resets file input value after selection', async () => {
      const mock = mockFileReader()
      const { container } = render(CropUpload)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      const file = createFile('test.png', 1024)
      Object.defineProperty(input, 'files', { value: [file], configurable: true })
      await fireEvent.change(input)

      expect(input.value).toBe('')
      mock.restore()
    })

    it('ignores change event when no file is selected', async () => {
      const { container, emitted } = render(CropUpload)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(input, 'files', { value: [], configurable: true })
      await fireEvent.change(input)

      expect(emitted().error).toBeUndefined()
    })
  })

  describe('Validation', () => {
    it('emits error when file exceeds maxSize', async () => {
      const { container, emitted } = render(CropUpload, {
        props: { maxSize: 500 }
      })
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      const file = createFile('big.png', 1024)
      Object.defineProperty(input, 'files', { value: [file], configurable: true })
      await fireEvent.change(input)

      expect(emitted().error).toBeDefined()
      expect(emitted().error![0][0]).toBeInstanceOf(Error)
      expect((emitted().error![0][0] as Error).message).toContain('500')
    })

    it('does not emit error when file is within maxSize', async () => {
      const mock = mockFileReader()
      const { container, emitted } = render(CropUpload, {
        props: { maxSize: 2048 }
      })
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      const file = createFile('ok.png', 1024)
      Object.defineProperty(input, 'files', { value: [file], configurable: true })
      await fireEvent.change(input)

      expect(emitted().error).toBeUndefined()
      mock.restore()
    })

    it('does not validate size when maxSize is not set', async () => {
      const mock = mockFileReader()
      const { container, emitted } = render(CropUpload)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      const file = createFile('large.png', 999999)
      Object.defineProperty(input, 'files', { value: [file], configurable: true })
      await fireEvent.change(input)

      expect(emitted().error).toBeUndefined()
      mock.restore()
    })

    it('emits error when file read fails', async () => {
      const original = globalThis.FileReader
      function FailReader(this: { readAsDataURL: () => void; onload: null; onerror: (() => void) | null; error: Error }) {
        this.onload = null
        this.onerror = null
        this.error = new Error('Failed to read file')
        this.readAsDataURL = () => {
          Promise.resolve().then(() => this.onerror?.())
        }
      }
      globalThis.FileReader = FailReader as unknown as typeof FileReader

      const { container, emitted } = render(CropUpload)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      const file = createFile('bad.png', 100)
      Object.defineProperty(input, 'files', { value: [file], configurable: true })
      await fireEvent.change(input)

      await vi.waitFor(() => {
        expect(emitted().error).toBeDefined()
      })
      globalThis.FileReader = original
    })
  })

  describe('Keyboard Navigation', () => {
    it('opens file input on Enter key', async () => {
      const { container } = render(CropUpload)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')
      const trigger = container.querySelector('[role="button"]')!

      await fireEvent.keyDown(trigger, { key: 'Enter' })
      expect(clickSpy).toHaveBeenCalled()
    })

    it('opens file input on Space key', async () => {
      const { container } = render(CropUpload)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')
      const trigger = container.querySelector('[role="button"]')!

      await fireEvent.keyDown(trigger, { key: ' ' })
      expect(clickSpy).toHaveBeenCalled()
    })

    it('does not open file input on other keys', async () => {
      const { container } = render(CropUpload)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')
      const trigger = container.querySelector('[role="button"]')!

      await fireEvent.keyDown(trigger, { key: 'Tab' })
      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('does not respond to keyboard when disabled', async () => {
      const { container } = render(CropUpload, { props: { disabled: true } })
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')
      const trigger = container.querySelector('[role="button"]')!

      await fireEvent.keyDown(trigger, { key: 'Enter' })
      expect(clickSpy).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('trigger has role="button"', () => {
      const { container } = render(CropUpload)
      expect(container.querySelector('[role="button"]')).toBeInTheDocument()
    })

    it('trigger has descriptive aria-label', () => {
      const { container } = render(CropUpload)
      const trigger = container.querySelector('[role="button"]')
      expect(trigger).toHaveAttribute('aria-label', 'Select image to crop and upload')
    })

    it('tabindex is 0 when enabled', () => {
      const { container } = render(CropUpload)
      const trigger = container.querySelector('[role="button"]')
      expect(trigger).toHaveAttribute('tabindex', '0')
    })

    it('passes axe accessibility audit', async () => {
      const { container } = render(CropUpload)
      await expectNoA11yViolationsIsolated(container)
    })

    it('passes axe audit when disabled', async () => {
      const { container } = render(CropUpload, { props: { disabled: true } })
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge Cases', () => {
    it('renders without any props', () => {
      const { container } = render(CropUpload)
      expect(container.querySelector('.tiger-crop-upload')).toBeInTheDocument()
    })

    it('handles custom slot and still has file input', () => {
      const { container } = render(CropUpload, {
        slots: { default: '<button>Upload</button>' }
      })
      expect(container.querySelector('input[type="file"]')).toBeInTheDocument()
    })

    it('does not crash with maxSize of 0', () => {
      const { container } = render(CropUpload, { props: { maxSize: 0 } })
      expect(container.querySelector('.tiger-crop-upload')).toBeInTheDocument()
    })
  })
})
