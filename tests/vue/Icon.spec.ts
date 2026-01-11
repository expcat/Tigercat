/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import { Icon } from '@tigercat/vue';
import { h } from 'vue';
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
} from '../utils';

describe('Icon (Vue)', () => {
  const SimpleSVG = () =>
    h('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M5 12h14', stroke: 'currentColor', strokeWidth: '2' }),
    ]);

  it('renders SVG with default size classes', () => {
    const { container } = renderWithSlots(Icon, { default: SimpleSVG });

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('inline-block');
    expect(svg).toHaveClass('w-5', 'h-5');
  });

  it('applies custom size to SVG', () => {
    const { container } = renderWithProps(
      Icon,
      { size: 'xl' },
      { slots: { default: SimpleSVG } }
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-8', 'h-8');
  });

  it('forwards attrs to wrapper', () => {
    const { container } = render(Icon, {
      attrs: { 'data-testid': 'icon' },
      slots: { default: SimpleSVG },
    });
    expect(container.querySelector('[data-testid="icon"]')).toBeInTheDocument();
  });

  it('is aria-hidden by default (decorative)', () => {
    const { container } = renderWithSlots(Icon, { default: SimpleSVG });
    const wrapper = container.querySelector('span');
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses role="img" when aria-label is provided', () => {
    const { container } = render(Icon, {
      attrs: { 'aria-label': 'Search' },
      slots: { default: SimpleSVG },
    });

    const wrapper = container.querySelector('span');
    expect(wrapper).toHaveAttribute('role', 'img');
    expect(wrapper).not.toHaveAttribute('aria-hidden');
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithSlots(Icon, {
        default: SimpleSVG,
      });

      await expectNoA11yViolations(container);
    });
  });

  it('handles missing children gracefully', () => {
    const { container } = render(Icon);
    expect(container.querySelector('svg')).toBeFalsy();
  });
});
