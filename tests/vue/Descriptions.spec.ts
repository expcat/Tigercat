/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/vue";
import { Descriptions } from "@tigercat/vue";
import type { DescriptionsItem } from "@tigercat/core";

describe("Descriptions (Vue)", () => {
  it("renders title and extra (prop + slot)", () => {
    const items: DescriptionsItem[] = [{ label: "Name", content: "John Doe" }];

    render(Descriptions, {
      props: {
        title: "User",
        extra: "Extra",
        items,
      },
      slots: {
        extra: '<a href="#">Edit</a>',
      },
    });

    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders horizontal table layout by default", () => {
    const items: DescriptionsItem[] = [{ label: "Name", content: "John Doe" }];
    const { container } = render(Descriptions, { props: { items } });

    expect(container.querySelector("table")).toBeTruthy();
    expect(container.querySelector("th")?.textContent).toContain("Name");
    expect(container.querySelector("td")?.textContent).toContain("John Doe");
  });

  it("renders non-bordered vertical layout as dl/dt/dd", () => {
    const items: DescriptionsItem[] = [{ label: "CPU", content: "8C" }];
    const { container } = render(Descriptions, {
      props: { items, layout: "vertical" },
    });

    expect(container.querySelector("dl")).toBeTruthy();
    expect(container.querySelector("dt")?.textContent).toContain("CPU");
    expect(container.querySelector("dd")?.textContent).toContain("8C");
  });

  it("respects column and span in horizontal layout", () => {
    const items: DescriptionsItem[] = [
      { label: "Name", content: "John Doe" },
      { label: "Email", content: "john@example.com" },
      { label: "Phone", content: "123-456-7890" },
      { label: "Address", content: "123 Main St" },
    ];

    const { container } = render(Descriptions, {
      props: { items, column: 2 },
    });
    expect(container.querySelectorAll("tr").length).toBe(2);

    const itemsWithSpan: DescriptionsItem[] = [
      { label: "Name", content: "John Doe" },
      { label: "Description", content: "Long", span: 2 },
    ];

    const { container: spanContainer } = render(Descriptions, {
      props: { items: itemsWithSpan, column: 3 },
    });

    const cells = spanContainer.querySelectorAll("td");
    expect(cells[1].getAttribute("colspan")).toBe("3");
  });

  it("merges attrs.class with className and passes through attrs", () => {
    const items: DescriptionsItem[] = [{ label: "Name", content: "John Doe" }];

    render(Descriptions, {
      props: {
        items,
        className: "from-prop",
      },
      attrs: {
        class: "from-attrs",
        "data-testid": "root",
        "aria-label": "descriptions",
      },
    });

    const root = screen.getByTestId("root");
    expect(root).toHaveAttribute("aria-label", "descriptions");
    expect(root.className).toContain("from-prop");
    expect(root.className).toContain("from-attrs");
  });
});
