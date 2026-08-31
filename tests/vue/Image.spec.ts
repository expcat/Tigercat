/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import { Image } from '@expcat/tigercat-vue/Image'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { expectNoA11yViolationsIsolated } from '../utils'
import { MockIntersectionObserver } from '../utils/mock-observers'

describe('Image', () => {
  it('renders image with src and keeps alt on the bitmap when preview is off', () => {
    const { container } = render(Image, {
      props: {
        src: '/test.jpg',
        alt: 'Test image',
        width: 200,
        height: 150,
        preview: false
      }
    })

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test.jpg')
    expect(img).toHaveAttribute('alt', 'Test image')
  })

  it('uses a real preview button, empty img alt, and locale name by default', () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(ConfigProvider, { locale: enUS }, () => h(Image, { src: '/test.jpg', alt: 'Harbor' }))
      }
    })
    render(Wrapper)

    const button = screen.getByRole('button', { name: 'Preview Harbor' })
    expect(button.tagName).toBe('BUTTON')
    expect(button.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('names an untitled preview from locale, including zh-CN', async () => {
    const Wrapper = defineComponent({
      props: { locale: { type: Object, required: true } },
      setup(props) {
        return () =>
          h(ConfigProvider, { locale: props.locale }, () => h(Image, { src: '/test.jpg' }))
      }
    })

    const { rerender } = render(Wrapper, { props: { locale: enUS } })
    expect(screen.getByRole('button', { name: 'Preview image' })).toBeInTheDocument()

    await rerender({ locale: zhCN })
    expect(screen.getByRole('button', { name: '预览 图片' })).toBeInTheDocument()
  })

  it('applies object-fit class based on fit prop', () => {
    const { container } = render(Image, {
      props: { src: '/test.jpg', fit: 'contain', preview: false }
    })

    const img = container.querySelector('img')
    expect(img?.className).toContain('object-contain')
  })

  it('shows error placeholder when image fails to load', async () => {
    const { container } = render(Image, {
      props: { src: '/broken.jpg', alt: 'Broken image', preview: false }
    })

    await fireEvent.error(container.querySelector('img') as Element)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('uses fallback src when image fails', async () => {
    const { container } = render(Image, {
      props: { src: '/broken.jpg', fallbackSrc: '/fallback.jpg', alt: 'Image', preview: false }
    })

    expect(container.querySelector('img')).toHaveAttribute('src', '/broken.jpg')
    await fireEvent.error(container.querySelector('img') as Element)
    expect(container.querySelector('img')).toHaveAttribute('src', '/fallback.jpg')
  })

  it('shows the error slot when fallback also fails', async () => {
    const { container } = render(Image, {
      props: { src: '/broken.jpg', fallbackSrc: '/also-broken.jpg', preview: false },
      slots: { error: () => h('div', { 'data-testid': 'custom-error' }, 'Error!') }
    })

    await fireEvent.error(container.querySelector('img') as Element)
    await fireEvent.error(container.querySelector('img') as Element)

    expect(screen.getByTestId('custom-error')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('shows the loading placeholder while a new src is fetching', async () => {
    const { container, rerender } = render(Image, {
      props: { src: '/first.jpg', preview: false },
      slots: { placeholder: () => h('div', { 'data-testid': 'ph' }, 'loading') }
    })

    await fireEvent.load(container.querySelector('img') as Element)
    expect(screen.queryByTestId('ph')).not.toBeInTheDocument()

    await rerender({ src: '/second.jpg', preview: false })
    expect(screen.getByTestId('ph')).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', '/second.jpg')
  })

  it('does not render a preview button when preview is disabled', () => {
    render(Image, { props: { src: '/test.jpg', preview: false } })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('applies width and height styles', () => {
    const { container } = render(Image, {
      props: { src: '/test.jpg', width: 300, height: '200px', preview: false }
    })

    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.width).toBe('300px')
    expect(wrapper.style.height).toBe('200px')
  })

  it('merges className', () => {
    const { container } = render(Image, {
      props: { src: '/test.jpg', className: 'custom-image', preview: false }
    })

    expect(container.firstElementChild?.className).toContain('custom-image')
  })

  it('emits load event when image loads', async () => {
    const { container, emitted } = render(Image, { props: { src: '/test.jpg', preview: false } })
    await fireEvent.load(container.querySelector('img') as Element)
    expect(emitted()).toHaveProperty('load')
  })

  it('emits error event when image fails', async () => {
    const { container, emitted } = render(Image, {
      props: { src: '/broken.jpg', preview: false }
    })
    await fireEvent.error(container.querySelector('img') as Element)
    expect(emitted()).toHaveProperty('error')
  })

  it('forwards click to the caller and lands srcSet on the img', async () => {
    const onClick = vi.fn()
    const { container } = render(Image, {
      props: { src: '/test.jpg', srcSet: '/test.jpg 1x, /test-2x.jpg 2x' },
      attrs: { onClick }
    })

    expect(container.querySelector('img')).toHaveAttribute(
      'srcset',
      '/test.jpg 1x, /test-2x.jpg 2x'
    )
    await fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not open preview when the user click is defaultPrevented', async () => {
    const { emitted } = render(Image, {
      props: { src: '/test.jpg' },
      attrs: {
        onClick: (event: MouseEvent) => {
          event.preventDefault()
        }
      }
    })

    await fireEvent.click(screen.getByRole('button'))
    expect(emitted()['preview-open-change']).toBeUndefined()
  })

  it('emits preview-open-change when preview opens', async () => {
    const { emitted } = render(Image, { props: { src: '/test.jpg' } })
    await fireEvent.click(screen.getByRole('button'))
    expect(emitted()['preview-open-change'][0]).toEqual([true])
  })

  it('emits preview-open-change when standalone preview closes', async () => {
    const { emitted } = render(Image, { props: { src: '/test.jpg' } })
    await fireEvent.click(screen.getByRole('button'))
    await fireEvent.click(document.querySelector('[aria-label="Close preview"]') as HTMLElement)
    expect(emitted()['preview-open-change'][1]).toEqual([false])
  })

  it('opens a hover overlay on focus as well as pointer enter', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      render(Image, { props: { src: '/hover.jpg', alt: 'Hover', previewTrigger: 'hover' } })
      const button = screen.getByRole('button')

      await fireEvent.focus(button)
      await waitFor(() => {
        expect(document.querySelectorAll('img[src="/hover.jpg"]').length).toBeGreaterThanOrEqual(2)
      })

      await fireEvent.click(button)
      expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('uses the successful fallback url for hover preview', async () => {
    const { container } = render(Image, {
      props: {
        src: '/broken.jpg',
        fallbackSrc: '/fallback.jpg',
        alt: 'Harbor',
        previewTrigger: 'hover'
      }
    })

    await fireEvent.error(container.querySelector('img') as Element)
    await fireEvent.focus(screen.getByRole('button'))
    await waitFor(() => {
      expect(document.querySelectorAll('img[src="/fallback.jpg"]').length).toBeGreaterThanOrEqual(2)
    })
  })

  it('passes accessibility checks for the default preview', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(ConfigProvider, { locale: enUS }, () =>
            h(Image, { src: '/test.jpg', alt: 'Accessible image' })
          )
      }
    })
    const { container } = render(Wrapper)
    await expectNoA11yViolationsIsolated(container)
  })

  it('updates the rendered image when src changes', async () => {
    const { container, rerender } = render(Image, {
      props: { src: '/first.jpg', preview: false }
    })

    expect(container.querySelector('img')).toHaveAttribute('src', '/first.jpg')
    await rerender({ src: '/second.jpg', preview: false })
    expect(container.querySelector('img')).toHaveAttribute('src', '/second.jpg')
  })
})

describe('Image lazy loading', () => {
  beforeEach(() => {
    MockIntersectionObserver.reset()
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    MockIntersectionObserver.reset()
  })

  it('clears error and loads the new src when a lazy image changes', async () => {
    const { container, rerender } = render(Image, {
      props: { src: '/broken.jpg', lazy: true, preview: false },
      slots: { error: () => h('div', { 'data-testid': 'err' }, 'err') }
    })

    await waitFor(() => expect(MockIntersectionObserver.instances.length).toBeGreaterThan(0))
    MockIntersectionObserver.instances[0]?.trigger({
      isIntersecting: true,
      intersectionRatio: 1
    })
    await waitFor(() => expect(container.querySelector('img')).toBeTruthy())

    await fireEvent.error(container.querySelector('img') as Element)
    expect(screen.getByTestId('err')).toBeInTheDocument()

    await rerender({ src: '/ok.jpg', lazy: true, preview: false })
    expect(screen.queryByTestId('err')).not.toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', '/ok.jpg')
  })
})
