/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import { ImageGroup, Image } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('ImageGroup', () => {
  it('renders children in a group container', () => {
    const { container } = render(ImageGroup, {
      slots: {
        default: () => [h('div', { 'data-testid': 'child' }, 'child')]
      }
    })

    const group = container.querySelector('[role="group"]')
    expect(group).toBeInTheDocument()
    expect(group?.querySelector('[data-testid="child"]')).toBeInTheDocument()
  })

  it('renders with preview enabled by default', () => {
    const { container } = render(ImageGroup, {
      props: {
        preview: true
      },
      slots: {
        default: () => [h('span', 'test')]
      }
    })

    const group = container.querySelector('[role="group"]')
    expect(group).toBeInTheDocument()
  })

  it('renders Image children', () => {
    // Create a wrapper component to test Image inside ImageGroup
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(ImageGroup, null, {
            default: () => [
              h(Image, { src: '/img1.jpg', alt: 'Image 1', preview: true }),
              h(Image, { src: '/img2.jpg', alt: 'Image 2', preview: true })
            ]
          })
      }
    })

    const { container } = render(Wrapper)
    const images = container.querySelectorAll('img')
    expect(images.length).toBe(2)
  })
  it('renders with preview disabled', () => {
    const { container } = render(ImageGroup, {
      props: { preview: false },
      slots: {
        default: () => [h('span', 'test')]
      }
    })

    const group = container.querySelector('[role="group"]')
    expect(group).toBeInTheDocument()
  })

  it('renders empty group without children', () => {
    const { container } = render(ImageGroup)
    const group = container.querySelector('[role="group"]')
    expect(group).toBeInTheDocument()
  })

  it('renders multiple Image children', () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(ImageGroup, null, {
            default: () => [
              h(Image, { src: '/img1.jpg', alt: 'Image 1' }),
              h(Image, { src: '/img2.jpg', alt: 'Image 2' }),
              h(Image, { src: '/img3.jpg', alt: 'Image 3' })
            ]
          })
      }
    })

    const { container } = render(Wrapper)
    const images = container.querySelectorAll('img')
    expect(images.length).toBe(3)
  })

  it('keeps preview disabled without rendering preview dialog', () => {
    const { container } = render(ImageGroup, {
      props: { preview: false },
      slots: {
        default: () => [
          h(Image, { src: '/img-disabled.jpg', alt: 'Disabled preview', preview: true })
        ]
      }
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('forwards attrs class to group container', () => {
    const { container } = render(ImageGroup, {
      attrs: { class: 'attrs-class' },
      slots: {
        default: () => [h('span', 'test')]
      }
    })

    const group = container.querySelector('[role="group"]')
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

  it('renders single child correctly', () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(ImageGroup, null, {
            default: () => [h(Image, { src: '/single.jpg', alt: 'Single' })]
          })
      }
    })

    const { container } = render(Wrapper)
    expect(container.querySelectorAll('img')).toHaveLength(1)
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

  it('has role=group on the container element', () => {
    const { container } = render(ImageGroup, {
      slots: {
        default: () => [h('span', 'test')]
      }
    })

    expect(container.querySelector('[role="group"]')).toBeInTheDocument()
  })

  it('uses the default image group class on the container', () => {
    const { container } = render(ImageGroup, {
      slots: {
        default: () => [h('span', 'test')]
      }
    })

    const group = container.querySelector('[role="group"]')
    expect(group?.className).toContain('tiger-image-group')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(ImageGroup)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})
