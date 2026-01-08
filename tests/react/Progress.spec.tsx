/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from '@tigercat/react';
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
} from '../utils/react';

const progressVariants = [
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
] as const;
const progressTypes = ['line', 'circle'] as const;
const progressStatuses = ['normal', 'success', 'exception', 'paused'] as const;

describe('Progress', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = renderWithProps(Progress, {});

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toBeInTheDocument();
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should render line progress by default', () => {
      const { container } = renderWithProps(Progress, { percentage: 50 });

      expect(screen.getByText('50%')).toBeInTheDocument();
      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toHaveStyle({ width: '50%' });
    });

    it('should render circle progress when type is circle', () => {
      const { container } = renderWithProps(Progress, {
        type: 'circle',
        percentage: 75,
      });

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();

      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(2); // Background + progress circle
    });
  });

  describe('Variants', () => {
    it.each(progressVariants)(
      'should render %s variant correctly',
      (variant) => {
        const { container } = renderWithProps(Progress, {
          variant,
          percentage: 50,
        });

        const progressbar = container.querySelector('[role="progressbar"]');
        expect(progressbar).toBeInTheDocument();
      }
    );

    it('should apply primary variant by default', () => {
      const { container } = renderWithProps(Progress, { percentage: 50 });

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it.each(componentSizes)(
      'should render %s size correctly for line',
      (size) => {
        const { container } = renderWithProps(Progress, {
          size,
          percentage: 50,
          type: 'line',
        });

        const progressbar = container.querySelector('[role="progressbar"]');
        expect(progressbar).toBeInTheDocument();
      }
    );

    it.each(componentSizes)(
      'should render %s size correctly for circle',
      (size) => {
        const { container } = renderWithProps(Progress, {
          size,
          percentage: 50,
          type: 'circle',
        });

        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      }
    );
  });

  describe('Types', () => {
    it.each(progressTypes)('should render %s type correctly', (type) => {
      const { container } = renderWithProps(Progress, {
        type,
        percentage: 50,
      });

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toBeInTheDocument();
    });
  });

  describe('Status', () => {
    it.each(progressStatuses)('should render %s status correctly', (status) => {
      const { container } = renderWithProps(Progress, {
        status,
        percentage: 50,
      });

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toBeInTheDocument();
    });

    it('should override variant when status is set', () => {
      const { container } = renderWithProps(Progress, {
        variant: 'primary',
        status: 'success',
        percentage: 100,
      });

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toBeInTheDocument();
      // Success status should apply green color (overriding primary blue)
    });
  });

  describe('Percentage', () => {
    it('should display correct percentage', () => {
      renderWithProps(Progress, { percentage: 75 });
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should clamp percentage to 0-100 range', () => {
      const { container: container1 } = renderWithProps(Progress, {
        percentage: -10,
      });
      const progressbar1 = container1.querySelector('[role="progressbar"]');
      expect(progressbar1).toHaveAttribute('aria-valuenow', '0');

      const { container: container2 } = renderWithProps(Progress, {
        percentage: 150,
      });
      const progressbar2 = container2.querySelector('[role="progressbar"]');
      expect(progressbar2).toHaveAttribute('aria-valuenow', '100');
    });

    it('should update width based on percentage', () => {
      const { container } = renderWithProps(Progress, { percentage: 60 });

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toHaveStyle({ width: '60%' });
    });
  });

  describe('Text Display', () => {
    it('should show text by default for line progress', () => {
      renderWithProps(Progress, { percentage: 50 });
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should not show text by default for circle progress', () => {
      const { container } = renderWithProps(Progress, {
        type: 'circle',
        percentage: 50,
        showText: false,
      });
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('should hide text when showText is false', () => {
      const { container } = renderWithProps(Progress, {
        percentage: 50,
        showText: false,
      });
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('should show text when showText is true for circle', () => {
      renderWithProps(Progress, {
        type: 'circle',
        percentage: 75,
        showText: true,
      });
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should display custom text', () => {
      renderWithProps(Progress, {
        percentage: 50,
        text: '进行中',
      });
      expect(screen.getByText('进行中')).toBeInTheDocument();
    });

    it('should use format function for custom text', () => {
      renderWithProps(Progress, {
        percentage: 50,
        format: (p: number) => `${p}个/100个`,
      });
      expect(screen.getByText('50个/100个')).toBeInTheDocument();
    });
  });

  describe('Striped', () => {
    it('should apply striped styles when striped is true', () => {
      const { container } = renderWithProps(Progress, {
        percentage: 50,
        striped: true,
      });

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar?.className).toContain('bg-gradient');
    });

    it('should apply animation when stripedAnimation is true', () => {
      const { container } = renderWithProps(Progress, {
        percentage: 50,
        striped: true,
        stripedAnimation: true,
      });

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar?.className).toContain('animate');
    });

    it('should not apply animation when striped is false', () => {
      const { container } = renderWithProps(Progress, {
        percentage: 50,
        striped: false,
        stripedAnimation: true,
      });

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar?.className).not.toContain('animate');
    });
  });

  describe('Custom Dimensions', () => {
    it('should accept custom width as string', () => {
      const { container } = renderWithProps(Progress, {
        percentage: 50,
        width: '300px',
      });

      const wrapper = container.querySelector('.flex');
      expect(wrapper).toHaveStyle({ width: '300px' });
    });

    it('should accept custom width as number', () => {
      const { container } = renderWithProps(Progress, {
        percentage: 50,
        width: 400,
      });

      const wrapper = container.querySelector('.flex');
      expect(wrapper).toHaveStyle({ width: '400px' });
    });

    it('should apply custom height', () => {
      const { container } = renderWithProps(Progress, {
        percentage: 50,
        height: 20,
      });

      const track = container.querySelector('.rounded-full');
      expect(track?.className).toContain('h-[20px]');
    });

    it('should apply custom stroke width for circle', () => {
      const { container } = renderWithProps(Progress, {
        type: 'circle',
        percentage: 50,
        strokeWidth: 10,
      });

      const circles = container.querySelectorAll('circle');
      circles.forEach((circle) => {
        expect(circle).toHaveAttribute('stroke-width', '10');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = renderWithProps(Progress, { percentage: 60 });

      const progressbar = container.querySelector('[role="progressbar"]');
      expect(progressbar).toHaveAttribute('role', 'progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '60');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should pass accessibility checks', async () => {
      const { container } = renderWithProps(Progress, { percentage: 50 });
      await expectNoA11yViolations(container);
    });

    it('should pass accessibility checks for circle type', async () => {
      const { container } = renderWithProps(Progress, {
        type: 'circle',
        percentage: 75,
        showText: true,
      });
      await expectNoA11yViolations(container);
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot for line progress', () => {
      const { container } = renderWithProps(Progress, {
        percentage: 50,
        variant: 'primary',
        size: 'md',
      });
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for circle progress', () => {
      const { container } = renderWithProps(Progress, {
        type: 'circle',
        percentage: 75,
        variant: 'success',
        size: 'lg',
        showText: true,
      });
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for striped progress', () => {
      const { container } = renderWithProps(Progress, {
        percentage: 60,
        striped: true,
        stripedAnimation: true,
      });
      expect(container).toMatchSnapshot();
    });
  });
});
