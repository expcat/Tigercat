/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/vue";
import { Select } from "@tigercat/vue";
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from "../utils";

const testOptions = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
  { label: "Option 3", value: "3" },
];

const groupedOptions = [
  {
    label: "Group A",
    options: [
      { label: "A-1", value: "a1" },
      { label: "A-2", value: "a2" },
    ],
  },
];

const optionsWithDisabledFirst = [
  { label: "Disabled", value: "d", disabled: true },
  { label: "Enabled", value: "e" },
];

describe("Select", () => {
  describe("Rendering", () => {
    it("should render with default props", () => {
      const { container } = render(Select, {
        props: { options: testOptions },
      });

      const trigger = container.querySelector("button");
      expect(trigger).toBeInTheDocument();
    });

    it("should render with placeholder", () => {
      const { getByText } = render(Select, {
        props: {
          options: testOptions,
          placeholder: "Select an option",
        },
      });

      expect(getByText("Select an option")).toBeInTheDocument();
    });

    it("should render with selected value", () => {
      const { getByText } = render(Select, {
        props: {
          options: testOptions,
          modelValue: "1",
        },
      });

      expect(getByText("Option 1")).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it.each(componentSizes)("should render %s size correctly", (size) => {
      const { container } = renderWithProps(Select, {
        options: testOptions,
        size,
      });

      const trigger = container.querySelector("button");
      expect(trigger).toBeInTheDocument();
    });

    it("should be disabled when disabled prop is true", () => {
      const { container } = render(Select, {
        props: {
          options: testOptions,
          disabled: true,
        },
      });

      const trigger = container.querySelector("button");
      expect(trigger).toBeDisabled();
    });

    it("should support clearable option", () => {
      const { container } = render(Select, {
        props: {
          options: testOptions,
          modelValue: "1",
          clearable: true,
        },
      });

      expect(
        container.querySelector("[data-tiger-select-clear]")
      ).toBeInTheDocument();
    });

    it("should support multiple selection", () => {
      const { container } = render(Select, {
        props: {
          options: testOptions,
          multiple: true,
        },
      });

      const trigger = container.querySelector("button");
      expect(trigger).toBeInTheDocument();
    });
  });

  describe("Events", () => {
    it("should emit update:modelValue when option selected", async () => {
      const onUpdate = vi.fn();
      const { container, getByText } = render(Select, {
        props: {
          options: testOptions,
          "onUpdate:modelValue": onUpdate,
        },
      });

      const trigger = container.querySelector("button")!;
      await fireEvent.click(trigger);

      await waitFor(() => {
        const option = getByText("Option 1");
        return fireEvent.click(option);
      });

      expect(onUpdate).toHaveBeenCalledWith("1");
    });

    it("should not emit events when disabled", async () => {
      const onUpdate = vi.fn();
      const { container } = render(Select, {
        props: {
          options: testOptions,
          disabled: true,
          "onUpdate:modelValue": onUpdate,
        },
      });

      const trigger = container.querySelector("button")!;
      await fireEvent.click(trigger);

      expect(onUpdate).not.toHaveBeenCalled();
    });

    it("should emit array value in multiple mode", async () => {
      const onUpdate = vi.fn();
      const { container, getByText } = render(Select, {
        props: {
          options: testOptions,
          multiple: true,
          modelValue: [],
          "onUpdate:modelValue": onUpdate,
        },
      });

      const trigger = container.querySelector("button")!;
      await fireEvent.click(trigger);
      await fireEvent.click(getByText("Option 1"));

      expect(onUpdate).toHaveBeenCalledWith(["1"]);
    });

    it("should emit change event", async () => {
      const onChange = vi.fn();
      const { container, getByText } = render(Select, {
        props: {
          options: testOptions,
          onChange: onChange,
        },
      });

      const trigger = container.querySelector("button")!;
      await fireEvent.click(trigger);

      await waitFor(() => {
        const option = getByText("Option 1");
        return fireEvent.click(option);
      });

      expect(onChange).toHaveBeenCalled();
    });

    it("should clear selection without opening dropdown (single)", async () => {
      const onUpdate = vi.fn();
      const { container, queryByRole } = render(Select, {
        props: {
          options: testOptions,
          modelValue: "1",
          "onUpdate:modelValue": onUpdate,
        },
      });

      const clear = container.querySelector(
        "[data-tiger-select-clear]"
      ) as HTMLElement;
      expect(clear).toBeInTheDocument();

      await fireEvent.click(clear);

      expect(onUpdate).toHaveBeenCalledWith(undefined);
      expect(queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should clear selection (multiple)", async () => {
      const onUpdate = vi.fn();
      const { container } = render(Select, {
        props: {
          options: testOptions,
          multiple: true,
          modelValue: ["1"],
          "onUpdate:modelValue": onUpdate,
        },
      });

      const clear = container.querySelector(
        "[data-tiger-select-clear]"
      ) as HTMLElement;
      await fireEvent.click(clear);

      expect(onUpdate).toHaveBeenCalledWith([]);
    });
  });

  describe("Dropdown", () => {
    it("should open dropdown when clicked", async () => {
      const { container, getByText } = render(Select, {
        props: { options: testOptions },
      });

      const trigger = container.querySelector("button")!;
      await fireEvent.click(trigger);

      await waitFor(() => {
        expect(getByText("Option 1")).toBeInTheDocument();
      });
    });

    it("should close dropdown when option selected", async () => {
      const { container, getByText, queryByText } = render(Select, {
        props: { options: testOptions },
      });

      const trigger = container.querySelector("button")!;
      await fireEvent.click(trigger);

      await waitFor(() => {
        const option = getByText("Option 1");
        return fireEvent.click(option);
      });

      await waitFor(() => {
        expect(queryByText("Option 2")).not.toBeInTheDocument();
      });
    });

    it("should render option groups", async () => {
      const { container, getByText } = render(Select, {
        props: { options: groupedOptions },
      });

      const trigger = container.querySelector("button")!;
      await fireEvent.click(trigger);

      expect(getByText("Group A")).toBeInTheDocument();
      expect(getByText("A-1")).toBeInTheDocument();
    });

    it("should emit search and filter options when searchable", async () => {
      const onSearch = vi.fn();
      const { container, getByText, queryByText } = render(Select, {
        props: {
          options: testOptions,
          searchable: true,
          onSearch,
        },
      });

      const trigger = container.querySelector("button")!;
      await fireEvent.click(trigger);

      const input = container.querySelector("input")!;
      await fireEvent.update(input, "Option 2");

      expect(onSearch).toHaveBeenCalled();
      expect(getByText("Option 2")).toBeInTheDocument();
      expect(queryByText("Option 1")).not.toBeInTheDocument();
    });
  });

  describe("Keyboard Interaction", () => {
    it("should open with ArrowDown and select active option with Enter", async () => {
      const onUpdate = vi.fn();
      const { container, getByRole, queryByText } = render(Select, {
        props: {
          options: testOptions,
          "onUpdate:modelValue": onUpdate,
        },
      });

      const trigger = container.querySelector("button")!;
      trigger.focus();
      expect(trigger).toHaveFocus();

      await fireEvent.keyDown(trigger, { key: "ArrowDown" });

      const firstOption = await waitFor(() =>
        getByRole("option", { name: "Option 1" })
      );
      await waitFor(() => {
        expect(firstOption).toHaveFocus();
      });

      await fireEvent.keyDown(firstOption, { key: "Enter" });
      expect(onUpdate).toHaveBeenCalledWith("1");

      await waitFor(() => {
        expect(queryByText("Option 2")).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
      });
    });

    it("should close with Escape and return focus to trigger", async () => {
      const { container, getByText, queryByText } = render(Select, {
        props: { options: testOptions },
      });

      const trigger = container.querySelector("button")!;
      await fireEvent.click(trigger);

      await waitFor(() => {
        expect(getByText("Option 1")).toBeInTheDocument();
      });

      const firstOption = container.querySelector(
        '[role="option"]'
      ) as HTMLElement;
      await fireEvent.keyDown(firstOption, { key: "Escape" });

      await waitFor(() => {
        expect(queryByText("Option 1")).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
      });
    });

    it("should move focus from search input to options with ArrowDown when searchable", async () => {
      const { container, getByRole } = render(Select, {
        props: { options: testOptions, searchable: true },
      });

      const trigger = container.querySelector("button")!;
      await fireEvent.click(trigger);

      const input = container.querySelector("input") as HTMLInputElement;
      await waitFor(() => {
        expect(input).toHaveFocus();
      });

      await fireEvent.keyDown(input, { key: "ArrowDown" });
      const firstOption = getByRole("option", { name: "Option 1" });

      await waitFor(() => {
        expect(firstOption).toHaveFocus();
      });
    });

    it("should skip disabled options when opening with ArrowDown", async () => {
      const onUpdate = vi.fn();
      const { container, getByRole } = render(Select, {
        props: {
          options: optionsWithDisabledFirst,
          "onUpdate:modelValue": onUpdate,
        },
      });

      const trigger = container.querySelector("button")!;
      trigger.focus();

      await fireEvent.keyDown(trigger, { key: "ArrowDown" });

      const enabledOption = await waitFor(() =>
        getByRole("option", { name: "Enabled" })
      );

      await waitFor(() => {
        expect(enabledOption).toHaveFocus();
      });

      await fireEvent.keyDown(enabledOption, { key: "Enter" });
      expect(onUpdate).toHaveBeenCalledWith("e");
    });
  });

  describe("Theme Support", () => {
    afterEach(() => {
      clearThemeVariables(["--tiger-primary"]);
    });

    it("should support custom theme colors", () => {
      setThemeVariables({
        "--tiger-primary": "#ff0000",
      });

      const { container } = render(Select, {
        props: { options: testOptions },
      });

      const trigger = container.querySelector("button");
      expect(trigger).toBeInTheDocument();

      const rootStyles = window.getComputedStyle(document.documentElement);
      expect(rootStyles.getPropertyValue("--tiger-primary").trim()).toBe(
        "#ff0000"
      );
    });
  });

  describe("Accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(Select, {
        props: {
          options: testOptions,
          placeholder: "Select option",
        },
      });

      await expectNoA11yViolations(container);
    });

    it("should have proper button element", () => {
      const { container } = render(Select, {
        props: { options: testOptions },
      });

      const trigger = container.querySelector("button");
      expect(trigger).toHaveAttribute("type", "button");
    });

    it("should be keyboard accessible", async () => {
      const { container } = render(Select, {
        props: { options: testOptions },
      });

      const trigger = container.querySelector("button")!;
      trigger.focus();

      expect(trigger).toHaveFocus();
    });
  });
});
