/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/vue';
import { h } from 'vue';
import { expectNoA11yViolations } from '../utils/a11y-helpers';
import { Layout, Header, Footer, Sidebar, Content } from '@tigercat/vue';

describe('Layout Sections', () => {
  it('Layout merges props.className with attrs.class and forwards attrs', () => {
    const { container } = render(Layout, {
      props: { className: 'from-props' },
      attrs: { id: 'layout-id', class: 'from-attrs', 'data-testid': 'layout' },
      slots: { default: () => 'Layout content' },
    });

    const layout = container.querySelector('#layout-id');
    expect(layout).toBeTruthy();
    expect(layout?.className).toContain('tiger-layout');
    expect(layout?.className).toContain('from-props');
    expect(layout?.className).toContain('from-attrs');
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('renders composed layout sections', () => {
    render(Layout, {
      slots: {
        default: () => [
          h(Header, null, () => 'Header'),
          h(Content, null, () => 'Content'),
          h(Footer, null, () => 'Footer'),
        ],
      },
    });

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('Header applies height and forwards aria attrs', () => {
    const { container } = render(Header, {
      props: { height: '80px' },
      attrs: { 'aria-label': 'Site header' },
      slots: { default: () => 'Header' },
    });

    const header = container.querySelector('header') as HTMLElement | null;
    expect(header).toBeTruthy();
    expect(header?.style.height).toBe('80px');
    expect(header).toHaveAttribute('aria-label', 'Site header');
  });

  it('Sidebar respects collapsed and width', async () => {
    const { container, rerender } = render(Sidebar, {
      props: { width: '300px' },
      slots: { default: () => 'Sidebar' },
    });

    const aside = container.querySelector('aside') as HTMLElement | null;
    expect(aside).toBeTruthy();
    expect(aside?.style.width).toBe('300px');
    expect(screen.getByText('Sidebar')).toBeInTheDocument();

    await rerender({ collapsed: true, width: '300px' });
    expect(aside?.style.width).toBe('0px');
    expect(screen.queryByText('Sidebar')).toBeNull();
  });

  it('Content renders semantic main', () => {
    const { container } = render(Content, {
      props: { className: 'custom-content' },
      slots: { default: () => 'Main' },
    });

    const main = container.querySelector('main');
    expect(main).toBeTruthy();
    expect(main?.className).toContain('tiger-content');
    expect(main?.className).toContain('custom-content');
  });

  it('Footer applies default height', () => {
    const { container } = render(Footer, {
      slots: { default: () => 'Footer' },
    });
    const footer = container.querySelector('footer') as HTMLElement | null;
    expect(footer).toBeTruthy();
    expect(footer?.style.height).toBe('auto');
  });

  it('has no basic accessibility violations', async () => {
    const { container } = render(Layout, {
      slots: {
        default: () => [
          h(Header, null, () => 'Header'),
          h(Content, null, () => 'Content'),
          h(Footer, null, () => 'Footer'),
        ],
      },
    });

    await expectNoA11yViolations(container);
  });
});
