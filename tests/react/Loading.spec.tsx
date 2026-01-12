import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { Loading } from "../../packages/react/src/components/Loading";

describe("Loading (React)", () => {
  it("renders with a11y defaults", () => {
    render(<Loading />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Loading");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-busy", "true");
  });

  it("renders text and uses it as aria-label", () => {
    render(<Loading text="Loading data" />);
    expect(screen.getByText("Loading data")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Loading data"
    );
  });

  it("renders dots and bars variants", () => {
    const { container: dotsContainer } = render(<Loading variant="dots" />);
    expect(dotsContainer.querySelectorAll(".animate-bounce-dot")).toHaveLength(
      3
    );

    const { container: barsContainer } = render(<Loading variant="bars" />);
    expect(barsContainer.querySelectorAll(".animate-scale-bar")).toHaveLength(
      3
    );
  });

  it("supports fullscreen background", () => {
    const { container } = render(
      <Loading fullscreen background="rgba(0, 0, 0, 0.8)" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ backgroundColor: "rgba(0, 0, 0, 0.8)" });
  });

  it("forwards attributes", () => {
    render(<Loading data-testid="loading" />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("respects delay", async () => {
    vi.useFakeTimers();

    render(<Loading delay={100} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
    vi.useRealTimers();
  });
});
