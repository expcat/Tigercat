/**
 * @vitest-environment happy-dom
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link } from '@tigercat/react';
import { expectNoA11yViolations } from '../utils/react';

describe('Link (React)', () => {
  it('renders an anchor with default styling', () => {
    render(<Link href="/test">Click</Link>);

    const link = screen.getByRole('link', { name: 'Click' });
    expect(link).toHaveAttribute('href', '/test');
    expect(link.tagName).toBe('A');
    expect(link).toHaveClass('inline-flex');
  });

  it('forwards native attributes', () => {
    render(<Link aria-label="Custom" data-testid="link" />);

    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('aria-label', 'Custom');
  });

  it('disables navigation and interactions when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Link href="/test" disabled onClick={onClick}>
        Disabled
      </Link>
    );

    const link = screen.getByText('Disabled');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('tabindex', '-1');

    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('adds noopener noreferrer for target=_blank by default', () => {
    render(
      <Link href="https://example.com" target="_blank">
        External
      </Link>
    );

    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Link href="/test">A11y</Link>);
    await expectNoA11yViolations(container);
  });
});
