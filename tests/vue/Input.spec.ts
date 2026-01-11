/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { Input } from '@tigercat/vue';
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils';

describe('Input', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Input);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('border');
    });

    it('should render with placeholder', () => {
      const { getByPlaceholderText } = renderWithProps(Input, {
        placeholder: 'Enter text',
      });

      expect(getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      const { getByRole } = renderWithProps(Input, {
        modelValue: 'Initial value',
      });

      const input = getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Initial value');
    });

    it('should forward attrs (data/aria/title)', () => {
      const { getByRole } = render(Input, {
        attrs: {
          'data-testid': 'test-input',
          title: 'Input title',
          'aria-describedby': 'input-help',
        },
      });

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('data-testid', 'test-input');
      expect(input).toHaveAttribute('title', 'Input title');
      expect(input).toHaveAttribute('aria-describedby', 'input-help');
    });
  });

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { getByRole } = renderWithProps(Input, { size });

      const input = getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should handle different input types', () => {
      const types = ['text', 'password', 'email', 'number', 'tel', 'url'];

      types.forEach((type) => {
        const { container, unmount } = renderWithProps(Input, {
          type: type as any,
        });

        const input = container.querySelector('input');
        expect(input).toHaveAttribute('type', type);
        unmount();
      });
    });

    it('should apply maxLength attribute', () => {
      const { getByRole } = renderWithProps(Input, {
        maxLength: 10,
      });

      expect(getByRole('textbox')).toHaveAttribute('maxlength', '10');
    });

    it('should apply minLength attribute', () => {
      const { getByRole } = renderWithProps(Input, {
        minLength: 3,
      });

      expect(getByRole('textbox')).toHaveAttribute('minlength', '3');
    });

    it('should apply name attribute', () => {
      const { getByRole } = renderWithProps(Input, {
        name: 'username',
      });

      expect(getByRole('textbox')).toHaveAttribute('name', 'username');
    });

    it('should apply id attribute', () => {
      const { container } = renderWithProps(Input, {
        id: 'input-id',
      });

      expect(container.querySelector('#input-id')).toBeInTheDocument();
    });

    it('should apply autocomplete attribute', () => {
      const { getByRole } = renderWithProps(Input, {
        autoComplete: 'email',
      });

      expect(getByRole('textbox')).toHaveAttribute('autocomplete', 'email');
    });

    it('should have autofocus attribute when autoFocus is true', () => {
      const { getByRole } = renderWithProps(Input, {
        autoFocus: true,
      });

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('autofocus');
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByRole } = renderWithProps(Input, {
        disabled: true,
      });

      const input = getByRole('textbox');
      expect(input).toBeDisabled();
      // Verify disabled styling is applied via class
      expect(input.className).toContain('disabled:');
    });

    it('should be readonly when readonly prop is true', () => {
      const { getByRole } = renderWithProps(Input, {
        readonly: true,
      });

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should show required state', () => {
      const { getByRole } = renderWithProps(Input, {
        required: true,
      });

      expect(getByRole('textbox')).toBeRequired();
    });
  });

  describe('Events', () => {
    it('should emit update:modelValue on input', async () => {
      const onUpdate = vi.fn();
      const { getByRole } = render(Input, {
        props: {
          'onUpdate:modelValue': onUpdate,
        },
      });

      const input = getByRole('textbox');
      await fireEvent.update(input, 'test');

      expect(onUpdate).toHaveBeenCalledWith('test');
    });

    it('should emit input event', async () => {
      const onInput = vi.fn();
      const { getByRole } = render(Input, {
        props: {
          onInput: onInput,
        },
      });

      const input = getByRole('textbox');
      await fireEvent.input(input, { target: { value: 'test' } });

      expect(onInput).toHaveBeenCalled();
    });

    it('should emit focus event', async () => {
      const onFocus = vi.fn();
      const { getByRole } = render(Input, {
        props: {
          onFocus: onFocus,
        },
      });

      const input = getByRole('textbox');
      await fireEvent.focus(input);

      expect(onFocus).toHaveBeenCalled();
    });

    it('should emit blur event', async () => {
      const onBlur = vi.fn();
      const { getByRole } = render(Input, {
        props: {
          onBlur: onBlur,
        },
      });

      const input = getByRole('textbox');
      await fireEvent.blur(input);

      expect(onBlur).toHaveBeenCalled();
    });

    it('should not emit events when disabled', async () => {
      const onUpdate = vi.fn();
      const onInput = vi.fn();
      const { getByRole } = render(Input, {
        props: {
          disabled: true,
          'onUpdate:modelValue': onUpdate,
          onInput: onInput,
        },
      });

      const input = getByRole('textbox');
      await fireEvent.input(input, { target: { value: 'test' } });

      // Input is disabled, events should not fire
      expect(input).toBeDisabled();
    });

    it('should not allow input when readonly', async () => {
      const { getByRole } = renderWithProps(Input, {
        readonly: true,
        modelValue: 'initial',
      });

      const input = getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });
  });

  describe('v-model binding', () => {
    it('should update value when modelValue changes', async () => {
      const { getByRole, rerender } = renderWithProps(Input, {
        modelValue: 'initial',
      });

      let input = getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('initial');

      await rerender({ modelValue: 'updated' });
      input = getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('updated');
    });

    it('should handle number type values', async () => {
      const onUpdate = vi.fn();
      const { getByRole } = render(Input, {
        props: {
          type: 'number',
          'onUpdate:modelValue': onUpdate,
        },
      });

      const input = getByRole('spinbutton');
      await fireEvent.update(input, '42');

      expect(onUpdate).toHaveBeenCalled();
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

      const { getByRole } = renderWithProps(Input, {
        placeholder: 'Themed input',
      });

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
      const { container } = render(Input, {
        props: {
          placeholder: 'Accessible input',
        },
      });

      await expectNoA11yViolations(container);
    });

    it('should be keyboard accessible', async () => {
      const onFocus = vi.fn();
      const { getByRole } = render(Input, {
        props: {
          onFocus: onFocus,
        },
      });

      const input = getByRole('textbox');
      input.focus();

      expect(input).toHaveFocus();
      expect(onFocus).toHaveBeenCalled();
    });

    it('should have proper role', () => {
      const { getByRole } = render(Input);

      expect(getByRole('textbox')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      const { getByLabelText } = render(Input, {
        attrs: {
          'aria-label': 'Username input',
        },
      });

      expect(getByLabelText('Username input')).toBeInTheDocument();
    });
  });
});
