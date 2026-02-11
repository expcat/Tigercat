/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import { ImageGroup, Image } from '@expcat/tigercat-vue'

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
})
