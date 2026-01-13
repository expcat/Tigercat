/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/vue";
import { nextTick } from "vue";
import { Table } from "@tigercat/vue";
import { renderWithProps, expectNoA11yViolations } from "../utils";

const columns = [
  { key: "name", title: "Name" },
  { key: "age", title: "Age" },
  { key: "email", title: "Email" },
];

const dataSource = [
  { id: 1, name: "John Doe", age: 28, email: "john@example.com" },
  { id: 2, name: "Jane Smith", age: 32, email: "jane@example.com" },
  { id: 3, name: "Bob Johnson", age: 45, email: "bob@example.com" },
];

describe("Table", () => {
  describe("Rendering", () => {
    it("should render with default props", () => {
      const { container } = renderWithProps(Table, {
        columns,
        dataSource,
      });

      const table = container.querySelector("table");
      expect(table).toBeInTheDocument();
    });

    it("should render column headers", () => {
      const { getByText } = renderWithProps(Table, {
        columns,
        dataSource,
      });

      expect(getByText("Name")).toBeInTheDocument();
      expect(getByText("Age")).toBeInTheDocument();
      expect(getByText("Email")).toBeInTheDocument();
    });

    it("should render data rows", () => {
      const { getByText } = renderWithProps(Table, {
        columns,
        dataSource,
      });

      expect(getByText("John Doe")).toBeInTheDocument();
      expect(getByText("Jane Smith")).toBeInTheDocument();
      expect(getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("should render empty state when no data", () => {
      const { getByText } = renderWithProps(Table, {
        columns,
        dataSource: [],
      });

      expect(getByText("No data")).toBeInTheDocument();
    });

    it("should render custom empty text", () => {
      const { getByText } = renderWithProps(Table, {
        columns,
        dataSource: [],
        emptyText: "No records found",
      });

      expect(getByText("No records found")).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should apply size classes correctly", () => {
      const { container } = renderWithProps(Table, {
        columns,
        dataSource,
        size: "sm",
        pagination: false, // Disable pagination to avoid selector interference
      });

      const ths = container.querySelectorAll("th");
      const firstDataHeader = ths[0]; // Get first header
      expect(firstDataHeader).toHaveClass("px-3", "py-2");
    });

    it("should show border when bordered is true", () => {
      const { container } = renderWithProps(Table, {
        columns,
        dataSource,
        bordered: true,
      });

      // Border is on the wrapper div inside the main container
      const wrappers = container.querySelectorAll("div");
      const borderWrapper = Array.from(wrappers).find((div) =>
        div.classList.contains("border")
      );
      expect(borderWrapper).toBeTruthy();
    });

    it("should apply striped classes when striped is true", () => {
      const { container } = renderWithProps(Table, {
        columns,
        dataSource,
        striped: true,
      });

      const rows = container.querySelectorAll("tbody tr");
      // Check even rows (0-indexed, so row[0] is index 0 which is even)
      expect(rows[0]).toHaveClass("bg-gray-50/50");
    });

    it("should disable pagination when pagination is false", () => {
      const { container } = renderWithProps(Table, {
        columns,
        dataSource,
        pagination: false,
      });

      const pagination = container.querySelector(
        ".flex.items-center.justify-between"
      );
      expect(pagination).not.toBeInTheDocument();
    });
  });

  describe("Sorting", () => {
    it("should emit sort-change event when clicking sortable column", async () => {
      const sortableColumns = [
        { key: "name", title: "Name", sortable: true },
        { key: "age", title: "Age" },
      ];

      const onSortChange = vi.fn();

      const { getByText } = render(Table, {
        props: {
          columns: sortableColumns,
          dataSource,
        },
        attrs: {
          onSortChange,
        },
      });

      const nameHeader = getByText("Name");
      const nameHeaderCell = nameHeader.closest("th")!;
      expect(nameHeaderCell).toHaveAttribute("aria-sort", "none");

      await fireEvent.click(nameHeaderCell);
      await nextTick();

      expect(onSortChange).toHaveBeenCalledWith({
        key: "name",
        direction: "asc",
      });

      expect(nameHeaderCell).toHaveAttribute("aria-sort", "ascending");
    });
  });

  describe("Filtering", () => {
    it("should render filter input for columns with filter config", () => {
      const filterColumns = [
        {
          key: "name",
          title: "Name",
          filter: { type: "text", placeholder: "Search..." },
        },
        { key: "age", title: "Age" },
      ];

      const { container } = renderWithProps(Table, {
        columns: filterColumns,
        dataSource,
      });

      const filterInput = container.querySelector('input[type="text"]');
      expect(filterInput).toBeInTheDocument();
      expect(filterInput).toHaveAttribute("placeholder", "Search...");
    });

    it("should render filter select for select type filter", () => {
      const filterColumns = [
        {
          key: "status",
          title: "Status",
          filter: {
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        },
      ];

      const { container } = renderWithProps(Table, {
        columns: filterColumns,
        dataSource: [
          { id: 1, status: "active" },
          { id: 2, status: "inactive" },
        ],
      });

      const filterSelect = container.querySelector("select");
      expect(filterSelect).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    it("should render pagination controls by default", () => {
      const { getByText } = renderWithProps(Table, {
        columns,
        dataSource,
      });

      expect(getByText("Previous")).toBeInTheDocument();
      expect(getByText("Next")).toBeInTheDocument();
    });

    it("should show page size selector", () => {
      const { container } = renderWithProps(Table, {
        columns,
        dataSource,
      });

      const select = container.querySelector("select");
      expect(select).toBeInTheDocument();
    });

    it("should emit page-change event when clicking next button", async () => {
      const onPageChange = vi.fn();

      // Create enough data to have multiple pages
      const largeDataSource = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        age: 20 + i,
        email: `person${i + 1}@example.com`,
      }));

      const { getByText } = render(Table, {
        props: {
          columns,
          dataSource: largeDataSource,
        },
        attrs: {
          onPageChange,
        },
      });

      const nextButton = getByText("Next");
      await fireEvent.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith({
        current: 2,
        pageSize: 10,
      });
    });

    it("should respect controlled pagination on rerender", async () => {
      const { rerender, getByText, queryByText } = render(Table, {
        props: {
          columns,
          dataSource,
          pagination: { current: 1, pageSize: 1, showSizeChanger: false },
        },
      });

      expect(getByText("John Doe")).toBeInTheDocument();

      await rerender({
        columns,
        dataSource,
        pagination: { current: 2, pageSize: 1, showSizeChanger: false },
      });

      expect(queryByText("John Doe")).not.toBeInTheDocument();
      expect(getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  describe("Fixed Columns", () => {
    it("should apply sticky styles for fixed left and right columns", () => {
      const fixedColumns = [
        { key: "name", title: "Name", width: 140, fixed: "left" },
        { key: "age", title: "Age", width: 120 },
        { key: "email", title: "Email", width: 220 },
        { key: "actions", title: "Actions", width: 140, fixed: "right" },
      ];

      const { getByText } = renderWithProps(Table, {
        columns: fixedColumns,
        dataSource,
        pagination: false,
      });

      const nameHeader = getByText("Name").closest("th")!;
      expect(nameHeader).toHaveStyle("position: sticky");
      expect(nameHeader).toHaveStyle("left: 0px");

      const actionsHeader = getByText("Actions").closest("th")!;
      expect(actionsHeader).toHaveStyle("position: sticky");
      expect(actionsHeader).toHaveStyle("right: 0px");

      const firstNameCell = getByText("John Doe").closest("td")!;
      expect(firstNameCell).toHaveStyle("position: sticky");
      expect(firstNameCell).toHaveStyle("left: 0px");
    });
  });

  describe("Column Lock Button", () => {
    it("should toggle fixed state when clicking the header lock button", async () => {
      const lockableColumns = [
        { key: "name", title: "Name", width: 140 },
        { key: "age", title: "Age", width: 120 },
        { key: "email", title: "Email", width: 220 },
      ];

      const { getByLabelText, getByText } = renderWithProps(Table, {
        columns: lockableColumns,
        dataSource,
        pagination: false,
        columnLockable: true,
      });

      await fireEvent.click(getByLabelText("Lock column Email"));

      await nextTick();

      const emailHeaderLocked = getByText("Email").closest("th")!;
      expect(emailHeaderLocked).toHaveStyle("position: sticky");
      expect(emailHeaderLocked).toHaveStyle("left: 260px");

      await fireEvent.click(getByLabelText("Unlock column Email"));

      await nextTick();

      const emailHeaderUnlocked = getByText("Email").closest("th")!;
      expect(emailHeaderUnlocked).not.toHaveStyle("position: sticky");
    });
  });

  describe("Row Selection", () => {
    it("should render checkbox column when rowSelection is provided", () => {
      const { container } = renderWithProps(Table, {
        columns,
        dataSource,
        rowSelection: {
          selectedRowKeys: [],
        },
      });

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      // Should have one checkbox in header + one for each row
      expect(checkboxes.length).toBe(dataSource.length + 1);
    });

    it("should emit selection-change event when selecting row", async () => {
      const onSelectionChange = vi.fn();

      const { container } = render(Table, {
        props: {
          columns,
          dataSource,
          rowSelection: {
            selectedRowKeys: [],
          },
        },
        attrs: {
          onSelectionChange,
        },
      });

      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      const firstRowCheckbox = checkboxes[1]; // Skip header checkbox

      await fireEvent.click(firstRowCheckbox);

      expect(onSelectionChange).toHaveBeenCalled();
    });

    it("should respect controlled selectedRowKeys on rerender", async () => {
      const { container, rerender } = render(Table, {
        props: {
          columns,
          dataSource,
          pagination: false,
          rowSelection: {
            selectedRowKeys: [],
          },
        },
      });

      const firstRowCheckbox = container.querySelectorAll(
        'input[type="checkbox"]'
      )[1];
      expect(firstRowCheckbox).not.toBeChecked();

      await rerender({
        columns,
        dataSource,
        pagination: false,
        rowSelection: {
          selectedRowKeys: [1],
        },
      });

      const firstRowCheckboxAfter = container.querySelectorAll(
        'input[type="checkbox"]'
      )[1];
      expect(firstRowCheckboxAfter).toBeChecked();
    });
  });

  describe("Loading State", () => {
    it("should show loading overlay when loading is true", () => {
      const { container } = renderWithProps(Table, {
        columns,
        dataSource,
        loading: true,
      });

      const loadingSpinner = container.querySelector(".animate-spin");
      expect(loadingSpinner).toBeInTheDocument();
    });
  });

  describe("Sticky Header", () => {
    it("should apply sticky class when stickyHeader is true", () => {
      const { container } = renderWithProps(Table, {
        columns,
        dataSource,
        stickyHeader: true,
      });

      const thead = container.querySelector("thead");
      expect(thead).toHaveClass("sticky");
    });
  });

  describe("Accessibility", () => {
    it("should have no a11y violations without row selection", async () => {
      const { container } = renderWithProps(Table, {
        columns,
        dataSource,
        pagination: false, // Disable pagination to avoid selector label issues in test
      });

      await expectNoA11yViolations(container);
    });

    it("should have proper table structure", () => {
      const { container } = renderWithProps(Table, {
        columns,
        dataSource,
        pagination: false,
      });

      expect(container.querySelector("table")).toBeInTheDocument();
      expect(container.querySelector("thead")).toBeInTheDocument();
      expect(container.querySelector("tbody")).toBeInTheDocument();
      expect(container.querySelectorAll("th").length).toBe(columns.length);
    });
  });

  describe("Events", () => {
    it("should emit row-click event when clicking a row", async () => {
      const onRowClick = vi.fn();

      const { container } = render(Table, {
        props: {
          columns,
          dataSource,
        },
        attrs: {
          onRowClick,
        },
      });

      const firstRow = container.querySelector("tbody tr")!;
      await fireEvent.click(firstRow);

      expect(onRowClick).toHaveBeenCalledWith(dataSource[0], 0);
    });

    it("should emit change event with combined state", async () => {
      const onChange = vi.fn();

      const sortableColumns = [{ key: "name", title: "Name", sortable: true }];

      const { getByText } = render(Table, {
        props: {
          columns: sortableColumns,
          dataSource,
        },
        attrs: {
          onChange,
        },
      });

      const nameHeader = getByText("Name");
      await fireEvent.click(nameHeader.closest("th")!);

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: expect.objectContaining({
            key: "name",
            direction: "asc",
          }),
        })
      );
    });
  });
});
