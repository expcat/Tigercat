/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { getEmptyDescription, getEmptyIllustration } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { Empty } from '@expcat/tigercat-vue/Empty'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { expectNoA11yViolationsIsolated } from '../utils'

const galleryPresets = ['default', 'simple', 'no-data', 'no-results', 'error'] as const

describe('Empty (Vue)', () => {
  describe('Rendering', () => {
    it('renders with default description', () => {
      render(Empty)
      expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('renders custom description', () => {
      render(Empty, { props: { description: 'Nothing here' } })
      expect(screen.getByText('Nothing here')).toBeInTheDocument()
    })

    it('renders default SVG illustration', () => {
      const { container } = render(Empty)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })

    it('hides the built-in illustration when showImage=false', () => {
      const { container } = render(Empty, { props: { showImage: false } })
      expect(container.querySelector('svg')).not.toBeInTheDocument()
    })
  })

  describe('Slots', () => {
    it('renders image slot instead of default SVG', () => {
      render(Empty, {
        slots: {
          image: () => h('img', { src: 'custom.png', alt: 'custom' })
        }
      })
      expect(screen.getByAltText('custom')).toBeInTheDocument()
    })

    it('keeps the image slot when showImage is false', () => {
      render(Empty, {
        props: { showImage: false },
        slots: {
          image: () => h('img', { src: 'custom.png', alt: 'kept' })
        }
      })
      expect(screen.getByAltText('kept')).toBeInTheDocument()
    })

    it('renders description slot', () => {
      render(Empty, {
        slots: {
          description: () => h('span', 'Custom desc')
        }
      })
      expect(screen.getByText('Custom desc')).toBeInTheDocument()
    })

    it('renders extra and default slots together', () => {
      render(Empty, {
        slots: {
          extra: () => h('button', 'Create'),
          default: () => h('p', 'Body text')
        }
      })
      expect(screen.getByText('Create')).toBeInTheDocument()
      expect(screen.getByText('Body text')).toBeInTheDocument()
    })
  })

  describe('className and attrs', () => {
    it('merges className prop', () => {
      const { container } = render(Empty, { props: { className: 'my-empty' } })
      expect(container.firstElementChild).toHaveClass('my-empty')
    })

    it('merges attrs class', () => {
      const { container } = render(Empty, { attrs: { class: 'extra' } })
      expect(container.firstElementChild).toHaveClass('extra')
    })
  })

  describe('Presets', () => {
    it('hides the built-in illustration for simple', () => {
      const { container } = render(Empty, { props: { preset: 'simple' } })
      expect(container.querySelector('svg')).not.toBeInTheDocument()
      expect(screen.getByText(getEmptyDescription('simple'))).toBeInTheDocument()
    })

    it('draws a different illustration for error than default', () => {
      const defaultPaths = getEmptyIllustration('default')!
        .paths.map((p) => p.d)
        .join('|')
      const { container } = render(Empty, { props: { preset: 'error' } })
      const d = [...container.querySelectorAll('path')].map((p) => p.getAttribute('d')).join('|')
      expect(d).not.toBe(defaultPaths)
    })

    it.each(galleryPresets)('renders empty/02 gallery preset "%s"', (preset) => {
      render(Empty, { props: { preset } })
      expect(screen.getByText(getEmptyDescription(preset))).toBeInTheDocument()
    })
  })

  describe('Locale', () => {
    it('uses official locale objects for default copy', () => {
      const { unmount } = render({
        components: { ConfigProvider, Empty },
        setup: () => ({ locale: zhCN }),
        template: '<ConfigProvider :locale="locale"><Empty /></ConfigProvider>'
      })
      expect(screen.getByText('暂无数据')).toBeInTheDocument()
      unmount()

      const second = render({
        components: { ConfigProvider, Empty },
        setup: () => ({ locale: zhTW }),
        template: '<ConfigProvider :locale="locale"><Empty /></ConfigProvider>'
      })
      expect(screen.getByText('暫無資料')).toBeInTheDocument()
      second.unmount()

      render({
        components: { ConfigProvider, Empty },
        setup: () => ({ locale: jaJP }),
        template: '<ConfigProvider :locale="locale"><Empty /></ConfigProvider>'
      })
      expect(screen.getByText('データなし')).toBeInTheDocument()
      expect(screen.queryByText('No data')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('hides the built-in illustration from assistive tech', () => {
      const { container } = render(Empty)
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have no accessibility violations for default, no-image, and custom image', async () => {
      const { container } = render(Empty)
      await expectNoA11yViolationsIsolated(container)

      const hidden = render(Empty, { props: { showImage: false } })
      await expectNoA11yViolationsIsolated(hidden.container)

      const custom = render(Empty, {
        slots: {
          image: () => h('img', { src: 'custom.png', alt: 'custom empty' })
        }
      })
      await expectNoA11yViolationsIsolated(custom.container)
    })
  })
})
