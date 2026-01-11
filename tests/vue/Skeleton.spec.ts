/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import { Skeleton } from '@tigercat/vue';
import { renderWithProps, expectNoA11yViolations } from '../utils';

const skeletonVariants = [
  'text',
  'avatar',
  'image',
  'button',
  'custom',
] as const;
const skeletonAnimations = ['pulse', 'wave', 'none'] as const;
const skeletonShapes = ['circle', 'square'] as const;

describe('Skeleton', () => {
  const getSkeletonElements = (container: HTMLElement) => {
    return Array.from(container.querySelectorAll('div')).filter((el) =>
      (el as HTMLElement).className.includes('tiger-skeleton-bg')
    ) as HTMLElement[];
  };

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(Skeleton);

      const skeleton = getSkeletonElements(container)[0];
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.className).toContain('tiger-skeleton-bg');
      expect(skeleton.className).toContain('animate-pulse');
    });

    it('should render single skeleton element by default', () => {
      const { container } = renderWithProps(Skeleton, {});

      expect(getSkeletonElements(container)).toHaveLength(1);
    });
  });

  describe('Variants', () => {
    it.each(skeletonVariants)(
      'should render %s variant correctly',
      (variant) => {
        const { container } = renderWithProps(Skeleton, { variant });

        const skeleton = getSkeletonElements(container)[0];
        expect(skeleton).toBeInTheDocument();
        expect(skeleton.className).toContain('tiger-skeleton-bg');
      }
    );

    it('should use text variant by default', () => {
      const { container } = renderWithProps(Skeleton, {});

      const skeleton = container.querySelector('div');
      expect(skeleton).toBeInTheDocument();
    });

    it('should render avatar variant with circle shape', () => {
      const { container } = renderWithProps(Skeleton, {
        variant: 'avatar',
        shape: 'circle',
      });

      const skeleton = getSkeletonElements(container)[0];
      expect(skeleton.className).toContain('rounded-full');
    });

    it('should render avatar variant with square shape', () => {
      const { container } = renderWithProps(Skeleton, {
        variant: 'avatar',
        shape: 'square',
      });

      const skeleton = getSkeletonElements(container)[0];
      expect(skeleton.className).toContain('rounded-md');
    });
  });

  describe('Animations', () => {
    it.each(skeletonAnimations)('should support %s animation', (animation) => {
      const { container } = renderWithProps(Skeleton, { animation });

      const skeleton = getSkeletonElements(container)[0];
      expect(skeleton).toBeInTheDocument();

      if (animation === 'pulse' || animation === 'wave') {
        expect(skeleton.className).toContain('animate-pulse');
      }
    });

    it('should use pulse animation by default', () => {
      const { container } = renderWithProps(Skeleton, {});

      const skeleton = getSkeletonElements(container)[0];
      expect(skeleton.className).toContain('animate-pulse');
    });

    it('should not animate when animation is none', () => {
      const { container } = renderWithProps(Skeleton, { animation: 'none' });

      const skeleton = getSkeletonElements(container)[0];
      expect(skeleton.className).not.toContain('animate-pulse');
    });
  });

  describe('Dimensions', () => {
    it('should apply custom width', () => {
      const { container } = renderWithProps(Skeleton, { width: '200px' });

      const skeleton = getSkeletonElements(container)[0];
      expect(skeleton).toHaveStyle({ width: '200px' });
    });

    it('should apply custom height', () => {
      const { container } = renderWithProps(Skeleton, { height: '50px' });

      const skeleton = getSkeletonElements(container)[0];
      expect(skeleton).toHaveStyle({ height: '50px' });
    });

    it('should apply both custom width and height', () => {
      const { container } = renderWithProps(Skeleton, {
        width: '300px',
        height: '100px',
      });

      const skeleton = getSkeletonElements(container)[0];
      expect(skeleton).toHaveStyle({ width: '300px', height: '100px' });
    });

    it('should use variant default dimensions when not specified', () => {
      const { container } = renderWithProps(Skeleton, { variant: 'button' });

      const skeleton = container.querySelector('div');
      expect(skeleton).toBeInTheDocument();
      // Dimensions are applied via inline styles
    });
  });

  describe('Multiple Rows', () => {
    it('should render multiple rows when rows prop is greater than 1', () => {
      const { container } = renderWithProps(Skeleton, {
        variant: 'text',
        rows: 3,
      });

      expect(getSkeletonElements(container)).toHaveLength(3);
    });

    it('should apply spacing between rows', () => {
      const { container } = renderWithProps(Skeleton, {
        variant: 'text',
        rows: 3,
      });

      const skeletons = getSkeletonElements(container);
      // First two rows should have margin-bottom
      expect(skeletons[0].className).toContain('mb-2');
      expect(skeletons[1].className).toContain('mb-2');
      // Last row should not have margin-bottom
      expect(skeletons[2].className).not.toContain('mb-2');
    });

    it('should render rows in a flex column container', () => {
      const { container } = renderWithProps(Skeleton, {
        variant: 'text',
        rows: 2,
      });

      const wrapper = container.querySelector('.flex.flex-col');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Paragraph Mode', () => {
    it('should vary row widths in paragraph mode', () => {
      const { container } = renderWithProps(Skeleton, {
        variant: 'text',
        rows: 3,
        paragraph: true,
      });

      const skeletons = getSkeletonElements(container);
      expect(skeletons).toHaveLength(3);

      // Check that widths are different (paragraph mode applies varying widths)
      const lastRow = skeletons[skeletons.length - 1] as HTMLElement;
      expect(lastRow.style.width).toBe('60%');
    });

    it('should not apply paragraph widths when paragraph is false', () => {
      const { container } = renderWithProps(Skeleton, {
        variant: 'text',
        rows: 3,
        paragraph: false,
        width: '100%',
      });

      const skeletons = getSkeletonElements(container);
      skeletons.forEach((skeleton) => {
        expect((skeleton as HTMLElement).style.width).toBe('100%');
      });
    });
  });

  describe('Shapes', () => {
    it.each(skeletonShapes)(
      'should support %s shape for avatar variant',
      (shape) => {
        const { container } = renderWithProps(Skeleton, {
          variant: 'avatar',
          shape,
        });

        const skeleton = getSkeletonElements(container)[0];
        expect(skeleton).toBeInTheDocument();

        if (shape === 'circle') {
          expect(skeleton?.className).toContain('rounded-full');
        } else {
          expect(skeleton?.className).toContain('rounded-md');
        }
      }
    );

    it('should default to circle shape for avatar variant', () => {
      const { container } = renderWithProps(Skeleton, { variant: 'avatar' });

      const skeleton = getSkeletonElements(container)[0];
      expect(skeleton.className).toContain('rounded-full');
    });
  });

  describe('Custom Classes', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProps(Skeleton, {
        className: 'custom-class',
      });

      const skeleton = getSkeletonElements(container)[0];
      expect(skeleton.className).toContain('custom-class');
    });

    it('should preserve base classes when custom className is provided', () => {
      const { container } = renderWithProps(Skeleton, {
        className: 'custom-class',
      });

      const skeleton = getSkeletonElements(container)[0];
      expect(skeleton.className).toContain('tiger-skeleton-bg');
      expect(skeleton.className).toContain('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have no a11y violations with default props', async () => {
      const { container } = render(Skeleton);
      await expectNoA11yViolations(container);
    });
  });
});
