/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { Radio, RadioGroup } from '@tigercat/vue';
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils';

describe('Radio', () => {
  describe('Rendering', () => {
    it('should render with required value prop', () => {
      const { container } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Option 1' },
      });

      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toBeInTheDocument();
      expect(radio).toHaveAttribute('value', 'option1');
    });

    it('should render with label text', () => {
      const { getByText } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Option 1' },
      });

      expect(getByText('Option 1')).toBeInTheDocument();
    });

    it('should render unchecked by default', () => {
      const { container } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Option 1' },
      });

      const radio = container.querySelector(
        'input[type="radio"]'
      ) as HTMLInputElement;
      expect(radio.checked).toBe(false);
    });

    it('should support defaultChecked (uncontrolled)', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', defaultChecked: true },
        slots: { default: 'Option 1' },
      });

      const radio = container.querySelector(
        'input[type="radio"]'
      ) as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });
  });

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(
        Radio,
        { value: 'option1', size },
        { slots: { default: 'Option' } }
      );

      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toBeInTheDocument();
    });

    it('should apply name attribute', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', name: 'choice' },
        slots: { default: 'Option 1' },
      });

      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveAttribute('name', 'choice');
    });

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', disabled: true },
        slots: { default: 'Disabled' },
      });

      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toBeDisabled();
    });

    it('should be checked when checked prop is true', () => {
      const { container } = render(Radio, {
        props: { value: 'option1', checked: true },
        slots: { default: 'Checked' },
      });

      const radio = container.querySelector(
        'input[type="radio"]'
      ) as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });
  });

  describe('Events', () => {
    it('should emit change event when clicked', async () => {
      const onChange = vi.fn();
      const { container } = render(Radio, {
        props: { value: 'option1', onChange },
        slots: { default: 'Option 1' },
      });

      const radio = container.querySelector('input[type="radio"]')!;
      await fireEvent.click(radio);

      expect(onChange).toHaveBeenCalledWith('option1');
    });

    it('should emit update:checked event', async () => {
      const onUpdate = vi.fn();
      const { container } = render(Radio, {
        props: { value: 'option1', 'onUpdate:checked': onUpdate },
        slots: { default: 'Option 1' },
      });

      const radio = container.querySelector('input[type="radio"]')!;
      await fireEvent.click(radio);

      expect(onUpdate).toHaveBeenCalledWith(true);
    });

    it('should not emit events when disabled', async () => {
      const onChange = vi.fn();
      const { container } = render(Radio, {
        props: { value: 'option1', disabled: true, onChange },
        slots: { default: 'Disabled' },
      });

      const radio = container.querySelector('input[type="radio"]')!;
      await fireEvent.click(radio);

      expect(onChange).not.toHaveBeenCalled();
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

      const { container } = render(Radio, {
        props: { value: 'option1', checked: true },
        slots: { default: 'Themed' },
      });

      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toBeInTheDocument();

      const rootStyles = window.getComputedStyle(document.documentElement);
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe(
        '#ff0000'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Accessible Radio' },
      });

      await expectNoA11yViolations(container);
    });

    it('should be focusable', () => {
      const { container } = render(Radio, {
        props: { value: 'option1' },
        slots: { default: 'Radio' },
      });

      const radio = container.querySelector('input[type="radio"]')!;
      radio.focus();

      expect(radio).toHaveFocus();
    });
  });

  describe('RadioGroup', () => {
    it('should select and switch values in uncontrolled mode', async () => {
      const { container } = render({
        components: { RadioGroup, Radio },
        template: `
          <RadioGroup default-value="a">
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        `,
      });

      const inputs = Array.from(
        container.querySelectorAll('input[type="radio"]')
      ) as HTMLInputElement[];

      expect(inputs[0].checked).toBe(true);
      expect(inputs[1].checked).toBe(false);

      await fireEvent.click(inputs[1]);

      expect(inputs[0].checked).toBe(false);
      expect(inputs[1].checked).toBe(true);
    });

    it('should apply default spacing when no class provided', () => {
      const { container } = render({
        components: { RadioGroup, Radio },
        template: `
          <RadioGroup default-value="a">
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        `,
      });

      const group = container.querySelector('[role="radiogroup"]');
      expect(group).toBeInTheDocument();
      expect(group).toHaveClass('space-y-2');
    });
  });
});
