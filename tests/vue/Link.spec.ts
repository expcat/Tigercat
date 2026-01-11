/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { Link } from '@tigercat/vue';
import { expectNoA11yViolations } from '../utils';

describe('Link (Vue)', () => {
  it('renders and merges classes', () => {
    const { container } = render(Link, {
      props: { className: 'from-prop' },
      attrs: { class: 'from-attr' },
      slots: { default: 'Link' },
    });

    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link?.tagName).toBe('A');
    expect(link).toHaveClass('inline-flex');
    expect(link).toHaveClass('from-prop');
    expect(link).toHaveClass('from-attr');
  });

  it('disables navigation and click when disabled', async () => {
    const onClick = vi.fn();

    const { container } = render(Link, {
      props: { disabled: true, href: '/test' },
      slots: { default: 'Disabled' },
      attrs: { onClick },
    });

    const link = container.querySelector('a');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('tabindex', '-1');

    await fireEvent.click(screen.getByText('Disabled'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('adds noopener noreferrer for target=_blank by default', () => {
    const { container } = render(Link, {
      props: { href: 'https://example.com', target: '_blank' },
      slots: { default: 'External' },
    });

    const link = container.querySelector('a');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(Link, {
      props: { href: '/test' },
      slots: { default: 'A11y' },
    });

    await expectNoA11yViolations(container);
  });
});
