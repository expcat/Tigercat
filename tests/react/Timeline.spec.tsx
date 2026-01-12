import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Timeline } from "../../packages/react/src/components/Timeline";
import type { TimelineItem } from "../../packages/core/src/types/timeline";

describe("Timeline (React)", () => {
  it("renders labels and content", () => {
    const items: TimelineItem[] = [
      { key: 1, label: "2024-01-01", content: "Create project" },
    ];

    render(<Timeline items={items} />);

    expect(screen.getByText("2024-01-01")).toBeTruthy();
    expect(screen.getByText("Create project")).toBeTruthy();
  });

  it("supports mode=right and mode=alternate", () => {
    const items: TimelineItem[] = [
      { key: 1, content: "Event 1" },
      { key: 2, content: "Event 2" },
    ];

    const { container: rightContainer } = render(
      <Timeline items={items} mode="right" />
    );
    expect(rightContainer.querySelector("li")?.className).toContain("pr-8");
    expect(rightContainer.querySelector("li")?.className).toContain(
      "text-right"
    );

    const { container: altContainer } = render(
      <Timeline items={items} mode="alternate" />
    );
    const listItems = altContainer.querySelectorAll("li");
    expect(listItems[0].className).toContain("flex-row-reverse");
    expect(listItems[1].className).toContain("pl-8");
  });

  it("renders pending item and supports custom pending UI", () => {
    const items: TimelineItem[] = [{ key: 1, content: "Event 1" }];

    const { container } = render(
      <Timeline
        items={items}
        pending
        pendingDot={<div>Pending Dot</div>}
        pendingContent={<div>Pending Content</div>}
      />
    );

    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.querySelector("ul")?.getAttribute("aria-busy")).toBe(
      "true"
    );
    expect(screen.getByText("Pending Dot")).toBeTruthy();
    expect(screen.getByText("Pending Content")).toBeTruthy();
  });

  it("supports reverse order", () => {
    const items: TimelineItem[] = [
      { key: 1, content: "Event 1" },
      { key: 2, content: "Event 2" },
      { key: 3, content: "Event 3" },
    ];

    render(<Timeline items={items} reverse />);

    const contents = screen.getAllByText(/Event \d/);
    expect(contents[0].textContent).toBe("Event 3");
  });

  it("supports renderItem and renderDot", () => {
    const items: TimelineItem[] = [{ key: 1, content: "Event 1" }];

    render(
      <Timeline
        items={items}
        renderDot={() => <div>Dot</div>}
        renderItem={(item) => <div>Custom: {item.content}</div>}
      />
    );

    expect(screen.getByText("Dot")).toBeTruthy();
    expect(screen.getByText("Custom: Event 1")).toBeTruthy();
  });

  it("passes through ul attributes and merges className", () => {
    const { getByTestId } = render(
      <Timeline
        items={[]}
        className="custom"
        data-testid="timeline"
        aria-label="Timeline"
      />
    );

    const ul = getByTestId("timeline");
    expect(ul.getAttribute("aria-label")).toBe("Timeline");
    expect(ul.className).toContain("custom");
  });
});
