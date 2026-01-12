/**
 * @vitest-environment happy-dom
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "@tigercat/react";

describe("Pagination", () => {
  it("renders navigation with default aria-label", () => {
    const { container } = render(<Pagination total={100} />);
    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute("role", "navigation");
    expect(nav).toHaveAttribute("aria-label", "分页导航");
  });

  it("allows overriding aria-label via props", () => {
    const { container } = render(
      <Pagination total={100} aria-label="My pagination" />
    );
    expect(container.querySelector("nav")).toHaveAttribute(
      "aria-label",
      "My pagination"
    );
  });

  it("calls onChange when a page button is clicked", async () => {
    const onChange = vi.fn();
    render(<Pagination total={100} pageSize={10} onChange={onChange} />);
    await fireEvent.click(screen.getByLabelText("第 2 页"));
    expect(onChange).toHaveBeenCalledWith(2, 10);
  });

  it("sets aria-current on the active page", () => {
    render(<Pagination total={100} pageSize={10} current={3} />);
    expect(screen.getByLabelText("第 3 页")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("disables prev/next on boundaries", () => {
    const { unmount } = render(
      <Pagination total={100} pageSize={10} current={1} />
    );
    expect(screen.getByLabelText("上一页")).toBeDisabled();

    unmount();
    render(<Pagination total={100} pageSize={10} current={10} />);
    expect(screen.getByLabelText("下一页")).toBeDisabled();
  });

  it("disables all page buttons when disabled", () => {
    render(<Pagination total={100} pageSize={10} disabled />);
    screen.getAllByRole("button").forEach((btn) => expect(btn).toBeDisabled());
  });

  it("hides on single page when hideOnSinglePage is true", () => {
    const { container } = render(
      <Pagination total={5} pageSize={10} hideOnSinglePage />
    );
    expect(container.querySelector("nav")).not.toBeInTheDocument();
  });

  it("jumps to page on Enter when showQuickJumper", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Pagination
        total={100}
        pageSize={10}
        showQuickJumper
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText("跳转页码") as HTMLInputElement;
    await user.type(input, "5");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(5, 10);
    expect(input.value).toBe("");
  });

  it("calls onPageSizeChange and adjusts page when needed", async () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        total={100}
        pageSize={10}
        current={10}
        showSizeChanger
        pageSizeOptions={[10, 20, 50]}
        onPageSizeChange={onPageSizeChange}
      />
    );

    await fireEvent.change(screen.getByLabelText("每页条数"), {
      target: { value: "50" },
    });

    expect(onPageSizeChange).toHaveBeenCalledWith(2, 50);
  });

  it("applies size classes", () => {
    const { container } = render(
      <Pagination total={100} pageSize={10} size="small" />
    );
    expect(container.querySelector("button")).toHaveClass("h-7");
  });
});
