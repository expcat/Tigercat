/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { Result } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('Result (Vue)', () => {
  describe('Rendering', () => {
    it('renders with role=status', () => {
      render(Result, { props: { status: 'success', title: 'Done' } })
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders title', () => {
      render(Result, { props: { title: 'Operation Complete' } })
      expect(screen.getByText('Operation Complete')).toBeInTheDocument()
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
    it('renders error status', () => {
      render(Result, { props: { status: 'error', title: 'Failed' } })
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })

    it('renders warning status', () => {
      render(Result, { props: { status: 'warning', title: 'Warn' } })
      expect(screen.getByText('Warn')).toBeInTheDocument()
    })

    it('renders info status (default)', () => {
      render(Result, { props: { title: 'Info' } })
      expect(screen.getByText('Info')).toBeInTheDocument()
    })

    it('renders 404 status with HTTP label', () => {
      render(Result, { props: { status: '404', title: 'Not Found' } })
      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText('Not Found')).toBeInTheDocument()
    })

    it('renders 403 status', () => {
      render(Result, { props: { status: '403', title: 'Forbidden' } })
      expect(screen.getByText('403')).toBeInTheDocument()
    })

    it('renders 500 status', () => {
      render(Result, { props: { status: '500', title: 'Server Error' } })
      expect(screen.getByText('500')).toBeInTheDocument()
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

    it('renders title slot', () => {
      render(Result, {
        slots: {
          title: () => h('h2', 'Slot Title')
        }
      })
      expect(screen.getByText('Slot Title')).toBeInTheDocument()
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
    it('should have no accessibility violations', async () => {
      const { container } = render(Result)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {})
})
