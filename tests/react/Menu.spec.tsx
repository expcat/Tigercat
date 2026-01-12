/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu, MenuItem, SubMenu } from "@tigercat/react";
import React from "react";

describe("Menu", () => {
  it("renders items and basic roles", () => {
    const { container } = render(
      <Menu>
        <MenuItem itemKey="1">Item 1</MenuItem>
        <MenuItem itemKey="2">Item 2</MenuItem>
      </Menu>
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();

    const menu = container.querySelector("ul");
    expect(menu).toHaveAttribute("role", "menu");
    expect(screen.getByText("Item 1").closest("li")).toHaveAttribute(
      "role",
      "menuitem"
    );
  });

  it("supports uncontrolled selection and calls onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Menu defaultSelectedKeys={[]} onSelect={onSelect}>
        <MenuItem itemKey="1">Item 1</MenuItem>
        <MenuItem itemKey="2">Item 2</MenuItem>
      </Menu>
    );

    const item2 = screen.getByText("Item 2").closest("li");
    await user.click(item2 as HTMLElement);

    expect(onSelect).toHaveBeenCalledWith("2", { selectedKeys: ["2"] });
    expect(item2).toHaveClass("font-medium");
  });

  it("supports uncontrolled openKeys and calls onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Menu defaultOpenKeys={[]} onOpenChange={onOpenChange}>
        <SubMenu itemKey="sub1" title="Submenu">
          <MenuItem itemKey="1">Sub Item 1</MenuItem>
        </SubMenu>
      </Menu>
    );

    const trigger = screen.getByRole("button", { name: "Submenu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(onOpenChange).toHaveBeenCalledWith("sub1", { openKeys: ["sub1"] });
  });
});
