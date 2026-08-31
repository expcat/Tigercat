/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { CropUpload } from '@expcat/tigercat-vue/CropUpload'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolations } from '../utils'

function createFile(name: string, size: number, type = 'image/png'): File {
  const content = new ArrayBuffer(size)
  return new File([content], name, { type })
}

describe('CropUpload', () => {
  beforeEach(() => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:crop')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('renders default trigger text', () => {
      const { container } = render(CropUpload)
      expect(container.textContent).toContain('Select image')
    })

    it('uses component locale for default trigger text', () => {
      const { container } = render(CropUpload, { props: { locale: zhCN } })
      expect(container.textContent).toContain('选择图片')
    })

    it('renders custom slot content without the default aria-label', () => {
      const { container } = render(CropUpload, {
        slots: {
          default: '<span data-testid="custom">上传头像</span>'
        }
      })
      expect(container.querySelector('[data-testid="custom"]')).toBeInTheDocument()
      expect(container.querySelector('[aria-label="Select image to crop and upload"]')).toBeNull()
    })

    it('has a visually hidden file input with default accept', () => {
      const { container } = render(CropUpload)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      expect(input).toHaveAttribute('accept', 'image/*')
      expect(input.className).toContain('sr-only')
    })
  })

  describe('File Selection', () => {
    it('opens the crop modal after a valid image is selected', async () => {
      const { container, getByText } = render(CropUpload)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      Object.defineProperty(input, 'files', {
        value: [createFile('avatar.png', 32)],
        configurable: true
      })
      await fireEvent.change(input)
      expect(getByText('Crop image')).toBeInTheDocument()
    })

    it('emits error for oversize files', async () => {
      const { container, emitted, queryByText } = render(CropUpload, { props: { maxSize: 10 } })
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      Object.defineProperty(input, 'files', {
        value: [createFile('big.png', 40)],
        configurable: true
      })
      await fireEvent.change(input)
      expect(emitted().error).toBeTruthy()
      expect(queryByText('Crop image')).toBeNull()
    })
  })

  describe('Accessibility', () => {
    it('passes axe on the default trigger', async () => {
      const { container } = render(CropUpload)
      await expectNoA11yViolations(container)
    })
  })
})
