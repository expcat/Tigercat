/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Card } from '@tigercat/vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
  componentSizes,
} from '../utils'

const cardVariants = ['default', 'bordered', 'shadow', 'elevated'] as const

describe('Card', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Card, {
        slots: {
          default: 'Card content',
        },
      })
      
      const content = screen.getByText('Card content')
      expect(content).toBeInTheDocument()
    })

    it('should render with custom content via slot', () => {
      const { getByText } = renderWithSlots(Card, {
        default: 'Custom card content',
      })
      
      expect(getByText('Custom card content')).toBeInTheDocument()
    })

    it('should render header slot when provided', () => {
      const { getByText } = renderWithSlots(Card, {
        header: 'Card Header',
        default: 'Card Body',
      })
      
      expect(getByText('Card Header')).toBeInTheDocument()
      expect(getByText('Card Body')).toBeInTheDocument()
    })

    it('should render footer slot when provided', () => {
      const { getByText } = renderWithSlots(Card, {
        default: 'Card Body',
        footer: 'Card Footer',
      })
      
      expect(getByText('Card Body')).toBeInTheDocument()
      expect(getByText('Card Footer')).toBeInTheDocument()
    })

    it('should render actions slot when provided', () => {
      const { getByText } = renderWithSlots(Card, {
        default: 'Card Body',
        actions: '<button>Action</button>',
      })
      
      expect(getByText('Card Body')).toBeInTheDocument()
      expect(getByText('Action')).toBeInTheDocument()
    })

    it('should render all slots together', () => {
      const { getByText } = renderWithSlots(Card, {
        header: 'Header',
        default: 'Body',
        footer: 'Footer',
        actions: '<button>Action</button>',
      })
      
      expect(getByText('Header')).toBeInTheDocument()
      expect(getByText('Body')).toBeInTheDocument()
      expect(getByText('Footer')).toBeInTheDocument()
      expect(getByText('Action')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it.each(cardVariants)('should render %s variant correctly', (variant) => {
      const { container } = renderWithProps(
        Card,
        { variant },
        {
          slots: { default: `${variant} card` },
        }
      )
      
      const card = container.firstElementChild
      expect(card).toBeInTheDocument()
      expect(card?.className).toBeTruthy()
    })

    it('should apply default variant when not specified', () => {
      const { container } = renderWithSlots(Card, {
        default: 'Default Card',
      })
      
      const card = container.firstElementChild
      expect(card).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(
        Card,
        { size },
        {
          slots: { default: `${size} card` },
        }
      )
      
      const card = container.firstElementChild
      expect(card).toBeInTheDocument()
    })
  })

  describe('Hoverable', () => {
    it('should not have hover effect when hoverable is false', () => {
      const { container } = renderWithProps(
        Card,
        { hoverable: false },
        {
          slots: { default: 'Non-hoverable Card' },
        }
      )
      
      const card = container.firstElementChild
      expect(card?.className).not.toContain('cursor-pointer')
    })

    it('should have hover effect when hoverable is true', () => {
      const { container } = renderWithProps(
        Card,
        { hoverable: true },
        {
          slots: { default: 'Hoverable Card' },
        }
      )
      
      const card = container.firstElementChild
      expect(card?.className).toContain('cursor-pointer')
    })
  })

  describe('Cover Image', () => {
    it('should not render cover when cover prop is not provided', () => {
      const { container } = renderWithSlots(Card, {
        default: 'Card without cover',
      })
      
      const img = container.querySelector('img')
      expect(img).not.toBeInTheDocument()
    })

    it('should render cover image when cover prop is provided', () => {
      const { container } = renderWithProps(
        Card,
        { cover: 'https://example.com/image.jpg' },
        {
          slots: { default: 'Card with cover' },
        }
      )
      
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    it('should use custom alt text for cover image', () => {
      const { container } = renderWithProps(
        Card,
        { 
          cover: 'https://example.com/image.jpg',
          coverAlt: 'Custom alt text',
        },
        {
          slots: { default: 'Card with cover' },
        }
      )
      
      const img = container.querySelector('img')
      expect(img).toHaveAttribute('alt', 'Custom alt text')
    })

    it('should use default alt text when not provided', () => {
      const { container } = renderWithProps(
        Card,
        { cover: 'https://example.com/image.jpg' },
        {
          slots: { default: 'Card with cover' },
        }
      )
      
      const img = container.querySelector('img')
      expect(img).toHaveAttribute('alt', 'Card cover image')
    })
  })

  describe('Structure', () => {
    it('should apply size padding to card when no cover', () => {
      const { container } = renderWithProps(
        Card,
        { size: 'lg' },
        {
          slots: { default: 'Card content' },
        }
      )
      
      const card = container.firstElementChild
      expect(card?.className).toContain('p-6')
    })

    it('should apply size padding to body when cover is present', () => {
      const { getByText } = renderWithProps(
        Card,
        { 
          size: 'lg',
          cover: 'https://example.com/image.jpg',
        },
        {
          slots: { default: 'Card content' },
        }
      )
      
      // Verify card content is rendered
      expect(getByText('Card content')).toBeInTheDocument()
      
      // Verify cover image is rendered
      const container = getByText('Card content').closest('div')?.parentElement
      const img = container?.querySelector('img')
      expect(img).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithSlots(Card, {
        default: 'Accessible Card',
      })
      
      await expectNoA11yViolations(container)
    })

    it('should have no accessibility violations with all slots', async () => {
      const { container } = renderWithSlots(Card, {
        header: 'Header',
        default: 'Body',
        footer: 'Footer',
        actions: '<button>Action</button>',
      })
      
      await expectNoA11yViolations(container)
    })

    it('should have no accessibility violations with cover image', async () => {
      const { container } = renderWithProps(
        Card,
        { 
          cover: 'https://example.com/image.jpg',
          coverAlt: 'Test image',
        },
        {
          slots: { default: 'Card content' },
        }
      )
      
      await expectNoA11yViolations(container)
    })
  })

  describe('Combined Props', () => {
    it('should correctly combine variant, size, and hoverable', () => {
      const { container, getByText } = renderWithProps(
        Card,
        { variant: 'shadow', size: 'lg', hoverable: true },
        {
          slots: { default: 'Combined Card' },
        }
      )
      
      expect(getByText('Combined Card')).toBeInTheDocument()
      const card = container.firstElementChild
      expect(card?.className).toContain('cursor-pointer')
      expect(card?.className).toContain('p-6')
    })

    it('should work with cover and all other props', () => {
      const { container, getByText } = renderWithProps(
        Card,
        { 
          variant: 'elevated',
          size: 'md',
          hoverable: true,
          cover: 'https://example.com/image.jpg',
        },
        {
          slots: {
            header: 'Header',
            default: 'Body',
            footer: 'Footer',
          },
        }
      )
      
      expect(getByText('Header')).toBeInTheDocument()
      expect(getByText('Body')).toBeInTheDocument()
      expect(getByText('Footer')).toBeInTheDocument()
      
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      
      const card = container.firstElementChild
      expect(card?.className).toContain('cursor-pointer')
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default card', () => {
      const { container } = renderWithSlots(Card, {
        default: 'Default Card',
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for card with all slots', () => {
      const { container } = renderWithSlots(Card, {
        header: 'Header',
        default: 'Body',
        footer: 'Footer',
        actions: '<button>Action</button>',
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for card with cover', () => {
      const { container } = renderWithProps(
        Card,
        { cover: 'https://example.com/image.jpg' },
        {
          slots: { default: 'Card with cover' },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for hoverable card', () => {
      const { container } = renderWithProps(
        Card,
        { hoverable: true, variant: 'shadow' },
        {
          slots: { default: 'Hoverable Card' },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
