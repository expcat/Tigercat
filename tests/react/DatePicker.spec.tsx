/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { DatePicker } from "@tigercat/react";
import { expectNoA11yViolations, componentSizes } from "../utils/react";

describe("DatePicker", () => {
  describe("Rendering", () => {
    it("should render with default props", () => {
      const { container } = render(<DatePicker />);

      const input = container.querySelector("input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "Select date");
    });

    it("should use range placeholder by default in range mode", () => {
      const { container } = render(<DatePicker range />);
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("placeholder", "Select date range");
    });

    it("should render with custom placeholder", () => {
      const { container } = render(<DatePicker placeholder="Choose a date" />);

      const input = container.querySelector("input");
      expect(input).toHaveAttribute("placeholder", "Choose a date");
    });

    it("should display formatted date when value is provided", () => {
      const testDate = new Date("2024-01-15");
      const { container } = render(<DatePicker value={testDate} />);

      const input = container.querySelector("input") as HTMLInputElement;
      expect(input.value).toBe("2024-01-15");
    });

    it("should display date in different formats", () => {
      const testDate = new Date("2024-01-15");

      const formats = [
        { format: "yyyy-MM-dd" as const, expected: "2024-01-15" },
        { format: "MM/dd/yyyy" as const, expected: "01/15/2024" },
        { format: "dd/MM/yyyy" as const, expected: "15/01/2024" },
        { format: "yyyy/MM/dd" as const, expected: "2024/01/15" },
      ];

      formats.forEach(({ format, expected }) => {
        const { container } = render(
          <DatePicker value={testDate} format={format} />
        );

        const input = container.querySelector("input") as HTMLInputElement;
        expect(input.value).toBe(expected);
      });
    });

    it("should apply custom className", () => {
      const { container } = render(<DatePicker className="custom-class" />);

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it.each(componentSizes)("should render %s size correctly", (size) => {
      const { container } = render(<DatePicker size={size} />);

      const input = container.querySelector("input");
      expect(input).toBeInTheDocument();
    });
  });

  describe("States", () => {
    it("should be disabled when disabled prop is true", () => {
      const { container } = render(<DatePicker disabled={true} />);

      const input = container.querySelector("input");
      expect(input).toBeDisabled();
    });

    it("should be readonly when readonly prop is true", () => {
      const { container } = render(<DatePicker readonly={true} />);

      const input = container.querySelector("input");
      expect(input).toHaveAttribute("readonly");
    });

    it("should show/hide clear button based on clearable", () => {
      const { container: withClear } = render(
        <DatePicker value={new Date("2024-01-15")} clearable={true} />
      );
      expect(
        withClear.querySelector('button[aria-label="Clear date"]')
      ).toBeInTheDocument();

      const { container: withoutClear } = render(
        <DatePicker value={new Date("2024-01-15")} clearable={false} />
      );
      expect(
        withoutClear.querySelector('button[aria-label="Clear date"]')
      ).not.toBeInTheDocument();
    });
  });

  describe("Calendar Interaction", () => {
    it("should open calendar when clicking input", async () => {
      const user = userEvent.setup();
      const { container } = render(<DatePicker />);

      const input = container.querySelector("input") as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });
    });

    it("should navigate to previous/next month", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DatePicker value={new Date("2024-03-15")} />
      );

      const input = container.querySelector("input") as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });

      const prevButton = container.querySelector(
        'button[aria-label="Previous month"]'
      ) as HTMLButtonElement;
      await user.click(prevButton);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar?.textContent).toContain("February 2024");
      });
      const nextButton = container.querySelector(
        'button[aria-label="Next month"]'
      ) as HTMLButtonElement;
      await user.click(nextButton);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar?.textContent).toContain("March 2024");
      });
    });

    it("should close calendar after selecting a date", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<DatePicker onChange={onChange} />);

      const input = container.querySelector("input") as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });

      // Click on a date button (first available date)
      const dateButtons = container.querySelectorAll("button[aria-selected]");
      if (dateButtons.length > 0) {
        await user.click(dateButtons[0]);

        await waitFor(() => {
          const calendar = container.querySelector('[role="dialog"]');
          expect(calendar).not.toBeInTheDocument();
        });
      }
    });

    it("should keep calendar open in range mode until OK is clicked", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DatePicker range defaultValue={[new Date("2024-03-10"), null]} />
      );

      const input = container.querySelector("input") as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
      });

      // Footer buttons
      expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();

      // End cannot be earlier than start (disabled)
      const beforeStart = screen.getByLabelText(
        "2024-03-05"
      ) as HTMLButtonElement;
      expect(beforeStart).toBeDisabled();

      // Selecting an end date should NOT close the calendar
      const endDate = screen.getByLabelText("2024-03-12") as HTMLButtonElement;
      await user.click(endDate);
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();

      // Today should not close the calendar
      await user.click(screen.getByRole("button", { name: "Today" }));
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();

      // OK closes the calendar
      await user.click(screen.getByRole("button", { name: "OK" }));
      await waitFor(() => {
        expect(
          container.querySelector('[role="dialog"]')
        ).not.toBeInTheDocument();
      });
    });

    it("should support custom labels via labels prop", async () => {
      const user = userEvent.setup();
      render(
        <DatePicker
          range
          defaultValue={[new Date("2024-03-10"), null]}
          labels={{
            today: "Now",
            ok: "Confirm",
            calendar: "Picker",
            toggleCalendar: "Open picker",
            clearDate: "Clear selection",
            previousMonth: "Prev",
            nextMonth: "Next",
          }}
        />
      );

      await user.click(screen.getByRole("button", { name: "Open picker" }));

      expect(
        screen.getByRole("dialog", { name: "Picker" })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Prev" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();

      expect(screen.getByRole("button", { name: "Now" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm" })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: "Clear selection" })
      ).toBeInTheDocument();
    });
  });

  describe("Keyboard", () => {
    it("should move focus with ArrowRight", async () => {
      const user = userEvent.setup();
      render(<DatePicker value={new Date("2024-03-15")} />);

      const input = screen.getByRole("textbox");
      await user.click(input);

      const start = screen.getByLabelText("2024-03-15") as HTMLButtonElement;
      start.focus();
      expect(start).toHaveFocus();

      await user.keyboard("{ArrowRight}");
      expect(
        screen.getByLabelText("2024-03-16") as HTMLButtonElement
      ).toHaveFocus();
    });

    it("should close on Escape and restore focus to input", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DatePicker value={new Date("2024-03-15")} />
      );

      const input = container.querySelector("input") as HTMLInputElement;
      await user.click(input);

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });

    it("should navigate across months with ArrowRight", async () => {
      const user = userEvent.setup();
      render(<DatePicker value={new Date("2024-03-31")} />);

      await user.click(screen.getByRole("textbox"));

      const endOfMonth = screen.getByLabelText(
        "2024-03-31"
      ) as HTMLButtonElement;
      endOfMonth.focus();
      expect(endOfMonth).toHaveFocus();

      await user.keyboard("{ArrowRight}");

      await waitFor(() => {
        expect(
          screen.getByLabelText("2024-04-01") as HTMLButtonElement
        ).toHaveFocus();
      });
    });

    it("should select focused date with Enter (uncontrolled)", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <DatePicker defaultValue={new Date("2024-03-15")} onChange={onChange} />
      );

      const input = container.querySelector("input") as HTMLInputElement;
      await user.click(input);

      const target = screen.getByLabelText("2024-03-16") as HTMLButtonElement;
      target.focus();
      await user.keyboard("{Enter}");

      expect(onChange).toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      expect(input.value).toBe("2024-03-16");
    });
  });

  describe("Events", () => {
    it("should call onChange when date is selected", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<DatePicker onChange={onChange} />);

      const input = container.querySelector("input") as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });

      // Click on a date button
      const dateButtons = container.querySelectorAll("button[aria-selected]");
      if (dateButtons.length > 0) {
        await user.click(dateButtons[0]);

        expect(onChange).toHaveBeenCalled();
      }
    });

    it("should call onChange and onClear when clear button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onClear = vi.fn();
      const { container } = render(
        <DatePicker
          value={new Date("2024-01-15")}
          onChange={onChange}
          onClear={onClear}
          clearable={true}
        />
      );

      const clearButton = container.querySelector(
        'button[aria-label="Clear date"]'
      ) as HTMLButtonElement;
      await user.click(clearButton);

      expect(onChange).toHaveBeenCalledWith(null);
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe("Controlled vs Uncontrolled", () => {
    it("should work as controlled component", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container, rerender } = render(
        <DatePicker value={null} onChange={onChange} />
      );

      const input = container.querySelector("input") as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });

      const dateButtons = container.querySelectorAll("button[aria-selected]");
      if (dateButtons.length > 0) {
        await user.click(dateButtons[0]);
        expect(onChange).toHaveBeenCalled();
      }
    });

    it("should work as uncontrolled component with defaultValue", () => {
      const testDate = new Date("2024-01-15");
      const { container } = render(<DatePicker defaultValue={testDate} />);

      const input = container.querySelector("input") as HTMLInputElement;
      expect(input.value).toBe("2024-01-15");
    });
  });

  describe("Date Constraints", () => {
    it("should disable dates before minDate", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DatePicker
          value={new Date("2024-01-15")}
          minDate={new Date("2024-01-10")}
        />
      );

      const input = container.querySelector("input") as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();

        // Check that some date buttons are disabled
        const disabledButtons = container.querySelectorAll(
          "button[disabled][aria-selected]"
        );
        expect(disabledButtons.length).toBeGreaterThan(0);
      });
    });

    it("should disable dates after maxDate", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DatePicker
          value={new Date("2024-01-15")}
          maxDate={new Date("2024-01-20")}
        />
      );

      const input = container.querySelector("input") as HTMLInputElement;
      await user.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();

        const disabledButtons = container.querySelectorAll(
          "button[disabled][aria-selected]"
        );
        expect(disabledButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Accessibility", () => {
    it("should pass accessibility checks", async () => {
      const { container } = render(<DatePicker />);
      await expectNoA11yViolations(container);
    });
  });
});
