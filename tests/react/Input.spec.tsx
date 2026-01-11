/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Input } from '@tigercat/react';
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils/react';

describe('Input', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('border');
    });

    it('should render with placeholder', () => {
      const { getByPlaceholderText } = render(
        <Input placeholder="Enter text" />
      );

      expect(getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with initial value (controlled)', () => {
      const { getByRole } = render(<Input value="Initial value" />);

      const input = getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Initial value');
    });

    it('should render with defaultValue (uncontrolled)', () => {
      const { getByRole } = render(<Input defaultValue="Default value" />);

      const input = getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Default value');
    });

    it('should apply custom className', () => {
      const { container } = render(<Input className="custom-class" />);

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should pass through native attributes', () => {
      const { getByRole } = render(
        <Input
          data-testid="test-input"
          title="Input title"
          aria-describedby="input-help"
        />
      );

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('data-testid', 'test-input');
      expect(input).toHaveAttribute('title', 'Input title');
      expect(input).toHaveAttribute('aria-describedby', 'input-help');
    });
  });

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { getByRole } = render(<Input size={size} />);

      const input = getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should handle different input types', () => {
      const types = ['text', 'password', 'email', 'number', 'tel', 'url'];

      types.forEach((type) => {
        const { container, unmount } = render(<Input type={type as any} />);

        const input = container.querySelector('input');
        expect(input).toHaveAttribute('type', type);
        unmount();
      });
    });

    it('should apply maxLength attribute', () => {
      const { getByRole } = render(<Input maxLength={10} />);

      expect(getByRole('textbox')).toHaveAttribute('maxlength', '10');
    });

    it('should apply minLength attribute', () => {
      const { getByRole } = render(<Input minLength={3} />);

      expect(getByRole('textbox')).toHaveAttribute('minlength', '3');
    });

    it('should apply name attribute', () => {
      const { getByRole } = render(<Input name="username" />);

      expect(getByRole('textbox')).toHaveAttribute('name', 'username');
    });

    it('should apply id attribute', () => {
      const { container } = render(<Input id="input-id" />);

      expect(container.querySelector('#input-id')).toBeInTheDocument();
    });

    it('should apply autocomplete attribute', () => {
      const { getByRole } = render(<Input autoComplete="email" />);

      expect(getByRole('textbox')).toHaveAttribute('autocomplete', 'email');
    });

    it('should autofocus when autoFocus is true', () => {
      const { getByRole } = render(<Input autoFocus />);

      const input = getByRole('textbox');
      expect(input).toHaveFocus();
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByRole } = render(<Input disabled />);

      const input = getByRole('textbox');
      expect(input).toBeDisabled();
      // Verify disabled styling is applied via class
      expect(input.className).toContain('disabled:');
    });

    it('should be readonly when readonly prop is true', () => {
      const { getByRole } = render(<Input readonly />);

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should show required state', () => {
      const { getByRole } = render(<Input required />);

      expect(getByRole('textbox')).toBeRequired();
    });
  });

  describe('Events', () => {
    it('should call onChange handler on input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { getByRole } = render(<Input onChange={handleChange} />);

      const input = getByRole('textbox');
      await user.type(input, 't');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onInput handler', async () => {
      const user = userEvent.setup();
      const handleInput = vi.fn();
      const { getByRole } = render(<Input onInput={handleInput} />);

      const input = getByRole('textbox');
      await user.type(input, 'test');

      expect(handleInput).toHaveBeenCalled();
    });

    it('should call onFocus handler', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      const { getByRole } = render(<Input onFocus={handleFocus} />);

      const input = getByRole('textbox');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur handler', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      const { getByRole } = render(<Input onBlur={handleBlur} />);

      const input = getByRole('textbox');
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalled();
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { getByRole } = render(<Input disabled onChange={handleChange} />);

      const input = getByRole('textbox');
      await user.type(input, 'test');

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should not allow typing when readonly', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<Input readonly value="initial" />);

      const input = getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'test');

      expect(input.value).toBe('initial');
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const TestComponent = () => {
        const [value, setValue] = React.useState('initial');

        return (
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              handleChange(e);
            }}
          />
        );
      };

      const { getByRole } = render(<TestComponent />);
      const input = getByRole('textbox') as HTMLInputElement;

      expect(input.value).toBe('initial');

      await user.clear(input);
      await user.type(input, 'updated');

      expect(input.value).toBe('updated');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should work as uncontrolled component', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<Input defaultValue="initial" />);

      const input = getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('initial');

      await user.clear(input);
      await user.type(input, 'updated');

      expect(input.value).toBe('updated');
    });

    it('should handle number type in controlled mode', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [value, setValue] = React.useState<string | number>(0);

        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              setValue(val === '' ? '' : Number(val));
            }}
          />
        );
      };

      const { getByRole } = render(<TestComponent />);
      const input = getByRole('spinbutton') as HTMLInputElement;

      expect(input.value).toBe('0');

      await user.clear(input);
      await user.type(input, '42');

      expect(input.value).toBe('42');
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

      const { getByRole } = render(<Input placeholder="Themed input" />);

      const input = getByRole('textbox');
      expect(input).toBeInTheDocument();

      const rootStyles = window.getComputedStyle(document.documentElement);
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe(
        '#ff0000'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Input placeholder="Accessible input" />);

      await expectNoA11yViolations(container);
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      const { getByRole } = render(<Input onFocus={handleFocus} />);

      const input = getByRole('textbox');
      await user.tab();

      expect(input).toHaveFocus();
      expect(handleFocus).toHaveBeenCalled();
    });

    it('should have proper role', () => {
      const { getByRole } = render(<Input />);

      expect(getByRole('textbox')).toBeInTheDocument();
    });
  });
});
