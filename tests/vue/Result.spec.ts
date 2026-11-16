/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { RESULT_ICON_SIZE_PX } from '@expcat/tigercat-core'
import { Result } from '@expcat/tigercat-vue/Result'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('Result (Vue)', () => {
  describe('Rendering', () => {
    it('does not use a live region by default', () => {
      const { container } = render(Result, { props: { status: 'success', title: 'Done' } })
      expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('renders an inherited status on the server as info', async () => {
      for (const status of ['toString', 'constructor', '__proto__'] as const) {
        const html = await renderToString(h(Result, { status: status as 'info', title: 'Done' }))
        expect(html).toContain('Done')
        expect(html).not.toContain('function')
        expect(html).not.toContain('[object Object]')
      }
    })

    it('lets the caller opt into a role', () => {
      render(Result, {
        props: { status: 'success', title: 'Done' },
        attrs: { role: 'status' }
      })
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders title as a heading', () => {
      render(Result, { props: { title: 'Operation Complete' } })
      expect(
        screen.getByRole('heading', { name: 'Operation Complete', level: 2 })
      ).toBeInTheDocument()
    })

    it('honors headingLevel', () => {
      render(Result, { props: { title: 'Done', headingLevel: 3 } })
      expect(screen.getByRole('heading', { name: 'Done', level: 3 })).toBeInTheDocument()
    })

    it('renders subTitle', () => {
      render(Result, { props: { title: 'Done', subTitle: 'Details here' } })
      expect(screen.getByText('Details here')).toBeInTheDocument()
    })

    it('renders icon area', () => {
      const { container } = render(Result, { props: { status: 'success' } })
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Status variants', () => {
    it('renders 404 digits and hides them when a title is present', () => {
      render(Result, { props: { status: '404', title: 'Not Found' } })
      expect(screen.getByText('404')).toHaveAttribute('aria-hidden', 'true')
      expect(screen.getByRole('heading', { name: 'Not Found' })).toBeInTheDocument()
    })

    it('keeps HTTP digits as the visible name when there is no title', () => {
      render(Result, { props: { status: '404' } })
      expect(screen.getByText('404')).not.toHaveAttribute('aria-hidden')
    })

    it('does not throw on an unknown status', () => {
      expect(() => render(Result, { props: { status: 'foo', title: 'Fallback' } })).not.toThrow()
      expect(screen.getByRole('heading', { name: 'Fallback' })).toBeInTheDocument()
    })

    it('renders the status gallery including success', () => {
      const statuses = ['success', 'info', 'warning', 'error', '404', '403', '500'] as const
      render({
        components: { Result },
        setup() {
          return { statuses }
        },
        template: `
          <div>
            <Result
              v-for="status in statuses"
              :key="status"
              :status="status"
              :title="status === '404' || status === '403' || status === '500' ? undefined : status"
              sub-title="状态决定图标与配色" />
          </div>
        `
      })
      expect(screen.getByRole('heading', { name: 'success' })).toBeInTheDocument()
      expect(screen.getByText('403')).toBeInTheDocument()
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('404')).toBeInTheDocument()
    })
  })

  describe('Icon geometry', () => {
    it('keeps the icon container square', () => {
      const { container } = render(Result, { props: { status: '404' } })
      const circle = container.querySelector('span')?.parentElement as HTMLElement
      expect(circle.style.width).toBe(`${RESULT_ICON_SIZE_PX}px`)
      expect(circle.style.height).toBe(circle.style.width)
    })
  })

  describe('Slots', () => {
    it('renders icon slot', () => {
      render(Result, {
        props: { title: 'Custom' },
        slots: {
          icon: () => h('span', { 'data-testid': 'custom-icon' }, '★')
        }
      })
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('renders title slot inside the heading', () => {
      render(Result, {
        slots: {
          title: () => 'Slot Title'
        }
      })
      expect(screen.getByRole('heading', { name: 'Slot Title' })).toBeInTheDocument()
    })

    it('uses the current title slot content and falls back to the title prop', async () => {
      const { container, rerender } = render({
        components: { Result },
        props: { show: Boolean, title: String },
        template: `
          <Result status="404" :title="title">
            <template #title><span v-if="show">Not Found</span></template>
          </Result>
        `
      })

      await expectNoA11yViolationsIsolated(container)
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
      expect(screen.getByText('404')).not.toHaveAttribute('aria-hidden')

      await rerender({ show: true, title: 'Fallback title' })
      expect(screen.getByRole('heading', { name: 'Not Found' })).toBeInTheDocument()
      expect(screen.getByText('404')).toHaveAttribute('aria-hidden', 'true')

      await rerender({ show: false })
      expect(screen.getByRole('heading', { name: 'Fallback title' })).toBeInTheDocument()
      expect(screen.getByText('404')).toHaveAttribute('aria-hidden', 'true')

      await rerender({ title: undefined })
      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
      expect(screen.getByText('404')).not.toHaveAttribute('aria-hidden')
    })

    it('renders subTitle slot', () => {
      render(Result, {
        props: { title: 'T' },
        slots: {
          subTitle: () => h('p', 'Slot Sub')
        }
      })
      expect(screen.getByText('Slot Sub')).toBeInTheDocument()
    })

    it('renders extra slot (actions)', () => {
      render(Result, {
        props: { title: 'T' },
        slots: {
          extra: () => h('button', 'Retry')
        }
      })
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('renders default slot (body)', () => {
      render(Result, {
        props: { title: 'T' },
        slots: {
          default: () => h('div', 'Body content')
        }
      })
      expect(screen.getByText('Body content')).toBeInTheDocument()
    })
  })

  describe('className', () => {
    it('merges className prop', () => {
      const { container } = render(Result, { props: { className: 'my-result' } })
      expect(container.firstElementChild).toHaveClass('my-result')
    })
  })

  describe('Accessibility', () => {
    it('hides the default status SVG', () => {
      const { container } = render(Result, { props: { status: 'success', title: 'Done' } })
      expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })

    it('should have no accessibility violations for titled, empty, and a gallery', async () => {
      const titled = render(Result, { props: { status: 'success', title: '提交成功' } })
      await expectNoA11yViolationsIsolated(titled.container)

      const empty = render(Result)
      await expectNoA11yViolationsIsolated(empty.container)

      const gallery = render({
        components: { Result },
        template: `
          <div>
            <Result status="success" title="A" />
            <Result status="error" title="B" />
            <Result status="404" />
          </div>
        `
      })
      await expectNoA11yViolationsIsolated(gallery.container)
    })
  })
})
