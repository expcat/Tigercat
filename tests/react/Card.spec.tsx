/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Card } from '@tigercat/react';
import { expectNoA11yViolations, componentSizes } from '../utils/react';

const cardVariants = ['default', 'bordered', 'shadow', 'elevated'] as const;

describe('Card', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Card>Card content</Card>);

      const content = screen.getByText('Card content');
      expect(content).toBeInTheDocument();
    });

    it('should render with custom content via children', () => {
      const { getByText } = render(<Card>Custom card content</Card>);

      expect(getByText('Custom card content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Card className="custom-class">Card</Card>);

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should render header when provided', () => {
      const { getByText } = render(<Card header="Card Header">Card Body</Card>);

      expect(getByText('Card Header')).toBeInTheDocument();
      expect(getByText('Card Body')).toBeInTheDocument();
    });

    it('should render footer when provided', () => {
      const { getByText } = render(<Card footer="Card Footer">Card Body</Card>);

      expect(getByText('Card Body')).toBeInTheDocument();
      expect(getByText('Card Footer')).toBeInTheDocument();
    });

    it('should render actions when provided', () => {
      const { getByText } = render(
        <Card actions={<button>Action</button>}>Card Body</Card>
      );

      expect(getByText('Card Body')).toBeInTheDocument();
      expect(getByText('Action')).toBeInTheDocument();
    });

    it('should render all props together', () => {
      const { getByText } = render(
        <Card header="Header" footer="Footer" actions={<button>Action</button>}>
          Body
        </Card>
      );

      expect(getByText('Header')).toBeInTheDocument();
      expect(getByText('Body')).toBeInTheDocument();
      expect(getByText('Footer')).toBeInTheDocument();
      expect(getByText('Action')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it.each(cardVariants)('should render %s variant correctly', (variant) => {
      const { container } = render(
        <Card variant={variant}>{variant} card</Card>
      );

      const card = container.firstElementChild;
      expect(card).toBeInTheDocument();
      expect(card?.className).toBeTruthy();
    });

    it('should apply default variant when not specified', () => {
      const { container } = render(<Card>Default Card</Card>);

      const card = container.firstElementChild;
      expect(card).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = render(<Card size={size}>{size} card</Card>);

      const card = container.firstElementChild;
      expect(card).toBeInTheDocument();
    });
  });

  describe('Hoverable', () => {
    it('should not have hover effect when hoverable is false', () => {
      const { container } = render(
        <Card hoverable={false}>Non-hoverable Card</Card>
      );

      const card = container.firstElementChild;
      expect(card?.className).not.toContain('cursor-pointer');
    });

    it('should have hover effect when hoverable is true', () => {
      const { container } = render(
        <Card hoverable={true}>Hoverable Card</Card>
      );

      const card = container.firstElementChild;
      expect(card?.className).toContain('cursor-pointer');
    });
  });

  describe('Cover Image', () => {
    it('should not render cover when cover prop is not provided', () => {
      const { container } = render(<Card>Card without cover</Card>);

      const img = container.querySelector('img');
      expect(img).not.toBeInTheDocument();
    });

    it('should render cover image when cover prop is provided', () => {
      const { container } = render(
        <Card cover="https://example.com/image.jpg">Card with cover</Card>
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should use custom alt text for cover image', () => {
      const { container } = render(
        <Card cover="https://example.com/image.jpg" coverAlt="Custom alt text">
          Card with cover
        </Card>
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Custom alt text');
    });

    it('should use default alt text when not provided', () => {
      const { container } = render(
        <Card cover="https://example.com/image.jpg">Card with cover</Card>
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Card cover image');
    });
  });

  describe('Structure', () => {
    it('should apply size padding to card when no cover', () => {
      const { container } = render(<Card size="lg">Card content</Card>);

      const card = container.firstElementChild;
      expect(card?.className).toContain('p-6');
    });

    it('should apply size padding to body when cover is present', () => {
      const { getByText } = render(
        <Card size="lg" cover="https://example.com/image.jpg">
          Card content
        </Card>
      );

      // Verify card content is rendered
      expect(getByText('Card content')).toBeInTheDocument();

      // Verify cover image is rendered
      const container = getByText('Card content').closest('div')?.parentElement;
      const img = container?.querySelector('img');
      expect(img).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Card>Accessible Card</Card>);

      await expectNoA11yViolations(container);
    });

    it('should have no accessibility violations with all props', async () => {
      const { container } = render(
        <Card header="Header" footer="Footer" actions={<button>Action</button>}>
          Body
        </Card>
      );

      await expectNoA11yViolations(container);
    });

    it('should have no accessibility violations with cover image', async () => {
      const { container } = render(
        <Card cover="https://example.com/image.jpg" coverAlt="Test image">
          Card content
        </Card>
      );

      await expectNoA11yViolations(container);
    });
  });

  describe('Combined Props', () => {
    it('should correctly combine variant, size, and hoverable', () => {
      const { container, getByText } = render(
        <Card variant="shadow" size="lg" hoverable={true}>
          Combined Card
        </Card>
      );

      expect(getByText('Combined Card')).toBeInTheDocument();
      const card = container.firstElementChild;
      expect(card?.className).toContain('cursor-pointer');
      expect(card?.className).toContain('p-6');
    });

    it('should work with cover and all other props', () => {
      const { container, getByText } = render(
        <Card
          variant="elevated"
          size="md"
          hoverable={true}
          cover="https://example.com/image.jpg"
          header="Header"
          footer="Footer">
          Body
        </Card>
      );

      expect(getByText('Header')).toBeInTheDocument();
      expect(getByText('Body')).toBeInTheDocument();
      expect(getByText('Footer')).toBeInTheDocument();

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();

      const card = container.firstElementChild;
      expect(card?.className).toContain('cursor-pointer');
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot for default card', () => {
      const { container } = render(<Card>Default Card</Card>);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for card with all props', () => {
      const { container } = render(
        <Card header="Header" footer="Footer" actions={<button>Action</button>}>
          Body
        </Card>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for card with cover', () => {
      const { container } = render(
        <Card cover="https://example.com/image.jpg">Card with cover</Card>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for hoverable card', () => {
      const { container } = render(
        <Card hoverable={true} variant="shadow">
          Hoverable Card
        </Card>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
