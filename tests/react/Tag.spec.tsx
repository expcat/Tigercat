/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Tag } from '@tigercat/react';
import { expectNoA11yViolations } from '../utils/react';

describe('Tag', () => {
  it('renders content and role="status"', () => {
    render(<Tag>Test Tag</Tag>);

    const content = screen.getByText('Test Tag');
    expect(content).toBeInTheDocument();
    expect(content.parentElement).toHaveAttribute('role', 'status');
  });

  it('merges className onto root element', () => {
    const { container } = render(<Tag className="custom-class">Tag</Tag>);
    const root = container.querySelector('[role="status"]');
    expect(root).toHaveClass('custom-class');
  });

  it('does not render close button when closable=false', () => {
    const { container } = render(<Tag closable={false}>Tag</Tag>);
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });

  it('calls onClose and removes tag by default', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { container } = render(
      <Tag closable onClose={onClose}>
        Closable Tag
      </Tag>
    );

    const closeButton = container.querySelector(
      'button[aria-label="Close tag"]'
    ) as HTMLButtonElement | null;
    expect(closeButton).toBeInTheDocument();

    await user.click(closeButton!);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Closable Tag')).not.toBeInTheDocument();
  });

  it('keeps tag visible when onClose calls preventDefault()', async () => {
    const user = userEvent.setup();

    render(
      <Tag
        closable
        onClose={(event) => {
          event.preventDefault();
        }}>
        Closable Tag
      </Tag>
    );

    await user.click(screen.getByLabelText('Close tag'));
    expect(screen.getByText('Closable Tag')).toBeInTheDocument();
  });

  it('stops propagation when close button is clicked', async () => {
    const user = userEvent.setup();
    const onWrapperClick = vi.fn();

    render(
      <span onClick={onWrapperClick}>
        <Tag closable>Closable Tag</Tag>
      </span>
    );

    await user.click(screen.getByLabelText('Close tag'));
    expect(onWrapperClick).not.toHaveBeenCalled();
  });

  it('passes a11y baseline checks', async () => {
    const { container } = render(
      <>
        <Tag>Tag</Tag>
        <Tag closable>Closable Tag</Tag>
      </>
    );

    await expectNoA11yViolations(container);
  });
});
