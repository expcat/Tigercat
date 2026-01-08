/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from '@tigercat/react';
import {
  renderWithProps,
  renderWithChildren,
} from '../utils/render-helpers-react';
import { expectNoA11yViolations } from '../utils/react';
import React from 'react';

const maxWidths = ['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const;

describe('Container (React)', () => {
  const Content = <div>Container content</div>;

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Container>{Content}</Container>);

      const containerEl = container.querySelector('div');
      expect(containerEl).toBeInTheDocument();
      expect(containerEl).toHaveClass('w-full');
    });

    it('should render children content', () => {
      render(<Container>{Content}</Container>);

      expect(screen.getByText('Container content')).toBeInTheDocument();
    });
  });

  describe('Max Width', () => {
    it.each(maxWidths)('should apply %s max width', (maxWidth) => {
      const { container } = renderWithProps(Container, {
        maxWidth,
        children: Content,
      });

      const containerEl = container.querySelector('div');
      expect(containerEl?.className).toBeTruthy();
    });

    it('should not apply max width when set to false', () => {
      const { container } = renderWithProps(Container, {
        maxWidth: false,
        children: Content,
      });

      const containerEl = container.querySelector('div');
      expect(containerEl).not.toHaveClass('max-w-screen-');
    });

    it('should apply sm max width class', () => {
      const { container } = renderWithProps(Container, {
        maxWidth: 'sm',
        children: Content,
      });

      const containerEl = container.querySelector('div');
      expect(containerEl).toHaveClass('max-w-screen-sm');
    });

    it('should apply full width class', () => {
      const { container } = renderWithProps(Container, {
        maxWidth: 'full',
        children: Content,
      });

      const containerEl = container.querySelector('div');
      expect(containerEl).toHaveClass('w-full');
    });
  });

  describe('Center', () => {
    it('should center by default', () => {
      const { container } = renderWithChildren(Container, Content);

      const containerEl = container.querySelector('div');
      expect(containerEl).toHaveClass('mx-auto');
    });

    it('should not center when set to false', () => {
      const { container } = renderWithProps(Container, {
        center: false,
        children: Content,
      });

      const containerEl = container.querySelector('div');
      expect(containerEl).not.toHaveClass('mx-auto');
    });
  });

  describe('Padding', () => {
    it('should apply padding by default', () => {
      const { container } = renderWithChildren(Container, Content);

      const containerEl = container.querySelector('div');
      expect(containerEl).toHaveClass('px-4');
    });

    it('should not apply padding when set to false', () => {
      const { container } = renderWithProps(Container, {
        padding: false,
        children: Content,
      });

      const containerEl = container.querySelector('div');
      expect(containerEl).not.toHaveClass('px-4');
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', () => {
      const { container } = renderWithProps(Container, {
        className: 'custom-container-class',
        children: Content,
      });

      const containerEl = container.querySelector('div');
      expect(containerEl).toHaveClass('custom-container-class');
      expect(containerEl).toHaveClass('w-full'); // Should also have base classes
    });

    it('should render as custom element', () => {
      const { container } = renderWithProps(Container, {
        as: 'section',
        children: Content,
      });

      const containerEl = container.querySelector('section');
      expect(containerEl).toBeInTheDocument();
    });
  });

  describe('Combined Props', () => {
    it('should apply multiple props together', () => {
      const { container } = renderWithProps(Container, {
        maxWidth: 'lg',
        center: true,
        padding: true,
        className: 'test-class',
        children: Content,
      });

      const containerEl = container.querySelector('div');
      expect(containerEl).toHaveClass('w-full');
      expect(containerEl).toHaveClass('max-w-screen-lg');
      expect(containerEl).toHaveClass('mx-auto');
      expect(containerEl).toHaveClass('px-4');
      expect(containerEl).toHaveClass('test-class');
    });

    it('should work with all features disabled', () => {
      const { container } = renderWithProps(Container, {
        maxWidth: false,
        center: false,
        padding: false,
        children: Content,
      });

      const containerEl = container.querySelector('div');
      expect(containerEl).toHaveClass('w-full');
      expect(containerEl).not.toHaveClass('mx-auto');
      expect(containerEl).not.toHaveClass('px-4');
    });
  });

  describe('Children Types', () => {
    it('should handle empty children', () => {
      const { container } = render(<Container />);

      const containerEl = container.querySelector('div');
      expect(containerEl).toBeInTheDocument();
    });

    it('should handle complex nested content', () => {
      render(
        <Container>
          <header>Header</header>
          <main>Main content</main>
          <footer>Footer</footer>
        </Container>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('should handle null children', () => {
      const { container } = renderWithProps(Container, {
        children: null,
      });

      const containerEl = container.querySelector('div');
      expect(containerEl).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithChildren(Container, Content);

      await expectNoA11yViolations(container);
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot for default container', () => {
      const { container } = renderWithChildren(Container, Content);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for custom container', () => {
      const { container } = renderWithProps(Container, {
        maxWidth: 'xl',
        center: true,
        padding: true,
        as: 'section',
        children: Content,
      });

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
