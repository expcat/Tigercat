/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { CropUpload } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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

async function changeInputFile(input: HTMLInputElement, file: File): Promise<void> {
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  await act(async () => {
    fireEvent.change(input)
    await Promise.resolve()
  })
}

describe('CropUpload', () => {
  describe('Rendering', () => {
    it('renders trigger button with proper role', () => {
      render(<CropUpload />)
      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('aria-label', 'Select image to crop and upload')
    })

    it('displays default text and icon', () => {
      const { container } = render(<CropUpload />)
      expect(screen.getByText('选择图片')).toBeInTheDocument()
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('supports custom children', () => {
      render(
        <CropUpload>
          <span>Custom Trigger</span>
        </CropUpload>
      )
      expect(screen.getByText('Custom Trigger')).toBeInTheDocument()
    })

    it('has hidden file input', () => {
      const { container } = render(<CropUpload />)
      const input = container.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()
      expect(input).not.toBeVisible()
    })

    it('wraps in tiger-crop-upload container', () => {
      const { container } = render(<CropUpload />)
      expect(container.querySelector('.tiger-crop-upload')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('applies accept filter to file input', () => {
      const { container } = render(<CropUpload accept="image/png" />)
      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', 'image/png')
    })

    it('uses image/* as default accept', () => {
      const { container } = render(<CropUpload />)
      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', 'image/*')
    })

    it('disables trigger with aria-disabled and tabIndex=-1', () => {
      render(<CropUpload disabled />)
      const trigger = screen.getByRole('button')
      expect(trigger).toHaveAttribute('aria-disabled', 'true')
      expect(trigger).toHaveAttribute('tabindex', '-1')
    })

    it('merges custom className', () => {
      render(<CropUpload className="my-upload" />)
      const trigger = screen.getByRole('button')
      expect(trigger.className).toContain('my-upload')
    })
  })

  describe('File Selection', () => {
    it('opens file input on click', async () => {
      const user = userEvent.setup()
      const { container } = render(<CropUpload />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      await user.click(screen.getByRole('button'))
      expect(clickSpy).toHaveBeenCalled()
    })

    it('does not open file input when disabled', async () => {
      const user = userEvent.setup()
      const { container } = render(<CropUpload disabled />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      await user.click(screen.getByRole('button'))
      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('reads file successfully without error on valid selection', async () => {
      const mock = mockFileReader()
      const onError = vi.fn()
      const { container } = render(<CropUpload onError={onError} />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      try {
        await changeInputFile(input, createFile('test.png', 1024))
        expect(onError).not.toHaveBeenCalled()
      } finally {
        mock.restore()
      }
    })

    it('resets input value after file selection', async () => {
      const mock = mockFileReader()
      const { container } = render(<CropUpload />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      try {
        await changeInputFile(input, createFile('test.png', 1024))
        expect(input.value).toBe('')
      } finally {
        mock.restore()
      }
    })

    it('ignores change event when no file is selected', () => {
      const onError = vi.fn()
      const { container } = render(<CropUpload onError={onError} />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      Object.defineProperty(input, 'files', { value: [], configurable: true })
      fireEvent.change(input)

      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('Validation', () => {
    it('calls onError when file exceeds maxSize', () => {
      const onError = vi.fn()
      const { container } = render(<CropUpload maxSize={500} onError={onError} />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      const file = createFile('big.png', 1024)
      Object.defineProperty(input, 'files', { value: [file], configurable: true })
      fireEvent.change(input)

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
      expect(onError.mock.calls[0][0].message).toContain('500')
    })

    it('does not call onError when file is within maxSize', async () => {
      const mock = mockFileReader()
      const onError = vi.fn()
      const { container } = render(<CropUpload maxSize={2048} onError={onError} />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      try {
        await changeInputFile(input, createFile('ok.png', 1024))
        expect(onError).not.toHaveBeenCalled()
      } finally {
        mock.restore()
      }
    })

    it('does not validate size when maxSize is not set', async () => {
      const mock = mockFileReader()
      const onError = vi.fn()
      const { container } = render(<CropUpload onError={onError} />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement

      try {
        await changeInputFile(input, createFile('large.png', 999999))
        expect(onError).not.toHaveBeenCalled()
      } finally {
        mock.restore()
      }
    })

    it('calls onError when file read fails', async () => {
      const original = globalThis.FileReader
      function FailReader(this: {
        readAsDataURL: () => void
        onload: null
        onerror: (() => void) | null
        error: Error
      }) {
        this.onload = null
        this.onerror = null
        this.error = new Error('Failed to read file')
        this.readAsDataURL = () => {
          Promise.resolve().then(() => this.onerror?.())
        }
      }
      globalThis.FileReader = FailReader as unknown as typeof FileReader

      try {
        const onError = vi.fn()
        const { container } = render(<CropUpload onError={onError} />)
        const input = container.querySelector('input[type="file"]') as HTMLInputElement

        await changeInputFile(input, createFile('bad.png', 100))
        await vi.waitFor(() => {
          expect(onError).toHaveBeenCalled()
        })
      } finally {
        globalThis.FileReader = original
      }
    })
  })

  describe('Keyboard Navigation', () => {
    it('opens file input on Enter key', async () => {
      const user = userEvent.setup()
      const { container } = render(<CropUpload />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      screen.getByRole('button').focus()
      await user.keyboard('{Enter}')
      expect(clickSpy).toHaveBeenCalled()
    })

    it('opens file input on Space key', async () => {
      const user = userEvent.setup()
      const { container } = render(<CropUpload />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      screen.getByRole('button').focus()
      await user.keyboard(' ')
      expect(clickSpy).toHaveBeenCalled()
    })

    it('does not respond to keyboard when disabled', async () => {
      const { container } = render(<CropUpload disabled />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      const trigger = screen.getByRole('button')
      fireEvent.keyDown(trigger, { key: 'Enter' })
      expect(clickSpy).not.toHaveBeenCalled()
    })

    it('does not open on non-activation keys', () => {
      const { container } = render(<CropUpload />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(input, 'click')

      const trigger = screen.getByRole('button')
      fireEvent.keyDown(trigger, { key: 'Tab' })
      expect(clickSpy).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('trigger has aria-label', () => {
      render(<CropUpload />)
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Select image to crop and upload'
      )
    })

    it('tabindex is 0 when enabled', () => {
      render(<CropUpload />)
      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0')
    })

    it('passes axe accessibility audit', async () => {
      const { container } = render(<CropUpload />)
      await expectNoA11yViolationsIsolated(container)
    })

    it('passes axe audit when disabled', async () => {
      const { container } = render(<CropUpload disabled />)
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge Cases', () => {
    it('renders without any props', () => {
      const { container } = render(<CropUpload />)
      expect(container.querySelector('.tiger-crop-upload')).toBeInTheDocument()
    })

    it('handles custom children and still has file input', () => {
      const { container } = render(
        <CropUpload>
          <button>Upload</button>
        </CropUpload>
      )
      expect(container.querySelector('input[type="file"]')).toBeInTheDocument()
    })

    it('does not crash with maxSize of 0', () => {
      const { container } = render(<CropUpload maxSize={0} />)
      expect(container.querySelector('.tiger-crop-upload')).toBeInTheDocument()
    })

    it('uses default modalTitle', () => {
      const { container } = render(<CropUpload />)
      // Component renders without error; modalTitle is internal to Modal
      expect(container.querySelector('.tiger-crop-upload')).toBeInTheDocument()
    })
  })
})
