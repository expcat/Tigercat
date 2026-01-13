/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { Button } from '@tigercat/vue';
import {
  expectNoA11yViolations,
  setThemeVariables,
  clearThemeVariables,
} from '../utils';

describe('Button', () => {
  it('renders and merges class/style from props and attrs', () => {
    const { container } = render(Button, {
      props: { className: 'from-prop', style: { color: 'red' } },
      attrs: { class: 'from-attr', style: { backgroundColor: 'black' } },
      slots: { default: 'Click me' },
    });

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('inline-flex');
    expect(button).toHaveClass('from-prop');
    expect(button).toHaveClass('from-attr');
  });

  it('forwards native attributes', () => {
    render(Button, {
      attrs: { 'aria-label': 'Custom', 'data-testid': 'btn' },
      slots: { default: 'X' },
    });

    const button = screen.getByTestId('btn');
    expect(button).toHaveAttribute('aria-label', 'Custom');
  });

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn();

    render(Button, {
      props: { disabled: true },
      slots: { default: 'Disabled' },
      attrs: { onClick },
    });

    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();

    await fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not call onClick and shows spinner when loading', async () => {
    const onClick = vi.fn();

    const { container } = render(Button, {
      props: { loading: true },
      slots: { default: 'Loading' },
      attrs: { onClick },
    });

    const button = screen.getByRole('button', { name: 'Loading' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument();
    expect(container.querySelector('svg.animate-spin')).toHaveAttribute(
      'aria-hidden',
      'true'
    );

    await fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('can receive focus (keyboard baseline)', async () => {
    const { container } = render(Button, {
      slots: { default: 'Focusable' },
    });

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();

    button?.focus();
    expect(button).toHaveFocus();
  });

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables([
        '--tiger-primary',
        '--tiger-primary-hover',
        '--tiger-primary-disabled',
      ]);
    });

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000',
        '--tiger-primary-hover': '#cc0000',
      });

      const { container } = render(Button, {
        props: { variant: 'primary' },
        slots: { default: 'Themed Button' },
      });

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();

      // Verify theme variables are set
      const rootStyles = window.getComputedStyle(document.documentElement);
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe(
        '#ff0000'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Button, {
        slots: {
          default: 'Accessible Button',
        },
      });

      await expectNoA11yViolations(container);
    });
  });
});
