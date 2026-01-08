/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Tag } from '@tigercat/react';
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils';

const tagVariants = [
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
] as const;

describe('Tag', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Tag>Test Tag</Tag>);

      const tag = screen.getByText('Test Tag');
      expect(tag).toBeInTheDocument();
      expect(tag.parentElement).toHaveAttribute('role', 'status');
    });

    it('should render with custom text via children', () => {
      const { getByText } = render(<Tag>Custom Tag Text</Tag>);

      expect(getByText('Custom Tag Text')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Tag className="custom-class">Tag</Tag>);

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it.each(tagVariants)('should render %s variant correctly', (variant) => {
      const { container } = render(<Tag variant={variant}>{variant} tag</Tag>);

      const tag = container.querySelector('[role="status"]');
      expect(tag).toBeInTheDocument();
    });

    it('should apply default variant when not specified', () => {
      const { container } = render(<Tag>Default Tag</Tag>);
      const tag = container.querySelector('[role="status"]');

      expect(tag).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = render(<Tag size={size}>{size} tag</Tag>);

      const tag = container.querySelector('[role="status"]');
      expect(tag).toBeInTheDocument();
    });
  });

  describe('Closable', () => {
    it('should not render close button when closable is false', () => {
      const { container } = render(
        <Tag closable={false}>Non-closable Tag</Tag>
      );

      const closeButton = container.querySelector('button');
      expect(closeButton).not.toBeInTheDocument();
    });

    it('should render close button when closable is true', () => {
      const { container } = render(<Tag closable={true}>Closable Tag</Tag>);

      const closeButton = container.querySelector(
        'button[aria-label="Close tag"]'
      );
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const { container } = render(
        <Tag closable onClose={onClose}>
          Closable Tag
        </Tag>
      );

      const closeButton = container.querySelector(
        'button[aria-label="Close tag"]'
      );
      expect(closeButton).toBeInTheDocument();

      if (closeButton) {
        await user.click(closeButton);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should be removed from the DOM when close button is clicked', async () => {
      const user = userEvent.setup();

      const { container } = render(<Tag closable>Closable Tag</Tag>);

      const closeButton = container.querySelector(
        'button[aria-label="Close tag"]'
      );
      expect(closeButton).toBeInTheDocument();

      if (closeButton) {
        await user.click(closeButton);
      }

      expect(screen.queryByText('Closable Tag')).not.toBeInTheDocument();
    });

    it('should stop event propagation when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onTagClick = vi.fn();

      const { container } = render(
        <span onClick={onTagClick}>
          <Tag closable onClose={onClose}>
            Closable Tag
          </Tag>
        </span>
      );

      const closeButton = container.querySelector(
        'button[aria-label="Close tag"]'
      );

      if (closeButton) {
        await user.click(closeButton);
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onTagClick).not.toHaveBeenCalled();
      }
    });

    it('should not call onClose if not provided', async () => {
      const user = userEvent.setup();

      const { container } = render(<Tag closable>Closable Tag</Tag>);

      const closeButton = container.querySelector(
        'button[aria-label="Close tag"]'
      );

      if (closeButton) {
        // Should not throw error
        await user.click(closeButton);
        expect(true).toBe(true);
      }
    });
  });

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary', '--tiger-primary-hover']);
    });

    it('should support primary theme customization', () => {
      setThemeVariables({
        '--tiger-primary': '#10b981',
        '--tiger-primary-hover': '#059669',
      });

      const { container } = render(<Tag variant="primary">Primary Tag</Tag>);

      const tag = container.querySelector('[role="status"]');
      expect(tag).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Tag>Accessible Tag</Tag>);

      await expectNoA11yViolations(container);
    });

    it('should have no accessibility violations with close button', async () => {
      const { container } = render(<Tag closable>Closable Tag</Tag>);

      await expectNoA11yViolations(container);
    });

    it('should have proper aria-label on close button', () => {
      const { container } = render(<Tag closable>Tag</Tag>);

      const closeButton = container.querySelector('button');
      expect(closeButton).toHaveAttribute('aria-label', 'Close tag');
    });

    it('should allow customizing close button aria-label', () => {
      render(
        <Tag closable closeAriaLabel="移除标签">
          Tag
        </Tag>
      );

      expect(screen.getByLabelText('移除标签')).toBeInTheDocument();
    });

    it('should have role="status" on tag element', () => {
      const { container } = render(<Tag>Tag</Tag>);

      const tag = container.querySelector('[role="status"]');
      expect(tag).toBeInTheDocument();
    });
  });

  describe('Combined Props', () => {
    it('should correctly combine variant, size, and closable', () => {
      const { container, getByText } = render(
        <Tag variant="success" size="lg" closable>
          Combined Tag
        </Tag>
      );

      expect(getByText('Combined Tag')).toBeInTheDocument();
      const closeButton = container.querySelector(
        'button[aria-label="Close tag"]'
      );
      expect(closeButton).toBeInTheDocument();
    });

    it('should combine className with variant classes', () => {
      const { container } = render(
        <Tag variant="primary" className="custom-class">
          Tag with custom class
        </Tag>
      );

      const tag = container.querySelector('[role="status"]');
      expect(tag).toHaveClass('custom-class');
    });
  });

  describe('Event Handling', () => {
    it('should handle close event with React.MouseEvent', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn((event: React.MouseEvent<HTMLButtonElement>) => {
        expect(event).toBeDefined();
        expect(event.type).toBe('click');
      });

      const { container } = render(
        <Tag closable onClose={onClose}>
          Closable Tag
        </Tag>
      );

      const closeButton = container.querySelector(
        'button[aria-label="Close tag"]'
      );

      if (closeButton) {
        await user.click(closeButton);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot for default tag', () => {
      const { container } = render(<Tag>Default Tag</Tag>);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for primary variant', () => {
      const { container } = render(<Tag variant="primary">Primary Tag</Tag>);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for closable tag', () => {
      const { container } = render(<Tag closable>Closable Tag</Tag>);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for all variants', () => {
      const { container } = render(
        <div>
          {tagVariants.map((variant) => (
            <Tag key={variant} variant={variant}>
              {variant}
            </Tag>
          ))}
        </div>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
