/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar } from '@tigercat/react'
import {
  renderWithProps,
  renderWithChildren,
  expectNoA11yViolations,
  componentSizes,
} from '../utils'

const avatarSizes = componentSizes.concat(['xl'] as const)
const avatarShapes = ['circle', 'square'] as const

describe('Avatar', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Avatar text="Test User" />)
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('aria-label', 'Test User')
    })

    it('should render as icon avatar by default when no props provided', () => {
      const { container } = renderWithProps(Avatar, {})
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('aria-label', 'avatar')
    })
  })

  describe('Sizes', () => {
    it.each(avatarSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(Avatar, {
        size,
        text: 'AB',
      })
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('Shapes', () => {
    it.each(avatarShapes)('should render %s shape correctly', (shape) => {
      const { container } = renderWithProps(Avatar, {
        shape,
        text: 'AB',
      })
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar).toBeInTheDocument()
      
      if (shape === 'circle') {
        expect(avatar?.className).toContain('rounded-full')
      } else {
        expect(avatar?.className).toContain('rounded-md')
      }
    })

    it('should render circle shape by default', () => {
      const { container } = renderWithProps(Avatar, { text: 'AB' })
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar?.className).toContain('rounded-full')
    })
  })

  describe('Image Avatar', () => {
    it('should render image avatar with src prop', () => {
      const { container } = renderWithProps(Avatar, {
        src: '/test-avatar.jpg',
        alt: 'Test User',
      })
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar).toBeInTheDocument()
      
      const img = avatar?.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/test-avatar.jpg')
      expect(img).toHaveAttribute('alt', 'Test User')
    })

    it('should use default alt text when alt is not provided', () => {
      const { container } = renderWithProps(Avatar, {
        src: '/test-avatar.jpg',
      })
      
      const img = container.querySelector('img')
      expect(img).toHaveAttribute('alt', 'avatar')
    })
  })

  describe('Text Avatar', () => {
    it('should render text avatar with text prop', () => {
      render(<Avatar text="John Doe" />)
      
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should extract initials from single word', () => {
      render(<Avatar text="Alice" />)
      
      expect(screen.getByText('A')).toBeInTheDocument()
    })

    it('should extract initials from multiple words', () => {
      render(<Avatar text="John Smith" />)
      
      expect(screen.getByText('JS')).toBeInTheDocument()
    })

    it('should handle Chinese characters', () => {
      render(<Avatar text="张三" />)
      
      expect(screen.getByText('张三')).toBeInTheDocument()
    })

    it('should use text as aria-label', () => {
      const { container } = renderWithProps(Avatar, {
        text: 'John Doe',
      })
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar).toHaveAttribute('aria-label', 'John Doe')
    })
  })

  describe('Icon Avatar', () => {
    it('should render icon from children', () => {
      const { container } = renderWithChildren(Avatar, {}, 
        <svg data-testid="user-icon">
          <path />
        </svg>
      )
      
      const icon = container.querySelector('[data-testid="user-icon"]')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Priority', () => {
    it('should prioritize image over text', () => {
      const { container } = renderWithProps(Avatar, {
        src: '/test.jpg',
        text: 'John Doe',
      })
      
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()
      expect(screen.queryByText('JD')).not.toBeInTheDocument()
    })

    it('should show text when image is not provided', () => {
      render(<Avatar text="John Doe" />)
      
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('should show icon when both image and text are not provided', () => {
      const { container } = renderWithChildren(Avatar, {},
        <svg data-testid="icon">
          <path />
        </svg>
      )
      
      const icon = container.querySelector('[data-testid="icon"]')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('Colors', () => {
    it('should apply custom background color', () => {
      const { container } = renderWithProps(Avatar, {
        text: 'AB',
        bgColor: 'bg-blue-500',
      })
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar?.className).toContain('bg-blue-500')
    })

    it('should apply custom text color', () => {
      const { container } = renderWithProps(Avatar, {
        text: 'AB',
        textColor: 'text-white',
      })
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar?.className).toContain('text-white')
    })

    it('should apply default colors when not specified', () => {
      const { container } = renderWithProps(Avatar, {
        text: 'AB',
      })
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar?.className).toContain('bg-gray-200')
      expect(avatar?.className).toContain('text-gray-600')
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProps(Avatar, {
        text: 'AB',
        className: 'custom-avatar',
      })
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar?.className).toContain('custom-avatar')
    })
  })

  describe('Accessibility', () => {
    it('should have role="img"', () => {
      const { container } = renderWithProps(Avatar, {
        text: 'AB',
      })
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar).toBeInTheDocument()
    })

    it('should have aria-label with text', () => {
      const { container } = renderWithProps(Avatar, {
        text: 'John Doe',
      })
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar).toHaveAttribute('aria-label', 'John Doe')
    })

    it('should have aria-label with alt prop', () => {
      const { container } = renderWithProps(Avatar, {
        src: '/test.jpg',
        alt: 'User Avatar',
      })
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar).toHaveAttribute('aria-label', 'User Avatar')
    })

    it('should have default aria-label when no props provided', () => {
      const { container } = renderWithProps(Avatar, {})
      
      const avatar = container.querySelector('[role="img"]')
      expect(avatar).toHaveAttribute('aria-label', 'avatar')
    })

    it('should pass accessibility checks', async () => {
      const { container } = renderWithProps(Avatar, {
        text: 'John Doe',
      })
      
      await expectNoA11yViolations(container)
    })
  })
})
