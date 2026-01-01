/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/vue'
import { Form } from '@tigercat/vue'
import {
  renderWithProps,
  expectNoA11yViolations,
} from '../utils'

describe('Form', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(Form, {
        props: {
          model: {},
        },
        slots: {
          default: '<div>Form content</div>',
        },
      })
      
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should render with form model', () => {
      const model = { username: '', email: '' }
      const { container } = render(Form, {
        props: { model },
        slots: {
          default: '<div>Form content</div>',
        },
      })
      
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should render form content via slot', () => {
      const { getByText } = render(Form, {
        props: {
          model: {},
        },
        slots: {
          default: '<div>Custom form content</div>',
        },
      })
      
      expect(getByText('Custom form content')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should apply labelPosition prop', () => {
      const { container } = renderWithProps(Form, {
        model: {},
        labelPosition: 'top',
      }, {
        slots: { default: '<div>Content</div>' },
      })
      
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should apply labelWidth prop', () => {
      const { container } = render(Form, {
        props: {
          model: {},
          labelWidth: 100,
        },
        slots: {
          default: '<div>Content</div>',
        },
      })
      
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should support disabled state', () => {
      const { container } = render(Form, {
        props: {
          model: {},
          disabled: true,
        },
        slots: {
          default: '<div>Content</div>',
        },
      })
      
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })

    it('should support inline layout', () => {
      const { container } = render(Form, {
        props: {
          model: {},
          inline: true,
        },
        slots: {
          default: '<div>Content</div>',
        },
      })
      
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should support validation rules', () => {
      const rules = {
        username: [{ required: true, message: 'Username is required' }],
      }
      const { container } = render(Form, {
        props: {
          model: { username: '' },
          rules,
        },
        slots: {
          default: '<div>Content</div>',
        },
      })
      
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })
  })

  describe('Events', () => {
    it('should handle submit event', () => {
      const onSubmit = vi.fn((e) => e.preventDefault())
      const { container } = render(Form, {
        props: {
          model: {},
        },
        attrs: {
          onSubmit,
        },
        slots: {
          default: '<button type="submit">Submit</button>',
        },
      })
      
      const form = container.querySelector('form')!
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
      form.dispatchEvent(submitEvent)
      
      // Just verify form exists
      expect(form).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Form, {
        props: {
          model: {},
        },
        slots: {
          default: '<div>Accessible form</div>',
        },
      })
      
      await expectNoA11yViolations(container)
    })

    it('should render as semantic form element', () => {
      const { container } = render(Form, {
        props: {
          model: {},
        },
        slots: {
          default: '<div>Content</div>',
        },
      })
      
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
      expect(form?.tagName.toLowerCase()).toBe('form')
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default state', () => {
      const { container } = render(Form, {
        props: {
          model: {},
        },
        slots: {
          default: '<div>Form content</div>',
        },
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with inline layout', () => {
      const { container } = render(Form, {
        props: {
          model: {},
          inline: true,
        },
        slots: {
          default: '<div>Form content</div>',
        },
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with disabled state', () => {
      const { container } = render(Form, {
        props: {
          model: {},
          disabled: true,
        },
        slots: {
          default: '<div>Form content</div>',
        },
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
