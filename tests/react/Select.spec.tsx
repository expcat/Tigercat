/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Select } from '@tigercat/react';
import {
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils/react';

const testOptions = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

describe('Select', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Select options={testOptions} />);

      const trigger = container.querySelector('button');
      expect(trigger).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      const { getByText } = render(
        <Select options={testOptions} placeholder="Select an option" />
      );

      expect(getByText('Select an option')).toBeInTheDocument();
    });

    it('should render with selected value', () => {
      const { getByText } = render(<Select options={testOptions} value="1" />);

      expect(getByText('Option 1')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Select options={testOptions} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = render(
        <Select options={testOptions} size={size} />
      );

      const trigger = container.querySelector('button');
      expect(trigger).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(<Select options={testOptions} disabled />);

      const trigger = container.querySelector('button');
      expect(trigger).toBeDisabled();
    });

    it('should support clearable option', () => {
      const { container } = render(
        <Select options={testOptions} value="1" clearable />
      );

      const clearButton = container.querySelector('svg');
      expect(clearButton).toBeInTheDocument();
    });

    it('should support multiple selection', () => {
      const { container } = render(<Select options={testOptions} multiple />);

      const trigger = container.querySelector('button');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Events', () => {
    it('should call onChange when option selected', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container, getByText } = render(
        <Select options={testOptions} onChange={handleChange} />
      );

      const trigger = container.querySelector('button')!;
      await user.click(trigger);

      await waitFor(async () => {
        const option = getByText('Option 1');
        await user.click(option);
      });

      expect(handleChange).toHaveBeenCalledWith('1');
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = render(
        <Select options={testOptions} disabled onChange={handleChange} />
      );

      const trigger = container.querySelector('button')!;
      await user.click(trigger);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Controlled Component', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [value, setValue] = React.useState<string | undefined>();

        return (
          <Select
            options={testOptions}
            value={value}
            onChange={(val) => setValue(val as string)}
          />
        );
      };

      const { container, getByText } = render(<TestComponent />);

      const trigger = container.querySelector('button')!;
      await user.click(trigger);

      await waitFor(async () => {
        const option = getByText('Option 1');
        await user.click(option);
      });

      await waitFor(() => {
        expect(getByText('Option 1')).toBeInTheDocument();
      });
    });
  });

  describe('Dropdown', () => {
    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup();
      const { container, getByText } = render(<Select options={testOptions} />);

      const trigger = container.querySelector('button')!;
      await user.click(trigger);

      await waitFor(() => {
        expect(getByText('Option 1')).toBeInTheDocument();
      });
    });

    it('should close dropdown when option selected', async () => {
      const user = userEvent.setup();
      const { container, getByText, queryByText } = render(
        <Select options={testOptions} />
      );

      const trigger = container.querySelector('button')!;
      await user.click(trigger);

      await waitFor(async () => {
        const option = getByText('Option 1');
        await user.click(option);
      });

      await waitFor(() => {
        expect(queryByText('Option 2')).not.toBeInTheDocument();
      });
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

      const { container } = render(<Select options={testOptions} />);

      const trigger = container.querySelector('button');
      expect(trigger).toBeInTheDocument();

      const rootStyles = window.getComputedStyle(document.documentElement);
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe(
        '#ff0000'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Select options={testOptions} placeholder="Select option" />
      );

      await expectNoA11yViolations(container);
    });

    it('should have proper button element', () => {
      const { container } = render(<Select options={testOptions} />);

      const trigger = container.querySelector('button');
      expect(trigger).toHaveAttribute('type', 'button');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const { container } = render(<Select options={testOptions} />);

      const trigger = container.querySelector('button')!;
      await user.tab();

      expect(trigger).toHaveFocus();
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot for default state', () => {
      const { container } = render(<Select options={testOptions} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with selected value', () => {
      const { container } = render(<Select options={testOptions} value="1" />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for disabled state', () => {
      const { container } = render(<Select options={testOptions} disabled />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
