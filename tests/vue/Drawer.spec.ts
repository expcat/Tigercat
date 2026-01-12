/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { Drawer } from "@tigercat/vue";
import { h } from "vue";
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
} from "../utils";

describe("Drawer", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should not render when visible is false (initial)", () => {
    render(Drawer, {
      props: { visible: false, title: "Test Drawer" },
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should render when visible is true", async () => {
    renderWithSlots(
      Drawer,
      { default: () => h("div", "Drawer Content") },
      { props: { visible: true, title: "Test Drawer" } }
    );

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Drawer Content")).toBeInTheDocument();
    });
  });

  it("should link aria-labelledby to an existing title element", async () => {
    render(Drawer, {
      props: { visible: true, title: "Accessible Drawer" },
    });

    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");

      const labelledby = dialog.getAttribute("aria-labelledby");
      expect(labelledby).toBeTruthy();
      expect(document.getElementById(labelledby!)).toBeInTheDocument();
    });
  });

  it("should emit close and update:visible when close button is clicked", async () => {
    const onClose = vi.fn();
    const onUpdateVisible = vi.fn();

    render(Drawer, {
      props: {
        visible: true,
        title: "Test Drawer",
        "onUpdate:visible": onUpdateVisible,
        onClose,
      },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Close drawer")).toBeInTheDocument();
    });

    await fireEvent.click(screen.getByLabelText("Close drawer"));

    expect(onUpdateVisible).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalled();
  });

  it("should close on ESC key press", async () => {
    const onUpdateVisible = vi.fn();

    render(Drawer, {
      props: {
        visible: true,
        title: "Test Drawer",
        "onUpdate:visible": onUpdateVisible,
      },
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onUpdateVisible).toHaveBeenCalledWith(false);
  });

  it("should close when mask is clicked (maskClosable=true)", async () => {
    const onUpdateVisible = vi.fn();

    render(Drawer, {
      props: {
        visible: true,
        title: "Test Drawer",
        "onUpdate:visible": onUpdateVisible,
      },
    });

    await waitFor(() => {
      expect(
        document.querySelector("[data-tiger-drawer-mask]")
      ).toBeInTheDocument();
    });

    fireEvent.click(
      document.querySelector("[data-tiger-drawer-mask]") as Element
    );
    expect(onUpdateVisible).toHaveBeenCalledWith(false);
  });

  it("should not close when mask is clicked (maskClosable=false)", async () => {
    const onUpdateVisible = vi.fn();

    render(Drawer, {
      props: {
        visible: true,
        title: "Test Drawer",
        maskClosable: false,
        "onUpdate:visible": onUpdateVisible,
      },
    });

    await waitFor(() => {
      expect(
        document.querySelector("[data-tiger-drawer-mask]")
      ).toBeInTheDocument();
    });

    fireEvent.click(
      document.querySelector("[data-tiger-drawer-mask]") as Element
    );
    expect(onUpdateVisible).not.toHaveBeenCalled();
  });

  it("should apply custom zIndex", async () => {
    render(Drawer, {
      props: { visible: true, title: "Test Drawer", zIndex: 2000 },
    });

    await waitFor(() => {
      const root = document.querySelector(
        "[data-tiger-drawer-root]"
      ) as HTMLElement;
      expect(root).toHaveStyle({ zIndex: "2000" });
    });
  });

  it("should keep content mounted (hidden) when destroyOnClose is false", async () => {
    const { rerender } = render(Drawer, {
      props: { visible: true, destroyOnClose: false },
      slots: {
        default: () => h("div", { "data-testid": "drawer-content" }, "Content"),
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId("drawer-content")).toBeInTheDocument();
    });

    await rerender({ visible: false, destroyOnClose: false });

    await waitFor(() => {
      const root = document.querySelector(
        "[data-tiger-drawer-root]"
      ) as HTMLElement;
      expect(root).toHaveAttribute("hidden");
      expect(screen.getByTestId("drawer-content")).toBeInTheDocument();
    });
  });

  it("should destroy content when destroyOnClose is true", async () => {
    const { rerender } = render(Drawer, {
      props: { visible: true, destroyOnClose: true },
      slots: {
        default: () => h("div", { "data-testid": "drawer-content" }, "Content"),
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId("drawer-content")).toBeInTheDocument();
    });

    await rerender({ visible: false, destroyOnClose: true });

    await waitFor(() => {
      expect(screen.queryByTestId("drawer-content")).not.toBeInTheDocument();
    });
  });

  it("should emit after-enter/after-leave after 300ms", async () => {
    const onAfterEnter = vi.fn();
    const onAfterLeave = vi.fn();

    const { rerender } = render(Drawer, {
      props: {
        visible: true,
        title: "Test Drawer",
        onAfterEnter,
        onAfterLeave,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(onAfterEnter).toHaveBeenCalled();

    await rerender({
      visible: false,
      title: "Test Drawer",
      onAfterEnter,
      onAfterLeave,
    });
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(onAfterLeave).toHaveBeenCalled();
  });

  it("should pass basic accessibility checks", async () => {
    render(Drawer, {
      props: { visible: true, title: "Accessible Drawer" },
      slots: { default: () => h("div", "Drawer content") },
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    await expectNoA11yViolations(document.body);
  });
});
