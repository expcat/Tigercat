/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/vue';
import { DatePicker } from '@tigercat/vue';
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils';

describe('DatePicker', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(DatePicker);

      const input = container.querySelector('input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Select date');
    });

    it('should render with custom placeholder', () => {
      const { container } = renderWithProps(DatePicker, {
        placeholder: 'Choose a date',
      });

      const input = container.querySelector('input');
      expect(input).toHaveAttribute('placeholder', 'Choose a date');
    });

    it('should display formatted date when value is provided', () => {
      const testDate = new Date('2024-01-15');
      const { container } = renderWithProps(DatePicker, {
        modelValue: testDate,
      });

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('2024-01-15');
    });

    it('should display date in different formats', () => {
      const testDate = new Date('2024-01-15');

      const formats: Array<{
        format: 'yyyy-MM-dd' | 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy/MM/dd';
        expected: string;
      }> = [
        { format: 'yyyy-MM-dd', expected: '2024-01-15' },
        { format: 'MM/dd/yyyy', expected: '01/15/2024' },
        { format: 'dd/MM/yyyy', expected: '15/01/2024' },
        { format: 'yyyy/MM/dd', expected: '2024/01/15' },
      ];

      formats.forEach(({ format, expected }) => {
        const { container } = renderWithProps(DatePicker, {
          modelValue: testDate,
          format,
        });

        const input = container.querySelector('input') as HTMLInputElement;
        expect(input.value).toBe(expected);
      });
    });
  });

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(DatePicker, { size });

      const input = container.querySelector('input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { container } = renderWithProps(DatePicker, {
        disabled: true,
      });

      const input = container.querySelector('input');
      expect(input).toBeDisabled();
    });

    it('should be readonly when readonly prop is true', () => {
      const { container } = renderWithProps(DatePicker, {
        readonly: true,
      });

      const input = container.querySelector('input');
      expect(input).toHaveAttribute('readonly');
    });

    it('should show calendar icon', () => {
      const { container } = render(DatePicker);

      const calendarIcon = container.querySelector('svg');
      expect(calendarIcon).toBeInTheDocument();
    });

    it('should show clear button when value is set and clearable is true', () => {
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date('2024-01-15'),
        clearable: true,
      });

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(1); // Calendar icon button + clear button
    });

    it('should not show clear button when clearable is false', () => {
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date('2024-01-15'),
        clearable: false,
      });

      // Should only have the calendar icon button
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(1);
    });
  });

  describe('Calendar Interaction', () => {
    it('should open calendar when clicking input', async () => {
      const { container } = render(DatePicker);

      const input = container.querySelector('input') as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });
    });

    it('should open calendar when clicking calendar icon', async () => {
      const { container } = render(DatePicker);

      const calendarButton = container.querySelectorAll('button')[0];
      await fireEvent.click(calendarButton);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });
    });

    it('should display current month and year in calendar header', async () => {
      const { container } = render(DatePicker);

      const input = container.querySelector('input') as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();

        const currentDate = new Date();
        const monthNames = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        const expectedHeader = `${
          monthNames[currentDate.getMonth()]
        } ${currentDate.getFullYear()}`;
        expect(calendar?.textContent).toContain(expectedHeader);
      });
    });

    it('should navigate to previous month', async () => {
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date('2024-03-15'),
      });

      const input = container.querySelector('input') as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });

      const prevButton = container.querySelector(
        'button[aria-label="Previous month"]'
      ) as HTMLButtonElement;
      await fireEvent.click(prevButton);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar?.textContent).toContain('February 2024');
      });
    });

    it('should navigate to next month', async () => {
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date('2024-03-15'),
      });

      const input = container.querySelector('input') as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });

      const nextButton = container.querySelector(
        'button[aria-label="Next month"]'
      ) as HTMLButtonElement;
      await fireEvent.click(nextButton);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar?.textContent).toContain('April 2024');
      });
    });

    it('should close calendar after selecting a date', async () => {
      const { container, emitted } = renderWithProps(DatePicker, {
        modelValue: null,
      });

      const input = container.querySelector('input') as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });

      // Click on a date button (first available date)
      const dateButtons = container.querySelectorAll('button[aria-selected]');
      if (dateButtons.length > 0) {
        await fireEvent.click(dateButtons[0]);

        await waitFor(() => {
          const calendar = container.querySelector('[role="dialog"]');
          expect(calendar).not.toBeInTheDocument();
        });
      }
    });

    it('should keep calendar open in range mode until OK is clicked', async () => {
      const { container } = renderWithProps(DatePicker, {
        range: true,
        modelValue: [new Date('2024-03-10'), null],
      });

      const input = container.querySelector('input') as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();

      const beforeStart = screen.getByLabelText(
        '2024-03-05'
      ) as HTMLButtonElement;
      expect(beforeStart).toBeDisabled();

      const endDate = screen.getByLabelText('2024-03-12') as HTMLButtonElement;
      await fireEvent.click(endDate);
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();

      await fireEvent.click(screen.getByRole('button', { name: 'Today' }));
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();

      await fireEvent.click(screen.getByRole('button', { name: 'OK' }));
      await waitFor(() => {
        expect(
          container.querySelector('[role="dialog"]')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Events', () => {
    it('should emit update:modelValue when date is selected', async () => {
      const { container, emitted } = renderWithProps(DatePicker, {
        modelValue: null,
      });

      const input = container.querySelector('input') as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });

      // Click on a date button
      const dateButtons = container.querySelectorAll('button[aria-selected]');
      if (dateButtons.length > 0) {
        await fireEvent.click(dateButtons[0]);

        expect(emitted()).toHaveProperty('update:modelValue');
      }
    });

    it('should emit change event when date is selected', async () => {
      const { container, emitted } = renderWithProps(DatePicker, {
        modelValue: null,
      });

      const input = container.querySelector('input') as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });

      const dateButtons = container.querySelectorAll('button[aria-selected]');
      if (dateButtons.length > 0) {
        await fireEvent.click(dateButtons[0]);

        expect(emitted()).toHaveProperty('change');
      }
    });

    it('should emit clear event when clear button is clicked', async () => {
      const { container, emitted } = renderWithProps(DatePicker, {
        modelValue: new Date('2024-01-15'),
        clearable: true,
      });

      const clearButton = container.querySelector(
        'button[aria-label="Clear date"]'
      ) as HTMLButtonElement;
      await fireEvent.click(clearButton);

      expect(emitted()).toHaveProperty('clear');
      expect(emitted()).toHaveProperty('update:modelValue');
    });
  });

  describe('Date Constraints', () => {
    it('should disable dates before minDate', async () => {
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date('2024-01-15'),
        minDate: new Date('2024-01-10'),
      });

      const input = container.querySelector('input') as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();

        // Check that some date buttons are disabled
        const disabledButtons = container.querySelectorAll(
          'button[disabled][aria-selected]'
        );
        expect(disabledButtons.length).toBeGreaterThan(0);
      });
    });

    it('should disable dates after maxDate', async () => {
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date('2024-01-15'),
        maxDate: new Date('2024-01-20'),
      });

      const input = container.querySelector('input') as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();

        const disabledButtons = container.querySelectorAll(
          'button[disabled][aria-selected]'
        );
        expect(disabledButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Theme Support', () => {
    beforeEach(() => {
      clearThemeVariables(['--tiger-primary', '--tiger-primary-hover']);
    });

    afterEach(() => {
      clearThemeVariables(['--tiger-primary', '--tiger-primary-hover']);
    });

    it('should support theme customization via CSS variables', () => {
      setThemeVariables({
        '--tiger-primary': '#10b981',
        '--tiger-primary-hover': '#059669',
      });

      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date('2024-01-15'),
      });

      expect(container.querySelector('input')).toBeInTheDocument();

      const primaryColor = getComputedStyle(
        document.documentElement
      ).getPropertyValue('--tiger-primary');
      expect(primaryColor).toBe('#10b981');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on input', () => {
      const { container } = render(DatePicker);

      const input = container.querySelector('input');
      expect(input).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA attributes on calendar', async () => {
      const { container } = render(DatePicker);

      const input = container.querySelector('input') as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
        expect(calendar).toHaveAttribute('aria-label', 'Calendar');
      });
    });

    it('should have accessible navigation buttons', async () => {
      const { container } = render(DatePicker);

      const input = container.querySelector('input') as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const prevButton = container.querySelector(
          'button[aria-label="Previous month"]'
        );
        const nextButton = container.querySelector(
          'button[aria-label="Next month"]'
        );

        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
      });
    });

    it('should pass accessibility checks', async () => {
      const { container } = render(DatePicker);
      await expectNoA11yViolations(container);
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot with default props', () => {
      const { container } = render(DatePicker);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with selected date', () => {
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date('2024-01-15'),
      });
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot when disabled', () => {
      const { container } = renderWithProps(DatePicker, {
        disabled: true,
      });
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
