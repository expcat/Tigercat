/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Icon } from '@tigercat/react';
import {
  renderWithProps,
  renderWithChildren,
} from '../utils/render-helpers-react';
import { expectNoA11yViolations } from '../utils/react';
import React from 'react';

const iconSizes = ['sm', 'md', 'lg', 'xl'] as const;

describe('Icon (React)', () => {
  const SimpleSVG = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );

  describe('Rendering', () => {
    it('should render with SVG content', () => {
      const { container } = render(<Icon>{SimpleSVG}</Icon>);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('inline-block');
    });

    it('should render with default size (md)', () => {
      const { container } = renderWithChildren(Icon, SimpleSVG);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-5');
      expect(svg).toHaveClass('h-5');
    });
  });

  describe('Sizes', () => {
    it.each(iconSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(Icon, {
        size,
        children: SimpleSVG,
      });

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should apply sm size classes (w-4 h-4)', () => {
      const { container } = renderWithProps(Icon, {
        size: 'sm',
        children: SimpleSVG,
      });

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4');
    });

    it('should apply xl size classes (w-8 h-8)', () => {
      const { container } = renderWithProps(Icon, {
        size: 'xl',
        children: SimpleSVG,
      });

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-8', 'h-8');
    });
  });

  describe('Color', () => {
    it('should use currentColor by default', () => {
      const { container } = renderWithChildren(Icon, SimpleSVG);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });

    it('should apply custom color', () => {
      const { container } = renderWithProps(Icon, {
        color: '#ff0000',
        children: SimpleSVG,
      });

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', '#ff0000');
    });
  });

  describe('Custom Classes', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProps(Icon, {
        className: 'custom-icon-class',
        children: SimpleSVG,
      });

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-icon-class');
      expect(svg).toHaveClass('inline-block'); // Should also have base classes
    });
  });

  describe('SVG Attributes', () => {
    it('should set default SVG attributes', () => {
      const { container } = renderWithChildren(Icon, SimpleSVG);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('should set stroke attributes', () => {
      const { container } = renderWithChildren(Icon, SimpleSVG);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke-width', '2');
      expect(svg).toHaveAttribute('stroke-linecap', 'round');
      expect(svg).toHaveAttribute('stroke-linejoin', 'round');
    });
  });

  describe('Children', () => {
    it('should render complex SVG paths', () => {
      const ComplexSVG = (
        <svg>
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      );

      const { container } = renderWithChildren(Icon, ComplexSVG);

      const svg = container.querySelector('svg');
      const paths = svg?.querySelectorAll('path');
      const circles = svg?.querySelectorAll('circle');

      expect(paths?.length).toBe(1);
      expect(circles?.length).toBe(1);
    });

    it('should render text children as-is', () => {
      const { container } = renderWithChildren(Icon, 'Text content');

      // Text without SVG should render as-is
      expect(container.textContent).toBe('Text content');
    });

    it('should handle null children', () => {
      const { container } = renderWithProps(Icon, {
        children: null,
      });

      expect(container.querySelector('svg')).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithChildren(Icon, SimpleSVG);

      await expectNoA11yViolations(container);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing children gracefully', () => {
      const { container } = render(<Icon />);
      expect(container.querySelector('svg')).toBeFalsy();
    });

    it('should handle multiple SVG elements', () => {
      const MultipleSVGs = (
        <>
          <svg key="1">
            <path d="M5 12h14" />
          </svg>
          <svg key="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </>
      );

      const { container } = renderWithChildren(Icon, MultipleSVGs);

      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle non-SVG children', () => {
      const { container } = renderWithChildren(Icon, <div>Not an SVG</div>);

      // Non-SVG children should render without icon classes
      expect(container.querySelector('div')).toBeTruthy();
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot for default icon', () => {
      const { container } = renderWithChildren(Icon, SimpleSVG);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for custom sized icon', () => {
      const { container } = renderWithProps(Icon, {
        size: 'xl',
        color: '#0066cc',
        children: SimpleSVG,
      });

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
