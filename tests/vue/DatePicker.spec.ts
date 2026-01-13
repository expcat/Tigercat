/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { DatePicker } from "@tigercat/vue";
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
} from "../utils";

describe("DatePicker", () => {
  describe("Rendering", () => {
    it("should render with default props", () => {
      const { container } = render(DatePicker);

      const input = container.querySelector("input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "Select date");
    });

    it("should use range placeholder by default in range mode", () => {
      const { container } = renderWithProps(DatePicker, { range: true });
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("placeholder", "Select date range");
    });

    it("should render with custom placeholder", () => {
      const { container } = renderWithProps(DatePicker, {
        placeholder: "Choose a date",
      });

      const input = container.querySelector("input");
      expect(input).toHaveAttribute("placeholder", "Choose a date");
    });

    it("should display formatted date when value is provided", () => {
      const testDate = new Date("2024-01-15");
      const { container } = renderWithProps(DatePicker, {
        modelValue: testDate,
      });

      const input = container.querySelector("input") as HTMLInputElement;
      expect(input.value).toBe("2024-01-15");
    });

    it("should display date in different formats", () => {
      const testDate = new Date("2024-01-15");

      const formats: Array<{
        format: "yyyy-MM-dd" | "MM/dd/yyyy" | "dd/MM/yyyy" | "yyyy/MM/dd";
        expected: string;
      }> = [
        { format: "yyyy-MM-dd", expected: "2024-01-15" },
        { format: "MM/dd/yyyy", expected: "01/15/2024" },
        { format: "dd/MM/yyyy", expected: "15/01/2024" },
        { format: "yyyy/MM/dd", expected: "2024/01/15" },
      ];

      formats.forEach(({ format, expected }) => {
        const { container } = renderWithProps(DatePicker, {
          modelValue: testDate,
          format,
        });

        const input = container.querySelector("input") as HTMLInputElement;
        expect(input.value).toBe(expected);
      });
    });
  });

  describe("Sizes", () => {
    it.each(componentSizes)("should render %s size correctly", (size) => {
      const { container } = renderWithProps(DatePicker, { size });

      const input = container.querySelector("input");
      expect(input).toBeInTheDocument();
    });
  });

  describe("States", () => {
    it("should be disabled when disabled prop is true", () => {
      const { container } = renderWithProps(DatePicker, {
        disabled: true,
      });

      const input = container.querySelector("input");
      expect(input).toBeDisabled();
    });

    it("should be readonly when readonly prop is true", () => {
      const { container } = renderWithProps(DatePicker, {
        readonly: true,
      });

      const input = container.querySelector("input");
      expect(input).toHaveAttribute("readonly");
    });

    it("should show/hide clear button based on clearable", () => {
      const { container: withClear } = renderWithProps(DatePicker, {
        modelValue: new Date("2024-01-15"),
        clearable: true,
      });
      expect(
        withClear.querySelector('button[aria-label="Clear date"]')
      ).toBeInTheDocument();

      const { container: withoutClear } = renderWithProps(DatePicker, {
        modelValue: new Date("2024-01-15"),
        clearable: false,
      });
      expect(
        withoutClear.querySelector('button[aria-label="Clear date"]')
      ).not.toBeInTheDocument();
    });
  });

  describe("Calendar Interaction", () => {
    it("should open calendar when clicking input", async () => {
      const { container } = render(DatePicker);

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });
    });

    it("should navigate to previous/next month", async () => {
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date("2024-03-15"),
      });

      const input = container.querySelector("input") as HTMLInputElement;
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
        expect(calendar?.textContent).toContain("February 2024");
      });
      const nextButton = container.querySelector(
        'button[aria-label="Next month"]'
      ) as HTMLButtonElement;
      await fireEvent.click(nextButton);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar?.textContent).toContain("March 2024");
      });
    });

    it("should close calendar after selecting a date", async () => {
      const { container, emitted } = renderWithProps(DatePicker, {
        modelValue: null,
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });

      // Click on a date button (first available date)
      const dateButtons = container.querySelectorAll("button[aria-selected]");
      if (dateButtons.length > 0) {
        await fireEvent.click(dateButtons[0]);

        await waitFor(() => {
          const calendar = container.querySelector('[role="dialog"]');
          expect(calendar).not.toBeInTheDocument();
        });
      }
    });

    it("should keep calendar open in range mode until OK is clicked", async () => {
      const { container } = renderWithProps(DatePicker, {
        range: true,
        modelValue: [new Date("2024-03-10"), null],
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();

      const beforeStart = screen.getByLabelText(
        "2024-03-05"
      ) as HTMLButtonElement;
      expect(beforeStart).toBeDisabled();

      const endDate = screen.getByLabelText("2024-03-12") as HTMLButtonElement;
      await fireEvent.click(endDate);
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();

      await fireEvent.click(screen.getByRole("button", { name: "Today" }));
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();

      await fireEvent.click(screen.getByRole("button", { name: "OK" }));
      await waitFor(() => {
        expect(
          container.querySelector('[role="dialog"]')
        ).not.toBeInTheDocument();
      });
    });

    it("should support custom labels via labels prop", async () => {
      renderWithProps(DatePicker, {
        range: true,
        modelValue: [new Date("2024-03-10"), null],
        labels: {
          today: "Now",
          ok: "Confirm",
          calendar: "Picker",
          toggleCalendar: "Open picker",
          clearDate: "Clear selection",
          previousMonth: "Prev",
          nextMonth: "Next",
        },
      });

      await fireEvent.click(
        screen.getByRole("button", { name: "Open picker" })
      );

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
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date("2024-03-15"),
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.click(input);

      const start = screen.getByLabelText("2024-03-15") as HTMLButtonElement;
      start.focus();
      expect(start).toHaveFocus();

      await fireEvent.keyDown(screen.getByRole("dialog"), {
        key: "ArrowRight",
      });

      expect(
        screen.getByLabelText("2024-03-16") as HTMLButtonElement
      ).toHaveFocus();
    });

    it("should close on Escape and restore focus to input", async () => {
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date("2024-03-15"),
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.click(input);

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await fireEvent.keyDown(screen.getByRole("dialog"), {
        key: "Escape",
      });

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });

    it("should navigate across months with ArrowRight", async () => {
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date("2024-03-31"),
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.click(input);

      const endOfMonth = screen.getByLabelText(
        "2024-03-31"
      ) as HTMLButtonElement;
      endOfMonth.focus();
      expect(endOfMonth).toHaveFocus();

      await fireEvent.keyDown(screen.getByRole("dialog"), {
        key: "ArrowRight",
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText("2024-04-01") as HTMLButtonElement
        ).toHaveFocus();
      });
    });

    it("should select focused date with Enter (emits update:modelValue)", async () => {
      const { container, emitted } = renderWithProps(DatePicker, {
        modelValue: new Date("2024-03-15"),
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.click(input);

      const target = screen.getByLabelText("2024-03-16") as HTMLButtonElement;
      target.focus();

      await fireEvent.keyDown(screen.getByRole("dialog"), {
        key: "Enter",
      });

      await waitFor(() => {
        expect(emitted()).toHaveProperty("update:modelValue");
      });

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("Events", () => {
    it("should emit update:modelValue when date is selected", async () => {
      const { container, emitted } = renderWithProps(DatePicker, {
        modelValue: null,
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });

      // Click on a date button
      const dateButtons = container.querySelectorAll("button[aria-selected]");
      if (dateButtons.length > 0) {
        await fireEvent.click(dateButtons[0]);

        expect(emitted()).toHaveProperty("update:modelValue");
      }
    });

    it("should emit change event when date is selected", async () => {
      const { container, emitted } = renderWithProps(DatePicker, {
        modelValue: null,
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.click(input);

      await waitFor(() => {
        const calendar = container.querySelector('[role="dialog"]');
        expect(calendar).toBeInTheDocument();
      });

      const dateButtons = container.querySelectorAll("button[aria-selected]");
      if (dateButtons.length > 0) {
        await fireEvent.click(dateButtons[0]);

        expect(emitted()).toHaveProperty("change");
      }
    });

    it("should emit clear event when clear button is clicked", async () => {
      const { container, emitted } = renderWithProps(DatePicker, {
        modelValue: new Date("2024-01-15"),
        clearable: true,
      });

      const clearButton = container.querySelector(
        'button[aria-label="Clear date"]'
      ) as HTMLButtonElement;
      await fireEvent.click(clearButton);

      expect(emitted()).toHaveProperty("clear");
      expect(emitted()).toHaveProperty("update:modelValue");
    });
  });

  describe("Date Constraints", () => {
    it("should disable dates before minDate", async () => {
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date("2024-01-15"),
        minDate: new Date("2024-01-10"),
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.click(input);

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
      const { container } = renderWithProps(DatePicker, {
        modelValue: new Date("2024-01-15"),
        maxDate: new Date("2024-01-20"),
      });

      const input = container.querySelector("input") as HTMLInputElement;
      await fireEvent.click(input);

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
      const { container } = render(DatePicker);
      await expectNoA11yViolations(container);
    });
  });
});
