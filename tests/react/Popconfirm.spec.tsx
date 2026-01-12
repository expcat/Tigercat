/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Popconfirm } from "@tigercat/react";
import {
  renderWithChildren,
  expectNoA11yViolations,
} from "../utils/render-helpers-react";
import React from "react";

describe("Popconfirm", () => {
  it("opens on trigger click and closes on cancel/confirm", async () => {
    const user = userEvent.setup();
    const { getByText, queryByText } = renderWithChildren(
      Popconfirm,
      <button>Action</button>,
      {
        title: "Confirm?",
      }
    );

    expect(queryByText("Confirm?")).not.toBeVisible();

    await user.click(getByText("Action"));
    await waitFor(() => expect(getByText("Confirm?")).toBeVisible());

    await user.click(getByText("取消"));
    await waitFor(() => expect(queryByText("Confirm?")).not.toBeVisible());

    await user.click(getByText("Action"));
    await waitFor(() => expect(getByText("Confirm?")).toBeVisible());

    await user.click(getByText("确定"));
    await waitFor(() => expect(queryByText("Confirm?")).not.toBeVisible());
  });

  it("respects disabled (cannot open)", async () => {
    const user = userEvent.setup();
    const { getByText, queryByText } = renderWithChildren(
      Popconfirm,
      <button>Delete</button>,
      {
        title: "Delete?",
        disabled: true,
      }
    );

    await user.click(getByText("Delete"));
    expect(queryByText("Delete?")).not.toBeVisible();
  });

  it("calls onConfirm/onCancel", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const { getByText } = render(
      <Popconfirm title="Confirm?" onConfirm={onConfirm} onCancel={onCancel}>
        <button>Action</button>
      </Popconfirm>
    );

    await user.click(getByText("Action"));
    await waitFor(() => expect(getByText("确定")).toBeVisible());
    await user.click(getByText("取消"));
    expect(onCancel).toHaveBeenCalledTimes(1);

    await user.click(getByText("Action"));
    await waitFor(() => expect(getByText("确定")).toBeVisible());
    await user.click(getByText("确定"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("supports controlled mode via visible/onVisibleChange", async () => {
    const user = userEvent.setup();

    const TestComponent = () => {
      const [visible, setVisible] = React.useState(false);

      return (
        <>
          <button onClick={() => setVisible(true)}>Show</button>
          <Popconfirm
            title="Confirm?"
            visible={visible}
            onVisibleChange={setVisible}
          >
            <button>Action</button>
          </Popconfirm>
        </>
      );
    };

    const { getByText, queryByText } = render(<TestComponent />);
    expect(queryByText("Confirm?")).not.toBeVisible();

    await user.click(getByText("Show"));
    await waitFor(() => expect(getByText("Confirm?")).toBeVisible());
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const { getByText, queryByText } = renderWithChildren(
      Popconfirm,
      <button>Action</button>,
      {
        title: "Confirm?",
      }
    );

    await user.click(getByText("Action"));
    await waitFor(() => expect(getByText("Confirm?")).toBeVisible());

    await user.keyboard("{Escape}");
    await waitFor(() => expect(queryByText("Confirm?")).not.toBeVisible());
  });

  it("uses theme vars for ok button and danger hover vars", async () => {
    const user = userEvent.setup();
    const { getByText } = renderWithChildren(
      Popconfirm,
      <button>Action</button>,
      {
        title: "Confirm?",
        okType: "danger",
      }
    );

    await user.click(getByText("Action"));
    await waitFor(() => {
      expect(getByText("确定")).toHaveClass("bg-[var(--tiger-error,#ef4444)]");
      expect(getByText("确定")).toHaveClass(
        "hover:bg-[var(--tiger-error-hover,#dc2626)]"
      );
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations", async () => {
      const { container } = renderWithChildren(
        Popconfirm,
        <button>Delete</button>,
        {
          title: "Delete this item?",
          description: "This action cannot be undone.",
        }
      );

      await expectNoA11yViolations(container);
    });
  });

  it("applies custom className", () => {
    const { container } = renderWithChildren(
      Popconfirm,
      <button>Delete</button>,
      {
        title: "Delete?",
        className: "custom-popconfirm",
      }
    );

    expect(container.querySelector(".custom-popconfirm")).toBeInTheDocument();
  });

  it("renders descriptionContent", async () => {
    const user = userEvent.setup();
    const { getByText } = renderWithChildren(
      Popconfirm,
      <button>Delete</button>,
      {
        title: "Delete?",
        descriptionContent: <em>Custom description</em>,
      }
    );

    await user.click(getByText("Delete"));
    await waitFor(() => expect(getByText("Custom description")).toBeVisible());
  });
});
