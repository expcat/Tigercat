import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Descriptions } from "../../packages/react/src/components/Descriptions";
import type { DescriptionsItem } from "../../packages/core/src/types/descriptions";

describe("Descriptions (React)", () => {
  it("renders title and extra", () => {
    const items: DescriptionsItem[] = [{ label: "Name", content: "John Doe" }];
    render(
      <Descriptions title="User" items={items} extra={<a href="#">Edit</a>} />
    );

    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders horizontal table layout by default", () => {
    const items: DescriptionsItem[] = [{ label: "Name", content: "John Doe" }];
    const { container } = render(<Descriptions items={items} />);

    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.querySelector("th")?.textContent).toContain("Name");
    expect(container.querySelector("td")?.textContent).toContain("John Doe");
  });

  it("renders non-bordered vertical layout as dl/dt/dd", () => {
    const items: DescriptionsItem[] = [{ label: "CPU", content: "8C" }];
    const { container } = render(
      <Descriptions items={items} layout="vertical" />
    );

    expect(container.querySelector("dl")).toBeInTheDocument();
    expect(container.querySelector("dt")?.textContent).toContain("CPU");
    expect(container.querySelector("dd")?.textContent).toContain("8C");
  });

  it("renders bordered vertical layout as table", () => {
    const items: DescriptionsItem[] = [{ label: "CPU", content: "8C" }];
    const { container } = render(
      <Descriptions items={items} layout="vertical" bordered />
    );

    expect(container.querySelector("table")).toBeInTheDocument();
  });

  it("respects column and span in horizontal layout", () => {
    const items: DescriptionsItem[] = [
      { label: "Name", content: "John Doe" },
      { label: "Email", content: "john@example.com" },
      { label: "Phone", content: "123" },
      { label: "Address", content: "Street" },
    ];

    const { container } = render(<Descriptions items={items} column={2} />);
    expect(container.querySelectorAll("tr")).toHaveLength(2);

    const itemsWithSpan: DescriptionsItem[] = [
      { label: "Name", content: "John Doe" },
      { label: "Description", content: "Long", span: 2 },
    ];
    const { container: spanContainer } = render(
      <Descriptions items={itemsWithSpan} column={3} />
    );

    const cells = spanContainer.querySelectorAll("td");
    expect(cells[1].getAttribute("colspan")).toBe("3");
  });

  it("passes through div attributes", () => {
    const items: DescriptionsItem[] = [{ label: "Name", content: "John Doe" }];
    render(
      <Descriptions
        items={items}
        data-testid="root"
        aria-label="descriptions"
        className="custom"
      />
    );

    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("aria-label", "descriptions");
    expect(root.className).toContain("custom");
  });
});
