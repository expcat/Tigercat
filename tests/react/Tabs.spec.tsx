/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Tabs, TabPane } from "@tigercat/react";

describe("Tabs", () => {
  describe("Rendering", () => {
    it("should render with default props", () => {
      render(
        <Tabs>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      expect(screen.getByText("Tab 1")).toBeInTheDocument();
      expect(screen.getByText("Tab 2")).toBeInTheDocument();
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });

    it("should render with line type by default", () => {
      const { container } = render(
        <Tabs>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
        </Tabs>
      );

      const tabNav = container.querySelector('[role="tablist"]');
      expect(tabNav).toBeInTheDocument();
    });

    it("should render with card type", () => {
      render(
        <Tabs type="card">
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
        </Tabs>
      );

      const tab = screen.getByRole("tab", { name: "Tab 1" });
      expect(tab).toHaveClass("border");
      expect(tab).toHaveClass("rounded-t");
    });

    it("should render with editable-card type", () => {
      render(
        <Tabs type="editable-card">
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
        </Tabs>
      );

      const tab = screen.getByRole("tab", { name: "Tab 1" });
      expect(tab).toHaveClass("border");
      expect(tab).toHaveClass("rounded-t");
    });
  });

  describe("Props", () => {
    it("should respect activeKey prop", () => {
      render(
        <Tabs activeKey="2">
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      const tab2 = screen.getByRole("tab", { name: "Tab 2" });

      expect(tab1).toHaveAttribute("aria-selected", "false");
      expect(tab2).toHaveAttribute("aria-selected", "true");
      expect(screen.getByText("Content 2")).toBeVisible();
    });

    it("should respect defaultActiveKey prop in uncontrolled mode", () => {
      render(
        <Tabs defaultActiveKey="2">
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      const tab2 = screen.getByRole("tab", { name: "Tab 2" });
      expect(tab2).toHaveAttribute("aria-selected", "true");
      expect(screen.getByText("Content 2")).toBeVisible();
    });

    it("should render centered tabs", () => {
      const { container } = render(
        <Tabs centered>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
        </Tabs>
      );

      const navList = container.querySelector('[role="tablist"] > div');
      expect(navList).toHaveClass("justify-center");
    });

    it("should render tabs in different positions", () => {
      const positions: Array<"top" | "bottom" | "left" | "right"> = [
        "top",
        "bottom",
        "left",
        "right",
      ];

      positions.forEach((position) => {
        const { container } = render(
          <Tabs tabPosition={position}>
            <TabPane tabKey="1" label="Tab 1">
              Content 1
            </TabPane>
          </Tabs>
        );

        const tabContainer = container.firstChild as HTMLElement;
        if (position === "left" || position === "right") {
          expect(tabContainer).toHaveClass("flex");
        }
      });
    });

    it("should render tabs in different sizes", () => {
      const sizes: Array<"small" | "medium" | "large"> = [
        "small",
        "medium",
        "large",
      ];

      sizes.forEach((size) => {
        render(
          <Tabs size={size}>
            <TabPane tabKey="1" label={`Tab ${size}`}>
              Content 1
            </TabPane>
          </Tabs>
        );

        const tab = screen.getByText(`Tab ${size}`);
        expect(tab).toBeInTheDocument();
      });
    });
  });

  describe("Events", () => {
    it("should call onChange when tab is clicked", async () => {
      const onChange = vi.fn();

      render(
        <Tabs onChange={onChange}>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      const tab2 = screen.getByText("Tab 2");
      await fireEvent.click(tab2);

      expect(onChange).toHaveBeenCalledWith("2");
    });

    it("should call onTabClick when tab is clicked", async () => {
      const onTabClick = vi.fn();

      render(
        <Tabs onTabClick={onTabClick}>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      const tab2 = screen.getByText("Tab 2");
      await fireEvent.click(tab2);

      expect(onTabClick).toHaveBeenCalledWith("2");
    });

    it("should call onEdit when close button is clicked", async () => {
      const onEdit = vi.fn();

      render(
        <Tabs type="editable-card" closable onEdit={onEdit}>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      const closeButton = screen.getByRole("button", { name: "Close Tab 1" });
      await fireEvent.click(closeButton);

      expect(onEdit).toHaveBeenCalledWith({
        targetKey: "1",
        action: "remove",
      });
    });

    it("should call onEdit when Delete/Backspace is pressed on a closable tab", async () => {
      const onEdit = vi.fn();

      render(
        <Tabs
          type="editable-card"
          closable
          onEdit={onEdit}
          defaultActiveKey="1"
        >
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      tab1.focus();

      await fireEvent.keyDown(tab1, { key: "Delete" });
      expect(onEdit).toHaveBeenCalledWith({ targetKey: "1", action: "remove" });
    });

    it("should update active tab in uncontrolled mode", async () => {
      render(
        <Tabs defaultActiveKey="1">
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      expect(screen.getByText("Content 1")).toBeVisible();

      const tab2 = screen.getByText("Tab 2");
      await fireEvent.click(tab2);

      expect(screen.getByText("Content 2")).toBeVisible();
    });

    it("should call onEdit with add when add button is clicked", async () => {
      const onEdit = vi.fn();

      render(
        <Tabs type="editable-card" onEdit={onEdit}>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
        </Tabs>
      );

      await fireEvent.click(screen.getByRole("button", { name: "Add tab" }));

      expect(onEdit).toHaveBeenCalledWith({
        targetKey: undefined,
        action: "add",
      });
    });

    it("should not call onChange when clicking the active tab", async () => {
      const onChange = vi.fn();

      render(
        <Tabs defaultActiveKey="1" onChange={onChange}>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      await fireEvent.click(screen.getByRole("tab", { name: "Tab 1" }));

      expect(onChange).not.toHaveBeenCalled();
    });

    it("should support keyboard navigation and skip disabled tabs", async () => {
      render(
        <Tabs defaultActiveKey="1">
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2" disabled>
            Content 2
          </TabPane>
          <TabPane tabKey="3" label="Tab 3">
            Content 3
          </TabPane>
        </Tabs>
      );

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      const tab3 = screen.getByRole("tab", { name: "Tab 3" });

      tab1.focus();
      expect(tab1).toHaveFocus();

      await fireEvent.keyDown(tab1, { key: "ArrowRight" });
      expect(tab3).toHaveFocus();
      expect(screen.getByText("Content 3")).toBeVisible();
    });

    it("should link tabs and panels with aria attributes", () => {
      render(
        <Tabs defaultActiveKey="1">
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      const panel1 = screen.getByRole("tabpanel", { name: "Tab 1" });

      expect(tab1.getAttribute("id")).toBeTruthy();
      expect(panel1.getAttribute("id")).toBeTruthy();

      expect(tab1).toHaveAttribute("aria-controls", panel1.getAttribute("id")!);
      expect(panel1).toHaveAttribute(
        "aria-labelledby",
        tab1.getAttribute("id")!
      );
    });
  });

  describe("TabPane", () => {
    it("should render tab pane with content", () => {
      render(
        <Tabs>
          <TabPane tabKey="1" label="Tab 1">
            Test Content
          </TabPane>
        </Tabs>
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should render disabled tab pane", () => {
      render(
        <Tabs>
          <TabPane tabKey="1" label="Tab 1" disabled>
            Content 1
          </TabPane>
        </Tabs>
      );

      const tab = screen.getByRole("tab", { name: "Tab 1" });
      expect(tab).toHaveAttribute("aria-disabled", "true");
      expect(tab).toHaveClass("opacity-50");
      expect(tab).toHaveClass("cursor-not-allowed");
    });

    it("should not switch to disabled tab when clicked", async () => {
      const onChange = vi.fn();

      render(
        <Tabs activeKey="1" onChange={onChange}>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2" disabled>
            Content 2
          </TabPane>
        </Tabs>
      );

      const tab2 = screen.getByRole("tab", { name: "Tab 2" });
      await fireEvent.click(tab2);

      expect(onChange).not.toHaveBeenCalled();
    });

    it("should show close button when closable is true", () => {
      render(
        <Tabs type="editable-card" closable>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
        </Tabs>
      );

      const tab = screen.getByRole("tab", { name: "Tab 1" });
      const closeButton = tab.querySelector("svg");
      expect(closeButton).toBeInTheDocument();
    });

    it("should destroy inactive pane when destroyInactiveTabPane is true", () => {
      const { rerender } = render(
        <Tabs activeKey="1" destroyInactiveTabPane>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      // Content 2 should not be in the document
      expect(screen.queryByText("Content 2")).not.toBeInTheDocument();

      // Switch to tab 2
      rerender(
        <Tabs activeKey="2" destroyInactiveTabPane>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      // Now Content 2 should be visible and Content 1 destroyed
      expect(screen.getByText("Content 2")).toBeInTheDocument();
      expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
    });

    it("should render tab with icon", () => {
      const icon = <span data-testid="test-icon">Icon</span>;

      render(
        <Tabs>
          <TabPane tabKey="1" label="Tab 1" icon={icon}>
            Content 1
          </TabPane>
        </Tabs>
      );

      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("should override closable prop per tab", () => {
      render(
        <Tabs type="editable-card" closable>
          <TabPane tabKey="1" label="Tab 1" closable={false}>
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      const tabs = screen.getAllByRole("tab");

      // First tab should not have close button
      const tab1CloseButtons = tabs[0].querySelectorAll("svg");
      expect(tab1CloseButtons.length).toBe(0);

      // Second tab should have close button
      const tab2CloseButtons = tabs[1].querySelectorAll("svg");
      expect(tab2CloseButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA roles", () => {
      const { container } = render(
        <Tabs>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);

      const tabpanels = screen.getAllByRole("tabpanel", { hidden: true });
      expect(tabpanels).toHaveLength(2);
    });

    it("should have proper aria-selected attributes", () => {
      render(
        <Tabs activeKey="1">
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      const tab2 = screen.getByRole("tab", { name: "Tab 2" });

      expect(tab1).toHaveAttribute("aria-selected", "true");
      expect(tab2).toHaveAttribute("aria-selected", "false");
    });

    it("should have proper aria-hidden attributes for tab panels", () => {
      render(
        <Tabs activeKey="1">
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      const panels = screen.getAllByRole("tabpanel", { hidden: true });
      expect(panels[0]).toHaveAttribute("aria-hidden", "false");
      expect(panels[1]).toHaveAttribute("aria-hidden", "true");
    });

    it("should have proper aria-disabled attributes", () => {
      render(
        <Tabs>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2" disabled>
            Content 2
          </TabPane>
        </Tabs>
      );

      const tab1 = screen.getByRole("tab", { name: "Tab 1" });
      const tab2 = screen.getByRole("tab", { name: "Tab 2" });

      expect(tab1).toHaveAttribute("aria-disabled", "false");
      expect(tab2).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Controlled vs Uncontrolled", () => {
    it("should work in controlled mode", async () => {
      const onChange = vi.fn();
      const { rerender } = render(
        <Tabs activeKey="1" onChange={onChange}>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      const tab2 = screen.getByText("Tab 2");
      await fireEvent.click(tab2);

      expect(onChange).toHaveBeenCalledWith("2");

      // Content should still show tab 1 since we didn't update activeKey
      expect(screen.getByText("Content 1")).toBeVisible();

      // Update activeKey prop
      rerender(
        <Tabs activeKey="2" onChange={onChange}>
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      // Now content 2 should be visible
      expect(screen.getByText("Content 2")).toBeVisible();
    });

    it("should work in uncontrolled mode", async () => {
      render(
        <Tabs defaultActiveKey="1">
          <TabPane tabKey="1" label="Tab 1">
            Content 1
          </TabPane>
          <TabPane tabKey="2" label="Tab 2">
            Content 2
          </TabPane>
        </Tabs>
      );

      expect(screen.getByText("Content 1")).toBeVisible();

      const tab2 = screen.getByText("Tab 2");
      await fireEvent.click(tab2);

      // Content should switch automatically
      expect(screen.getByText("Content 2")).toBeVisible();
    });
  });
});
