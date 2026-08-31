/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { CropUpload } from '@expcat/tigercat-react/CropUpload'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolations } from '../utils/react'

function createFile(name: string, size: number, type = 'image/png'): File {
  const content = new ArrayBuffer(size)
  return new File([content], name, { type })
}

async function changeInputFile(input: HTMLInputElement, file: File): Promise<void> {
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  await act(async () => {
    fireEvent.change(input)
    await Promise.resolve()
  })
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
    it('renders a labelled file trigger', () => {
      render(<CropUpload />)
      expect(screen.getByText('Select image')).toBeInTheDocument()
      expect(screen.getByLabelText('Select image to crop and upload')).toBeInTheDocument()
    })

    it('uses component locale for default trigger text', () => {
      render(<CropUpload locale={zhCN} />)
      expect(screen.getByText('选择图片')).toBeInTheDocument()
    })

    it('does not override custom children with the default aria-label', () => {
      render(
        <CropUpload>
          <span>上传头像</span>
        </CropUpload>
      )
      expect(screen.getByText('上传头像')).toBeInTheDocument()
      expect(screen.queryByLabelText('Select image to crop and upload')).not.toBeInTheDocument()
    })

    it('applies accept filter to file input', () => {
      const { container } = render(<CropUpload accept="image/png" />)
      expect(container.querySelector('input[type="file"]')).toHaveAttribute('accept', 'image/png')
    })

    it('disables the hidden file input when disabled', () => {
      const { container } = render(<CropUpload disabled />)
      expect(container.querySelector('input[type="file"]')).toBeDisabled()
    })
  })

  describe('File Selection', () => {
    it('opens the crop modal after a valid image is selected', async () => {
      const { container } = render(<CropUpload />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      await changeInputFile(input, createFile('avatar.png', 32))
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(screen.getByText('Crop image')).toBeInTheDocument()
    })

    it('calls onError for oversize files and does not open the modal', async () => {
      const onError = vi.fn()
      const { container } = render(<CropUpload maxSize={10} onError={onError} />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      await changeInputFile(input, createFile('big.png', 40))
      expect(onError).toHaveBeenCalled()
      expect(screen.queryByText('Crop image')).not.toBeInTheDocument()
    })

    it('revokes the previous object URL when selecting another file', async () => {
      const { container } = render(<CropUpload />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      await changeInputFile(input, createFile('a.png', 8))
      await changeInputFile(input, createFile('b.png', 8))
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:crop')
    })

    it('keeps confirm disabled until the cropper is ready', async () => {
      const { container } = render(<CropUpload />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      await changeInputFile(input, createFile('avatar.png', 32))
      const confirm = screen.getByRole('button', { name: 'Confirm crop' })
      expect(confirm).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('passes axe on the default trigger', async () => {
      const { container } = render(<CropUpload />)
      await expectNoA11yViolations(container)
    })
  })
})
