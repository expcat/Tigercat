/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import { h } from "vue";
import { Menu, MenuItem, SubMenu } from "@tigercat/vue";

describe("Menu", () => {
  it("renders items and basic roles", () => {
    const { container } = render(Menu, {
      slots: {
        default: () => [
          h(MenuItem, { itemKey: "1" }, () => "Item 1"),
          h(MenuItem, { itemKey: "2" }, () => "Item 2"),
        ],
      },
    });

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();

    const menu = container.querySelector("ul");
    expect(menu).toHaveAttribute("role", "menu");
    expect(screen.getByText("Item 1").closest("li")).toHaveAttribute(
      "role",
      "menuitem"
    );
  });

  it("emits update:selectedKeys when selecting an item", async () => {
    const { emitted } = render(Menu, {
      slots: {
        default: () => [h(MenuItem, { itemKey: "1" }, () => "Item 1")],
      },
    });

    await fireEvent.click(screen.getByText("Item 1"));

    expect(emitted()).toHaveProperty("update:selectedKeys");
    const updates = emitted()["update:selectedKeys"] as unknown as Array<
      [unknown]
    >;
    expect(updates[0][0]).toEqual(["1"]);
  });

  it("emits update:openKeys when toggling a submenu", async () => {
    const { emitted } = render(Menu, {
      slots: {
        default: () => [
          h(SubMenu, { itemKey: "sub1", title: "Submenu" }, () => [
            h(MenuItem, { itemKey: "1" }, () => "Sub Item 1"),
          ]),
        ],
      },
    });

    const trigger = screen.getByRole("button", { name: "Submenu" });
    await fireEvent.click(trigger);

    expect(emitted()).toHaveProperty("update:openKeys");
    const updates = emitted()["update:openKeys"] as unknown as Array<[unknown]>;
    expect(updates[0][0]).toEqual(["sub1"]);
  });
});
