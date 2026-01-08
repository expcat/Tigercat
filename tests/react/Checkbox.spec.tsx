/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Checkbox } from '@tigercat/react';
import {
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils';

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Checkbox>Checkbox</Checkbox>);

      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });

    it('should render with label text', () => {
      const { getByText } = render(<Checkbox>Check me</Checkbox>);

      expect(getByText('Check me')).toBeInTheDocument();
    });

    it('should render unchecked by default', () => {
      const { container } = render(<Checkbox>Checkbox</Checkbox>);

      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Checkbox className="custom-class">Checkbox</Checkbox>
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = render(<Checkbox size={size}>Checkbox</Checkbox>);

      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(<Checkbox disabled>Disabled</Checkbox>);

      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeDisabled();
    });

    it('should be checked when checked prop is true', () => {
      const { container } = render(<Checkbox checked>Checked</Checkbox>);

      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should be checked when defaultChecked is true', () => {
      const { container } = render(
        <Checkbox defaultChecked>Default checked</Checkbox>
      );

      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should apply indeterminate state when indeterminate is true', async () => {
      const { container } = render(
        <Checkbox indeterminate>Indeterminate</Checkbox>
      );

      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      await waitFor(() => expect(checkbox.indeterminate).toBe(true));
    });
  });

  describe('Events', () => {
    it('should call onChange when clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox onChange={handleChange}>Checkbox</Checkbox>
      );

      const checkbox = container.querySelector('input[type="checkbox"]')!;
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalled();
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox disabled onChange={handleChange}>
          Disabled
        </Checkbox>
      );

      const checkbox = container.querySelector('input[type="checkbox"]')!;
      await user.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should toggle from false to true', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={false} onChange={handleChange}>
          Toggle
        </Checkbox>
      );

      const checkbox = container.querySelector('input[type="checkbox"]')!;
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalled();
    });

    it('should toggle from true to false', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox checked={true} onChange={handleChange}>
          Toggle
        </Checkbox>
      );

      const checkbox = container.querySelector('input[type="checkbox"]')!;
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Controlled Component', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [checked, setChecked] = React.useState(false);

        return (
          <Checkbox
            checked={checked}
            onChange={(isChecked) => setChecked(isChecked)}>
            Checkbox
          </Checkbox>
        );
      };

      const { container } = render(<TestComponent />);
      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;

      expect(checkbox.checked).toBe(false);

      await user.click(checkbox);

      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary']);
    });

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000',
      });

      const { container } = render(<Checkbox checked>Themed</Checkbox>);

      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();

      const rootStyles = window.getComputedStyle(document.documentElement);
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe(
        '#ff0000'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Checkbox>Accessible Checkbox</Checkbox>);

      await expectNoA11yViolations(container);
    });

    it('should have proper role', () => {
      const { container } = render(<Checkbox>Checkbox</Checkbox>);

      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('should be keyboard accessible', async () => {
      const handleChange = vi.fn();
      const { container } = render(
        <Checkbox onChange={handleChange}>Checkbox</Checkbox>
      );

      const checkbox = container.querySelector('input[type="checkbox"]')!;
      checkbox.focus();

      expect(checkbox).toHaveFocus();
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot for unchecked state', () => {
      const { container } = render(<Checkbox>Unchecked</Checkbox>);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for checked state', () => {
      const { container } = render(<Checkbox checked>Checked</Checkbox>);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for disabled state', () => {
      const { container } = render(<Checkbox disabled>Disabled</Checkbox>);

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
