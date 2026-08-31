/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { defineComponent, h, ref } from 'vue'
import { Image } from '@expcat/tigercat-vue/Image'
import { ImageGroup } from '@expcat/tigercat-vue/ImageGroup'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('ImageGroup', () => {
  it('renders children in a named group container', () => {
    const { container } = render(ImageGroup, {
      slots: {
        default: () => [h('div', { 'data-testid': 'child' }, 'child')]
      }
    })

    const group = container.querySelector('[role="group"]')
    expect(group).toBeInTheDocument()
    expect(group).toHaveAttribute('aria-label')
    expect(group?.querySelector('[data-testid="child"]')).toBeInTheDocument()
  })

  it('merges class and className onto the group root with the base class', () => {
    const { container } = render(ImageGroup, {
      props: { className: 'from-prop' },
      attrs: { class: 'from-attr' },
      slots: { default: () => [h('span', 'test')] }
    })

    const group = container.querySelector('[role="group"]')
    expect(group?.className).toContain('tiger-image-group')
    expect(group?.className).toContain('from-prop')
    expect(group?.className).toContain('from-attr')
  })

  it('renders Image children', () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(ImageGroup, null, {
            default: () => [
              h(Image, { src: '/img1.jpg', alt: 'Image 1' }),
              h(Image, { src: '/img2.jpg', alt: 'Image 2' })
            ]
          })
      }
    })

    const { container } = render(Wrapper)
    expect(container.querySelectorAll('img')).toHaveLength(2)
  })

  it('emits preview-open-change when group preview opens', async () => {
    const onPreviewOpenChange = vi.fn()
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(
            ImageGroup,
            { onPreviewOpenChange },
            {
              default: () => [h(Image, { src: '/img1.jpg', alt: 'Image 1' })]
            }
          )
      }
    })

    render(Wrapper)
    await fireEvent.click(screen.getByRole('button'))
    expect(onPreviewOpenChange).toHaveBeenCalledWith(true)
  })

  it('does not turn child images into buttons when group preview is off', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(ImageGroup, { preview: false }, () =>
            h(Image, { src: '/img-disabled.jpg', alt: 'Disabled preview', preview: true })
          )
      }
    })

    render(Wrapper)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    await fireEvent.click(screen.getByAltText('Disabled preview'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('follows a child src change in the preview list', async () => {
    const Wrapper = defineComponent({
      setup() {
        const src = ref('/old.jpg')
        return () =>
          h('div', [
            h('button', { type: 'button', onClick: () => (src.value = '/new.jpg') }, 'change-src'),
            h(ImageGroup, null, {
              default: () => [h(Image, { src: src.value, alt: 'Swap' })]
            })
          ])
      }
    })

    render(Wrapper)
    await fireEvent.click(screen.getByRole('button', { name: 'change-src' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Preview Swap' }))

    await waitFor(() => {
      const dialogImg = document.querySelector('[role="dialog"] img')
      expect(dialogImg).toHaveAttribute('src', '/new.jpg')
    })
  })

  it('keeps the remaining duplicate src after the first unmounts', async () => {
    const Wrapper = defineComponent({
      setup() {
        const showFirst = ref(true)
        return () =>
          h('div', [
            h(
              'button',
              { type: 'button', onClick: () => (showFirst.value = false) },
              'remove-first'
            ),
            h(ImageGroup, null, {
              default: () => [
                showFirst.value ? h(Image, { src: '/same.jpg', alt: 'First' }) : null,
                h(Image, { src: '/same.jpg', alt: 'Second' })
              ]
            })
          ])
      }
    })

    render(Wrapper)
    await fireEvent.click(screen.getByRole('button', { name: 'remove-first' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Preview Second' }))

    await waitFor(() => {
      const dialogImgs = document.querySelectorAll('[role="dialog"] img')
      expect(dialogImgs).toHaveLength(1)
      expect(dialogImgs[0]).toHaveAttribute('src', '/same.jpg')
    })
  })

  it('forwards attrs class to group container', () => {
    const { container } = render(ImageGroup, {
      attrs: { class: 'attrs-class' },
      slots: { default: () => [h('span', 'test')] }
    })

    const group = container.querySelector('[role="group"]')
    expect(group?.className).toContain('tiger-image-group')
    expect(group?.className).toContain('attrs-class')
  })

  it('renders non-Image children correctly', () => {
    const { container } = render(ImageGroup, {
      slots: {
        default: () => [h('div', { class: 'custom-child' }, 'Custom Content'), h('p', 'Paragraph')]
      }
    })

    expect(container.querySelector('.custom-child')).toBeInTheDocument()
    expect(container.querySelector('p')).toBeInTheDocument()
  })

  it('preserves child order in the group', () => {
    const { container } = render(ImageGroup, {
      slots: {
        default: () => [
          h('span', { 'data-order': '1' }, 'First'),
          h('span', { 'data-order': '2' }, 'Second'),
          h('span', { 'data-order': '3' }, 'Third')
        ]
      }
    })

    const spans = container.querySelectorAll('span')
    expect(spans[0]?.textContent).toBe('First')
    expect(spans[1]?.textContent).toBe('Second')
    expect(spans[2]?.textContent).toBe('Third')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const Wrapper = defineComponent({
        setup() {
          return () =>
            h(ImageGroup, null, {
              default: () => [h(Image, { src: '/img1.jpg', alt: 'Image 1' })]
            })
        }
      })
      const { container } = render(Wrapper)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
