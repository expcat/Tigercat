/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { Modal } from "@tigercat/vue";
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
} from "../utils";

const modalSizes = ["sm", "md", "lg", "xl", "full"] as const;

describe("Modal", () => {
  describe("Rendering", () => {
    it("should not render when visible is false", () => {
      const { container } = renderWithProps(Modal, {
        visible: false,
        title: "Test Modal",
        disableTeleport: true,
      });

      expect(
        container.querySelector('[role="dialog"]')
      ).not.toBeInTheDocument();
    });

    it("should render when visible is true", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Test Modal",
        disableTeleport: true,
      });

      await waitFor(() => {
        expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
      });
    });

    it("should render with title", async () => {
      renderWithProps(Modal, {
        visible: true,
        title: "Modal Title",
        disableTeleport: true,
      });

      await waitFor(() => {
        expect(screen.getByText("Modal Title")).toBeInTheDocument();
      });
    });

    it("should render default slot content", async () => {
      const { getByText } = renderWithSlots(
        Modal,
        {
          default: "Modal Content",
        },
        {
          visible: true,
          disableTeleport: true,
        }
      );

      await waitFor(() => {
        expect(getByText("Modal Content")).toBeInTheDocument();
      });
    });

    it("should render custom title slot", async () => {
      const { getByText } = renderWithSlots(
        Modal,
        {
          title: "<strong>Custom Title</strong>",
        },
        {
          visible: true,
          disableTeleport: true,
        }
      );

      await waitFor(() => {
        expect(getByText("Custom Title")).toBeInTheDocument();
      });
    });

    it("should render footer slot", async () => {
      const { getByText } = renderWithSlots(
        Modal,
        {
          default: "Content",
          footer: "<button>Custom Footer</button>",
        },
        {
          visible: true,
          disableTeleport: true,
        }
      );

      await waitFor(() => {
        expect(getByText("Custom Footer")).toBeInTheDocument();
      });
    });
  });

  describe("Props", () => {
    it.each(modalSizes)("should render with size %s", async (size) => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        size,
        title: "Test Modal",
        disableTeleport: true,
      });

      await waitFor(() => {
        const dialog = container.querySelector('[role="dialog"]');
        expect(dialog).toBeInTheDocument();
      });
    });

    it("should show close button by default", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Test Modal",
        disableTeleport: true,
      });

      await waitFor(() => {
        const closeButton = container.querySelector(
          'button[aria-label="Close"]'
        );
        expect(closeButton).toBeInTheDocument();
      });
    });

    it("should hide close button when closable is false", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Test Modal",
        closable: false,
        disableTeleport: true,
      });

      await waitFor(() => {
        const closeButton = container.querySelector(
          'button[aria-label="Close"]'
        );
        expect(closeButton).not.toBeInTheDocument();
      });
    });

    it("should show mask by default", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Test Modal",
        disableTeleport: true,
      });

      await waitFor(() => {
        const mask = container.querySelector("[data-tiger-modal-mask]");
        expect(mask).toBeInTheDocument();
      });
    });

    it("should hide mask when mask is false", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Test Modal",
        mask: false,
        disableTeleport: true,
      });

      await waitFor(() => {
        const mask = container.querySelector("[data-tiger-modal-mask]");
        expect(mask).not.toBeInTheDocument();
      });
    });

    it("should apply custom className", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Test Modal",
        className: "custom-modal-class",
        disableTeleport: true,
      });

      await waitFor(() => {
        const dialog = container.querySelector(".custom-modal-class");
        expect(dialog).toBeInTheDocument();
      });
    });

    it("should apply custom zIndex", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Test Modal",
        zIndex: 2000,
        disableTeleport: true,
      });

      await waitFor(() => {
        const wrapper = container.querySelector(".fixed");
        expect(wrapper).toHaveStyle({ zIndex: "2000" });
      });
    });
  });

  describe("Events", () => {
    it("should emit update:visible and cancel when close button is clicked", async () => {
      const user = userEvent.setup();
      const onUpdateVisible = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(Modal, {
        props: {
          visible: true,
          title: "Test Modal",
          disableTeleport: true,
          "onUpdate:visible": onUpdateVisible,
          onCancel,
        },
      });

      await waitFor(() => {
        const closeButton = container.querySelector(
          'button[aria-label="Close"]'
        );
        expect(closeButton).toBeInTheDocument();
      });

      const closeButton = container.querySelector(
        'button[aria-label="Close"]'
      )!;
      await user.click(closeButton);

      expect(onUpdateVisible).toHaveBeenCalledWith(false);
      expect(onCancel).toHaveBeenCalled();
    });

    it("should emit update:visible and cancel when mask is clicked (maskClosable=true)", async () => {
      const user = userEvent.setup();
      const onUpdateVisible = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(Modal, {
        props: {
          visible: true,
          title: "Test Modal",
          maskClosable: true,
          disableTeleport: true,
          "onUpdate:visible": onUpdateVisible,
          onCancel,
        },
      });

      await waitFor(() => {
        const containerEl = container.querySelector(".flex.min-h-full");
        expect(containerEl).toBeInTheDocument();
      });

      const containerEl = container.querySelector(".flex.min-h-full")!;
      await user.click(containerEl);

      expect(onUpdateVisible).toHaveBeenCalledWith(false);
      expect(onCancel).toHaveBeenCalled();
    });

    it("should not emit events when mask is clicked (maskClosable=false)", async () => {
      const user = userEvent.setup();
      const onUpdateVisible = vi.fn();
      const onCancel = vi.fn();

      const { container } = render(Modal, {
        props: {
          visible: true,
          title: "Test Modal",
          maskClosable: false,
          disableTeleport: true,
          "onUpdate:visible": onUpdateVisible,
          onCancel,
        },
      });

      await waitFor(() => {
        const containerEl = container.querySelector(".flex.min-h-full");
        expect(containerEl).toBeInTheDocument();
      });

      const containerEl = container.querySelector(".flex.min-h-full")!;
      await user.click(containerEl);

      expect(onUpdateVisible).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });

    it("should emit close event when visible changes to false", async () => {
      const onClose = vi.fn();

      const { rerender } = render(Modal, {
        props: {
          visible: true,
          title: "Test Modal",
          disableTeleport: true,
          onClose,
        },
      });

      await rerender({ visible: false, disableTeleport: true });

      expect(onClose).toHaveBeenCalled();
    });

    it("should emit cancel when ESC is pressed", async () => {
      const onCancel = vi.fn();

      const { container } = render(Modal, {
        props: {
          visible: true,
          title: "Test Modal",
          disableTeleport: true,
          onCancel,
        },
      });

      await waitFor(() => {
        expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
      });

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe("States", () => {
    it("should handle centered prop", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Test Modal",
        centered: true,
        disableTeleport: true,
      });

      await waitFor(() => {
        const containerEl = container.querySelector(".items-center");
        expect(containerEl).toBeInTheDocument();
      });
    });

    it("should handle non-centered prop", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Test Modal",
        centered: false,
        disableTeleport: true,
      });

      await waitFor(() => {
        const containerEl = container.querySelector(".items-start");
        expect(containerEl).toBeInTheDocument();
      });
    });

    it("should destroy content when destroyOnClose is true and modal is closed", async () => {
      const { container, rerender } = render(Modal, {
        props: {
          visible: true,
          destroyOnClose: true,
          disableTeleport: true,
        },
        slots: {
          default: '<div data-testid="modal-content">Content</div>',
        },
      });

      await waitFor(() => {
        expect(
          container.querySelector('[data-testid="modal-content"]')
        ).toBeInTheDocument();
      });

      await rerender({
        visible: false,
        destroyOnClose: true,
        disableTeleport: true,
      });

      await waitFor(() => {
        expect(
          container.querySelector('[data-testid="modal-content"]')
        ).not.toBeInTheDocument();
      });
    });

    it("should keep content mounted (hidden) when destroyOnClose is false", async () => {
      const { container, rerender } = render(Modal, {
        props: {
          visible: true,
          destroyOnClose: false,
          disableTeleport: true,
        },
        slots: {
          default: '<div data-testid="modal-content">Content</div>',
        },
      });

      await waitFor(() => {
        expect(
          container.querySelector('[data-testid="modal-content"]')
        ).toBeInTheDocument();
      });

      await rerender({
        visible: false,
        destroyOnClose: false,
        disableTeleport: true,
      });

      await waitFor(() => {
        const root = container.querySelector("[data-tiger-modal-root]");
        expect(root).toHaveAttribute("hidden");
        expect(
          container.querySelector('[data-testid="modal-content"]')
        ).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Test Modal",
        disableTeleport: true,
      });

      await waitFor(() => {
        const dialog = container.querySelector('[role="dialog"]');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute("aria-modal", "true");

        const labelledby = dialog?.getAttribute("aria-labelledby");
        expect(labelledby).toBeTruthy();
        expect(container.querySelector(`#${labelledby}`)).toBeInTheDocument();
      });
    });

    it("should have close button with aria-label", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Test Modal",
        disableTeleport: true,
      });

      await waitFor(() => {
        const closeButton = container.querySelector(
          'button[aria-label="Close"]'
        );
        expect(closeButton).toBeInTheDocument();
      });
    });

    it("should have mask with aria-hidden", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Test Modal",
        disableTeleport: true,
      });

      await waitFor(() => {
        const mask = container.querySelector("[data-tiger-modal-mask]");
        expect(mask).toBeInTheDocument();
        expect(mask).toHaveAttribute("aria-hidden", "true");
      });
    });

    it("should pass basic accessibility checks", async () => {
      const { container } = renderWithProps(Modal, {
        visible: true,
        title: "Accessible Modal",
        disableTeleport: true,
      });

      await waitFor(() => {
        expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
      });

      await expectNoA11yViolations(container);
    });
  });
});
