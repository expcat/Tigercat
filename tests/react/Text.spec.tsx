/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Text } from '@tigercat/react';
import {
  renderWithProps,
  renderWithChildren,
} from '../utils/render-helpers-react';
import { expectNoA11yViolations } from '../utils/react';
import React from 'react';

const textSizes = [
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
] as const;
const textWeights = [
  'light',
  'normal',
  'medium',
  'semibold',
  'bold',
  'extrabold',
] as const;
const textAligns = ['left', 'center', 'right', 'justify'] as const;
const textColors = [
  'default',
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'muted',
] as const;
const textTags = [
  'p',
  'span',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'label',
] as const;

describe('Text (React)', () => {
  describe('Rendering', () => {
    it('should render with default tag (p)', () => {
      render(<Text>Default text</Text>);

      const text = screen.getByText('Default text');
      expect(text.tagName).toBe('P');
    });

    it('should render with children', () => {
      const { getByText } = renderWithChildren(Text, 'Custom text content');

      expect(getByText('Custom text content')).toBeInTheDocument();
    });
  });

  describe('Tags', () => {
    it.each(textTags)('should render as %s tag', (tag) => {
      const { container } = renderWithProps(Text, {
        tag,
        children: 'Text content',
      });

      const element = container.querySelector(tag);
      expect(element).toBeInTheDocument();
      expect(element?.textContent).toBe('Text content');
    });
  });

  describe('Sizes', () => {
    it.each(textSizes)('should apply %s size classes', (size) => {
      const { container } = renderWithProps(Text, {
        size,
        children: 'Sized text',
      });

      const text = container.querySelector('p');
      expect(text?.className).toBeTruthy();
    });

    it('should use base size by default', () => {
      const { container } = renderWithChildren(Text, 'Text');

      const text = container.querySelector('p');
      expect(text?.className).toContain('text-base');
    });
  });

  describe('Weights', () => {
    it.each(textWeights)('should apply %s weight classes', (weight) => {
      const { container } = renderWithProps(Text, {
        weight,
        children: 'Weighted text',
      });

      const text = container.querySelector('p');
      expect(text?.className).toBeTruthy();
    });
  });

  describe('Alignment', () => {
    it.each(textAligns)('should apply %s alignment', (align) => {
      const { container } = renderWithProps(Text, {
        align,
        children: 'Aligned text',
      });

      const text = container.querySelector('p');
      expect(text?.className).toContain('text-');
    });
  });

  describe('Colors', () => {
    it.each(textColors)('should apply %s color', (color) => {
      const { container } = renderWithProps(Text, {
        color,
        children: 'Colored text',
      });

      const text = container.querySelector('p');
      expect(text?.className).toBeTruthy();
    });
  });

  describe('Decorations', () => {
    it('should apply truncate class', () => {
      const { container } = renderWithProps(Text, {
        truncate: true,
        children: 'This is a very long text that should be truncated',
      });

      const text = container.querySelector('p');
      expect(text).toHaveClass('truncate');
    });

    it('should apply italic class', () => {
      const { container } = renderWithProps(Text, {
        italic: true,
        children: 'Italic text',
      });

      const text = container.querySelector('p');
      expect(text).toHaveClass('italic');
    });

    it('should apply underline class', () => {
      const { container } = renderWithProps(Text, {
        underline: true,
        children: 'Underlined text',
      });

      const text = container.querySelector('p');
      expect(text).toHaveClass('underline');
    });

    it('should apply line-through class', () => {
      const { container } = renderWithProps(Text, {
        lineThrough: true,
        children: 'Strikethrough text',
      });

      const text = container.querySelector('p');
      expect(text).toHaveClass('line-through');
    });

    it('should apply multiple decorations', () => {
      const { container } = renderWithProps(Text, {
        italic: true,
        underline: true,
        children: 'Multi-decorated text',
      });

      const text = container.querySelector('p');
      expect(text).toHaveClass('italic');
      expect(text).toHaveClass('underline');
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProps(Text, {
        className: 'custom-text-class',
        children: 'Custom styled text',
      });

      const text = container.querySelector('p');
      expect(text).toHaveClass('custom-text-class');
      expect(text).toHaveClass('text-base'); // Should also have default classes
    });
  });

  describe('Combined Props', () => {
    it('should apply multiple props together', () => {
      const { container } = renderWithProps(Text, {
        tag: 'h1',
        size: '2xl',
        weight: 'bold',
        align: 'center',
        color: 'primary',
        children: 'Heading',
      });

      const heading = container.querySelector('h1');
      expect(heading).toBeInTheDocument();
      expect(heading?.className).toContain('text-2xl');
      expect(heading?.className).toContain('font-bold');
      expect(heading?.className).toContain('text-center');
    });
  });

  describe('Children Types', () => {
    it('should render text children', () => {
      render(<Text>Simple text</Text>);
      expect(screen.getByText('Simple text')).toBeInTheDocument();
    });

    it('should render element children', () => {
      render(
        <Text>
          <strong>Bold text</strong>
        </Text>
      );
      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Text>
          <span>Part 1</span>
          <span>Part 2</span>
        </Text>
      );
      expect(screen.getByText('Part 1')).toBeInTheDocument();
      expect(screen.getByText('Part 2')).toBeInTheDocument();
    });

    it('should handle null children', () => {
      const { container } = renderWithProps(Text, {
        children: null,
      });

      const text = container.querySelector('p');
      expect(text).toBeInTheDocument();
      expect(text?.textContent).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithProps(Text, {
        tag: 'p',
        children: 'Accessible text',
      });

      await expectNoA11yViolations(container);
    });

    it('should render semantic heading tags properly', async () => {
      const { container } = renderWithProps(Text, {
        tag: 'h1',
        children: 'Page Heading',
      });

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      await expectNoA11yViolations(container);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<Text />);

      const text = container.querySelector('p');
      expect(text).toBeInTheDocument();
      expect(text?.textContent).toBe('');
    });

    it('should handle very long text', () => {
      const longText = 'Lorem ipsum '.repeat(100);
      const { container } = renderWithChildren(Text, longText);

      // Check that the text element exists and contains part of the content
      const text = container.querySelector('p');
      expect(text).toBeInTheDocument();
      expect(text?.textContent).toContain('Lorem ipsum');
      expect(text?.textContent?.length).toBeGreaterThan(1000);
    });

    it('should handle special characters', () => {
      const specialText = '<>&"\'Hello World';
      const { getByText } = renderWithChildren(Text, specialText);

      expect(getByText(specialText)).toBeInTheDocument();
    });

    it('should handle numeric content', () => {
      render(<Text>{12345}</Text>);

      expect(screen.getByText('12345')).toBeInTheDocument();
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot for default text', () => {
      const { container } = renderWithChildren(Text, 'Default text');

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for styled heading', () => {
      const { container } = renderWithProps(Text, {
        tag: 'h1',
        size: '3xl',
        weight: 'bold',
        color: 'primary',
        children: 'Styled Heading',
      });

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
