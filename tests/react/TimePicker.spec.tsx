/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TimePicker } from '@tigercat/react';
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils';

describe('TimePicker', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<TimePicker />);

      const input = container.querySelector('input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Select time');
    });

    it('should render with custom placeholder', () => {
      const { container } = render(<TimePicker placeholder="Choose a time" />);

      const input = container.querySelector('input');
      expect(input).toHaveAttribute('placeholder', 'Choose a time');
    });

    it('should display formatted time when value is provided', () => {
      const { container } = render(<TimePicker value="14:30" />);

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('14:30');
    });

    it('should display time in 12-hour format', () => {
      const { container } = render(<TimePicker value="14:30" format="12" />);

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('02:30 PM');
    });

    it('should display time with seconds', () => {
      const { container } = render(
        <TimePicker value="14:30:45" showSeconds={true} />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('14:30:45');
    });

    it('should apply custom className', () => {
      const { container } = render(<TimePicker className="custom-class" />);

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = render(<TimePicker size={size} />);

      const input = container.querySelector('input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { container } = render(<TimePicker disabled={true} />);

      const input = container.querySelector('input');
      expect(input).toBeDisabled();
    });

    it('should be readonly when readonly prop is true', () => {
      const { container } = render(<TimePicker readonly={true} />);

      const input = container.querySelector('input');
      expect(input).toHaveAttribute('readonly');
    });

    it('should show clock icon', () => {
      const { container } = render(<TimePicker />);

      const clockIcon = container.querySelector('svg');
      expect(clockIcon).toBeInTheDocument();
    });
  });

  describe('Clear Button', () => {
    it('should show clear button when value is present and clearable is true', () => {
      const { container } = render(
        <TimePicker value="14:30" clearable={true} />
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(1);
    });

    it('should not show clear button when clearable is false', () => {
      const { container } = render(
        <TimePicker value="14:30" clearable={false} />
      );

      const buttons = container.querySelectorAll('button');
      // Should only have the clock icon button
      expect(buttons.length).toBe(1);
    });

    it('should call onChange with null when clear button is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onClear = vi.fn();
      const { container } = render(
        <TimePicker
          value="14:30"
          clearable={true}
          onChange={onChange}
          onClear={onClear}
        />
      );

      const buttons = container.querySelectorAll('button');
      const clearButton = buttons[0]; // First button is clear button

      await user.click(clearButton);

      expect(onChange).toHaveBeenCalledWith(null);
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe('Time Panel', () => {
    it('should open time panel when input is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<TimePicker />);

      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const panel = container.querySelector('[role="dialog"]');
        expect(panel).toBeInTheDocument();
      });
    });

    it('should open time panel when clock icon is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<TimePicker />);

      const buttons = container.querySelectorAll('button');
      const clockButton = buttons[buttons.length - 1]; // Last button is clock button

      await user.click(clockButton);

      await waitFor(() => {
        const panel = container.querySelector('[role="dialog"]');
        expect(panel).toBeInTheDocument();
      });
    });

    it('should display hour, minute columns in panel', async () => {
      const user = userEvent.setup();
      const { container } = render(<TimePicker />);

      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const panel = container.querySelector('[role="dialog"]');
        expect(panel).toBeInTheDocument();

        const columnHeaders = panel?.querySelectorAll('div');
        const hasHourColumn = Array.from(columnHeaders || []).some(
          (el) => el.textContent === 'Hour'
        );
        const hasMinuteColumn = Array.from(columnHeaders || []).some(
          (el) => el.textContent === 'Min'
        );

        expect(hasHourColumn).toBe(true);
        expect(hasMinuteColumn).toBe(true);
      });
    });

    it('should display seconds column when showSeconds is true', async () => {
      const user = userEvent.setup();
      const { container } = render(<TimePicker showSeconds={true} />);

      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const panel = container.querySelector('[role="dialog"]');
        expect(panel).toBeInTheDocument();

        const columnHeaders = panel?.querySelectorAll('div');
        const hasSecondColumn = Array.from(columnHeaders || []).some(
          (el) => el.textContent === 'Sec'
        );

        expect(hasSecondColumn).toBe(true);
      });
    });

    it('should display AM/PM column when format is 12', async () => {
      const user = userEvent.setup();
      const { container } = render(<TimePicker format="12" />);

      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const panel = container.querySelector('[role="dialog"]');
        expect(panel).toBeInTheDocument();

        const buttons = panel?.querySelectorAll('button');
        const hasAM = Array.from(buttons || []).some(
          (el) => el.textContent === 'AM'
        );
        const hasPM = Array.from(buttons || []).some(
          (el) => el.textContent === 'PM'
        );

        expect(hasAM).toBe(true);
        expect(hasPM).toBe(true);
      });
    });
  });

  describe('Time Selection', () => {
    it('should call onChange when time is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<TimePicker onChange={onChange} />);

      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const panel = container.querySelector('[role="dialog"]');
        expect(panel).toBeInTheDocument();
      });

      const panel = container.querySelector('[role="dialog"]');
      const timeButtons = panel?.querySelectorAll(
        'button[aria-label*="hours"]'
      );

      if (timeButtons && timeButtons.length > 0) {
        await user.click(timeButtons[0]);

        expect(onChange).toHaveBeenCalled();
      }
    });

    it('should work in controlled mode', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container, rerender } = render(
        <TimePicker value="10:00" onChange={onChange} />
      );

      let input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('10:00');

      await user.click(input);

      await waitFor(() => {
        const panel = container.querySelector('[role="dialog"]');
        expect(panel).toBeInTheDocument();
      });

      const panel = container.querySelector('[role="dialog"]');
      const timeButtons = panel?.querySelectorAll(
        'button[aria-label*="hours"]'
      );

      if (timeButtons && timeButtons.length > 0) {
        await user.click(timeButtons[0]);
        expect(onChange).toHaveBeenCalled();
      }
    });

    it('should work in uncontrolled mode with defaultValue', async () => {
      const user = userEvent.setup();
      const { container } = render(<TimePicker defaultValue="10:00" />);

      const input = container.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('10:00');
    });
  });

  describe('Footer Buttons', () => {
    it('should have Now and OK buttons in footer', async () => {
      const user = userEvent.setup();
      const { container } = render(<TimePicker />);

      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const panel = container.querySelector('[role="dialog"]');
        expect(panel).toBeInTheDocument();

        const buttons = panel?.querySelectorAll('button');
        const nowButton = Array.from(buttons || []).find(
          (el) => el.textContent === 'Now'
        );
        const okButton = Array.from(buttons || []).find(
          (el) => el.textContent === 'OK'
        );

        expect(nowButton).toBeInTheDocument();
        expect(okButton).toBeInTheDocument();
      });
    });

    it('should set current time when Now button is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<TimePicker onChange={onChange} />);

      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const panel = container.querySelector('[role="dialog"]');
        expect(panel).toBeInTheDocument();
      });

      const panel = container.querySelector('[role="dialog"]');
      const buttons = panel?.querySelectorAll('button');
      const nowButton = Array.from(buttons || []).find(
        (el) => el.textContent === 'Now'
      );

      if (nowButton) {
        await user.click(nowButton);

        expect(onChange).toHaveBeenCalled();

        // Should NOT close on Now
        const panelAfter = container.querySelector('[role="dialog"]');
        expect(panelAfter).toBeInTheDocument();
      }
    });

    it('should close panel when OK button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<TimePicker />);

      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const panel = container.querySelector('[role="dialog"]');
        expect(panel).toBeInTheDocument();
      });

      const panel = container.querySelector('[role="dialog"]');
      const buttons = panel?.querySelectorAll('button');
      const okButton = Array.from(buttons || []).find(
        (el) => el.textContent === 'OK'
      );

      if (okButton) {
        await user.click(okButton);

        await waitFor(() => {
          const panel = container.querySelector('[role="dialog"]');
          expect(panel).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Range Mode', () => {
    it('should clamp end time to start when end is earlier', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <TimePicker range value={['14:30', null]} onChange={onChange} />
      );

      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const panel = container.querySelector('[role="dialog"]');
        expect(panel).toBeInTheDocument();
      });

      const panel = container.querySelector('[role="dialog"]');
      const endTab = Array.from(panel?.querySelectorAll('button') || []).find(
        (el) => el.textContent === 'End'
      );

      if (endTab) {
        await user.click(endTab);
      }

      const hourButtons = panel?.querySelectorAll(
        'button[aria-label*="hours"]'
      );
      if (hourButtons && hourButtons.length > 0) {
        await user.click(hourButtons[0]);
        expect(onChange).toHaveBeenCalledWith(['14:30', '14:30']);
      }
    });
  });

  describe('Theme Support', () => {
    beforeEach(() => {
      clearThemeVariables(['--tiger-primary', '--tiger-primary-hover']);
    });

    afterEach(() => {
      clearThemeVariables(['--tiger-primary', '--tiger-primary-hover']);
    });

    it('should use custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#10b981',
        '--tiger-primary-hover': '#059669',
      });

      const { container } = render(<TimePicker value="14:30" />);

      const input = container.querySelector('input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const { container } = render(<TimePicker />);

      const input = container.querySelector('input');
      expect(input).toHaveAttribute('aria-label');
    });

    it('should pass accessibility checks', async () => {
      const { container } = render(<TimePicker value="14:30" />);

      await expectNoA11yViolations(container);
    });

    it('should have accessible time selection buttons', async () => {
      const user = userEvent.setup();
      const { container } = render(<TimePicker />);

      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const panel = container.querySelector('[role="dialog"]');
        expect(panel).toBeInTheDocument();

        const timeButtons = panel?.querySelectorAll(
          'button[aria-label*="hours"]'
        );
        expect(timeButtons && timeButtons.length).toBeGreaterThan(0);

        timeButtons?.forEach((button) => {
          expect(button).toHaveAttribute('aria-label');
          expect(button).toHaveAttribute('aria-selected');
        });
      });
    });
  });

  describe('Snapshots', () => {
    it('should match snapshot - default', () => {
      const { container } = render(<TimePicker />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot - with value', () => {
      const { container } = render(<TimePicker value="14:30" />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot - 12 hour format', () => {
      const { container } = render(<TimePicker value="14:30" format="12" />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot - with seconds', () => {
      const { container } = render(
        <TimePicker value="14:30:45" showSeconds={true} />
      );
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot - disabled', () => {
      const { container } = render(<TimePicker disabled={true} />);
      expect(container).toMatchSnapshot();
    });
  });
});
