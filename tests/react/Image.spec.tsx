/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import React from 'react'
import { Image } from '@expcat/tigercat-react/Image'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { expectNoA11yViolationsIsolated } from '../utils/react'
import { MockIntersectionObserver } from '../utils/mock-observers'

describe('Image', () => {
  it('renders image with src and keeps alt on the bitmap when preview is off', () => {
    const { container } = render(
      <Image src="/test.jpg" alt="Test image" width={200} height={150} preview={false} />
    )

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test.jpg')
    expect(img).toHaveAttribute('alt', 'Test image')
  })

  it('uses a real preview button, empty img alt, and locale name by default', () => {
    render(
      <ConfigProvider locale={enUS}>
        <Image src="/test.jpg" alt="Harbor" />
      </ConfigProvider>
    )

    const button = screen.getByRole('button', { name: 'Preview Harbor' })
    expect(button.tagName).toBe('BUTTON')
    expect(button.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('names an untitled preview from locale, including zh-CN', () => {
    const { rerender } = render(
      <ConfigProvider locale={enUS}>
        <Image src="/test.jpg" />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: 'Preview image' })).toBeInTheDocument()

    rerender(
      <ConfigProvider locale={zhCN}>
        <Image src="/test.jpg" />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: '预览 图片' })).toBeInTheDocument()
  })

  it('applies object-fit class based on fit prop', () => {
    const { container } = render(<Image src="/test.jpg" fit="contain" preview={false} />)

    const img = container.querySelector('img')
    expect(img?.className).toContain('object-contain')
  })

  it('shows error placeholder when image fails to load', () => {
    const { container } = render(<Image src="/broken.jpg" alt="Broken" preview={false} />)

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    fireEvent.error(img as Element)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('uses fallback src when image fails', () => {
    const { container } = render(
      <Image src="/broken.jpg" fallbackSrc="/fallback.jpg" alt="Image" preview={false} />
    )

    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/broken.jpg')
    fireEvent.error(img as Element)

    const newImg = container.querySelector('img')
    expect(newImg).toHaveAttribute('src', '/fallback.jpg')
  })

  it('shows the error slot when fallback also fails', () => {
    const { container } = render(
      <Image
        src="/broken.jpg"
        fallbackSrc="/also-broken.jpg"
        preview={false}
        errorRender={<div data-testid="custom-error">Error!</div>}
      />
    )

    fireEvent.error(container.querySelector('img') as Element)
    fireEvent.error(container.querySelector('img') as Element)

    expect(screen.getByTestId('custom-error')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('shows the loading placeholder while a new src is fetching', () => {
    const { container, rerender } = render(
      <Image
        src="/first.jpg"
        preview={false}
        placeholderRender={<div data-testid="ph">loading</div>}
      />
    )

    fireEvent.load(container.querySelector('img') as Element)
    expect(screen.queryByTestId('ph')).not.toBeInTheDocument()

    rerender(
      <Image
        src="/second.jpg"
        preview={false}
        placeholderRender={<div data-testid="ph">loading</div>}
      />
    )

    expect(screen.getByTestId('ph')).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', '/second.jpg')
  })

  it('does not render a preview button when preview is disabled', () => {
    render(<Image src="/test.jpg" preview={false} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('applies width and height styles', () => {
    const { container } = render(
      <Image src="/test.jpg" width={300} height="200px" preview={false} />
    )

    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.width).toBe('300px')
    expect(wrapper.style.height).toBe('200px')
  })

  it('merges className', () => {
    const { container } = render(<Image src="/test.jpg" className="custom-image" preview={false} />)

    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('custom-image')
  })

  it('renders custom error content', () => {
    const { container } = render(
      <Image
        src="/broken.jpg"
        preview={false}
        errorRender={<div data-testid="custom-error">Error!</div>}
      />
    )

    fireEvent.error(container.querySelector('img') as Element)
    expect(container.querySelector('[data-testid="custom-error"]')).toBeInTheDocument()
  })

  it('calls onPreviewOpenChange when preview opens', () => {
    const onPreviewOpenChange = vi.fn()
    render(<Image src="/test.jpg" onPreviewOpenChange={onPreviewOpenChange} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onPreviewOpenChange).toHaveBeenCalledWith(true)
  })

  it('does not open preview when the user click is defaultPrevented', () => {
    const onPreviewOpenChange = vi.fn()
    render(
      <Image
        src="/test.jpg"
        onClick={(event) => event.preventDefault()}
        onPreviewOpenChange={onPreviewOpenChange}
      />
    )

    fireEvent.click(screen.getByRole('button'))
    expect(onPreviewOpenChange).not.toHaveBeenCalled()
  })

  it('calls onPreviewOpenChange when standalone preview closes', () => {
    const onPreviewOpenChange = vi.fn()
    render(<Image src="/test.jpg" onPreviewOpenChange={onPreviewOpenChange} />)

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(document.querySelector('[aria-label="Close preview"]') as HTMLElement)

    expect(onPreviewOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('forwards ref to the inner img and lands srcSet on it', () => {
    const ref = React.createRef<HTMLImageElement>()
    const onLoad = vi.fn()
    render(
      <Image
        ref={ref}
        src="/test.jpg"
        srcSet="/test.jpg 1x, /test-2x.jpg 2x"
        preview={false}
        onLoad={onLoad}
      />
    )

    expect(ref.current).toBeInstanceOf(HTMLImageElement)
    expect(ref.current).toHaveAttribute('srcset', '/test.jpg 1x, /test-2x.jpg 2x')
    expect(typeof ref.current?.naturalWidth).toBe('number')
    fireEvent.load(ref.current as HTMLImageElement)
    expect(onLoad).toHaveBeenCalledTimes(1)
  })

  it('opens a hover overlay on focus as well as pointer enter', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      render(<Image src="/hover.jpg" alt="Hover" previewTrigger="hover" />)
      const button = screen.getByRole('button')

      fireEvent.focus(button)
      await waitFor(() => {
        expect(document.querySelectorAll('img[src="/hover.jpg"]').length).toBeGreaterThanOrEqual(2)
      })

      fireEvent.click(button)
      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeTruthy()
      })
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('uses the successful fallback url for hover and click preview', async () => {
    render(
      <Image src="/broken.jpg" fallbackSrc="/fallback.jpg" alt="Harbor" previewTrigger="hover" />
    )
    const button = screen.getByRole('button')
    fireEvent.error(button.querySelector('img') as Element)

    fireEvent.focus(button)
    await waitFor(() => {
      const previews = document.querySelectorAll('img[src="/fallback.jpg"]')
      expect(previews.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('passes accessibility checks for the default preview', async () => {
    const { container } = render(
      <ConfigProvider locale={enUS}>
        <Image src="/test.jpg" alt="Accessible image" />
      </ConfigProvider>
    )
    await expectNoA11yViolationsIsolated(container)
  })

  it('passes accessibility checks for an untitled default preview', async () => {
    const { container } = render(
      <ConfigProvider locale={zhCN}>
        <Image src="/test.jpg" />
      </ConfigProvider>
    )
    await expectNoA11yViolationsIsolated(container)
    expect(screen.getByRole('button', { name: '预览 图片' })).toBeInTheDocument()
  })

  it('updates the rendered image when src changes', () => {
    const { container, rerender } = render(<Image src="/first.jpg" preview={false} />)

    expect(container.querySelector('img')).toHaveAttribute('src', '/first.jpg')

    rerender(<Image src="/second.jpg" preview={false} />)

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
    const { container, rerender } = render(
      <Image
        src="/broken.jpg"
        lazy
        preview={false}
        errorRender={<div data-testid="err">err</div>}
      />
    )

    await waitFor(() => expect(MockIntersectionObserver.instances.length).toBeGreaterThan(0))
    act(() => {
      MockIntersectionObserver.instances[0]?.trigger({
        isIntersecting: true,
        intersectionRatio: 1
      })
    })
    await waitFor(() => expect(container.querySelector('img')).toBeTruthy())

    fireEvent.error(container.querySelector('img') as Element)
    expect(screen.getByTestId('err')).toBeInTheDocument()

    rerender(
      <Image src="/ok.jpg" lazy preview={false} errorRender={<div data-testid="err">err</div>} />
    )

    expect(screen.queryByTestId('err')).not.toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', '/ok.jpg')
  })
})
