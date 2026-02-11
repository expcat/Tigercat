/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { CropUpload } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'

describe('CropUpload', () => {
  it('renders trigger button', () => {
    const { container } = render(CropUpload)

    const trigger = container.querySelector('[role="button"]')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-label', 'Select image to crop and upload')
  })

  it('renders default trigger text', () => {
    const { container } = render(CropUpload)

    expect(container.textContent).toContain('选择图片')
  })

  it('renders custom slot content', () => {
    const { container } = render(CropUpload, {
      slots: {
        default: '<span data-testid="custom">Custom Trigger</span>'
      }
    })

    expect(container.querySelector('[data-testid="custom"]')).toBeInTheDocument()
  })

  it('has hidden file input', () => {
    const { container } = render(CropUpload)

    const input = container.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('accept', 'image/*')
    expect((input as HTMLElement).style.display).toBe('none')
  })

  it('respects custom accept prop', () => {
    const { container } = render(CropUpload, {
      props: {
        accept: '.png,.jpg'
      }
    })

    const input = container.querySelector('input[type="file"]')
    expect(input).toHaveAttribute('accept', '.png,.jpg')
  })

  it('applies disabled state', () => {
    const { container } = render(CropUpload, {
      props: {
        disabled: true
      }
    })

    const trigger = container.querySelector('[role="button"]')
    expect(trigger).toHaveAttribute('aria-disabled', 'true')
    expect(trigger).toHaveAttribute('tabindex', '-1')
  })

  it('is keyboard accessible when enabled', () => {
    const { container } = render(CropUpload)

    const trigger = container.querySelector('[role="button"]')
    expect(trigger).toHaveAttribute('tabindex', '0')
  })

  it('passes accessibility checks', async () => {
    const { container } = render(CropUpload)
    await expectNoA11yViolations(container)
  })
})
