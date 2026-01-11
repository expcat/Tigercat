/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import { Divider } from '@tigercat/vue';
import { renderWithProps, expectNoA11yViolations } from '../utils';

describe('Divider (Vue)', () => {
  it('renders a separator with default orientation', () => {
    const { container } = render(Divider);

    const divider = container.querySelector('[role="separator"]');
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('supports vertical orientation', () => {
    const { container } = renderWithProps(Divider, { orientation: 'vertical' });
    const divider = container.querySelector('[role="separator"]');

    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('applies line style classes', () => {
    const { container: dashed } = renderWithProps(Divider, {
      lineStyle: 'dashed',
    });
    expect(dashed.querySelector('[role="separator"]')?.className).toContain(
      'border-dashed'
    );

    const { container: dotted } = renderWithProps(Divider, {
      lineStyle: 'dotted',
    });
    expect(dotted.querySelector('[role="separator"]')?.className).toContain(
      'border-dotted'
    );
  });

  it('applies spacing classes for each orientation', () => {
    const { container: horizontal } = renderWithProps(Divider, {
      spacing: 'lg',
      orientation: 'horizontal',
    });
    expect(horizontal.querySelector('[role="separator"]')?.className).toContain(
      'my-6'
    );

    const { container: vertical } = renderWithProps(Divider, {
      spacing: 'lg',
      orientation: 'vertical',
    });
    expect(vertical.querySelector('[role="separator"]')?.className).toContain(
      'mx-6'
    );
  });

  it('supports custom color and thickness', () => {
    const { container } = renderWithProps(Divider, {
      orientation: 'vertical',
      color: '#00ff00',
      thickness: '3px',
    });

    const divider = container.querySelector(
      '[role="separator"]'
    ) as HTMLElement;
    expect(divider.style.borderColor).toBe('#00ff00');
    expect(divider.style.borderLeftWidth).toBe('3px');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(Divider);
    await expectNoA11yViolations(container);
  });
});
