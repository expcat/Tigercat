/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { Skeleton } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

const skeletonVariants = ['text', 'avatar', 'image', 'button', 'custom'] as const
const skeletonAnimations = ['pulse', 'wave', 'none'] as const
const skeletonShapes = ['circle', 'square'] as const

describe('Skeleton', () => {
  const getSkeletonElements = (container: HTMLElement) => {
    return Array.from(container.querySelectorAll('div')).filter((el) =>
      (el as HTMLElement).className.includes('tiger-skeleton-bg')
    ) as HTMLElement[]
  }

  describe('Rendering', () => {
    it('should render single skeleton element by default', () => {
      const { container } = renderWithProps(Skeleton, {})

      expect(getSkeletonElements(container)).toHaveLength(1)
    })
  })

  describe('Variants', () => {})

  describe('Animations', () => {})

  describe('Dimensions', () => {
    it('should apply both custom width and height', () => {
      const { container } = renderWithProps(Skeleton, {
        width: '300px',
        height: '100px'
      })

      const skeleton = getSkeletonElements(container)[0]
      expect(skeleton).toHaveStyle({ width: '300px', height: '100px' })
    })
  })

  describe('Multiple Rows', () => {
    it('should render multiple rows when rows prop is greater than 1', () => {
      const { container } = renderWithProps(Skeleton, {
        variant: 'text',
        rows: 3
      })

      expect(getSkeletonElements(container)).toHaveLength(3)
    })
  })

  describe('Paragraph Mode', () => {
    it('should vary row widths in paragraph mode', () => {
      const { container } = renderWithProps(Skeleton, {
        variant: 'text',
        rows: 3,
        paragraph: true
      })

      const skeletons = getSkeletonElements(container)
      expect(skeletons).toHaveLength(3)

      // Check that widths are different (paragraph mode applies varying widths)
      const lastRow = skeletons[skeletons.length - 1] as HTMLElement
      expect(lastRow.style.width).toBe('60%')
    })
  })

  describe('Shapes', () => {})

  describe('Custom Classes', () => {
    it('should apply custom className and preserve base classes', () => {
      const { container } = renderWithProps(Skeleton, {
        className: 'custom-class'
      })

      const skeleton = getSkeletonElements(container)[0]
      expect(skeleton.className).toContain('tiger-skeleton-bg')
      expect(skeleton.className).toContain('custom-class')
    })

    it('should apply className to wrapper only in multi-row mode', () => {
      const { container } = renderWithProps(Skeleton, {
        variant: 'text',
        rows: 3,
        className: 'custom-wrapper'
      })

      const wrapper = container.querySelector('.flex.flex-col')
      expect(wrapper?.className).toContain('custom-wrapper')

      const skeletons = getSkeletonElements(container)
      skeletons.forEach((skeleton) => {
        expect(skeleton.className).not.toContain('custom-wrapper')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have no a11y violations with default props', async () => {
      const { container } = render(Skeleton)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {})
})
