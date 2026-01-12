/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/vue";
import { defineComponent, reactive, h } from "vue";
import { Form, FormItem, type FormRule } from "@tigercat/vue";
import { expectNoA11yViolations } from "../utils";

describe("Form", () => {
  it("renders a semantic form element", () => {
    const { container } = render(Form, {
      props: { model: {} },
      slots: { default: "<div>Content</div>" },
    });

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    expect(form?.tagName.toLowerCase()).toBe("form");
  });

  it("validates with FormItem rules override on blur", async () => {
    const rules: FormRule[] = [
      { required: true, message: "Username is required" },
    ];
    const Demo = defineComponent({
      setup() {
        const model = reactive({ username: "" });
        return () =>
          h(
            Form,
            { model },
            {
              default: () => [
                h(
                  FormItem,
                  { label: "Username", name: "username", rules },
                  {
                    default: () =>
                      h("input", {
                        "aria-label": "username",
                        value: model.username,
                        onInput: (e: Event) => {
                          model.username = (e.target as HTMLInputElement).value;
                        },
                      }),
                  }
                ),
                h("button", { type: "submit" }, "Submit"),
              ],
            }
          );
      },
    });

    render(Demo);
    await fireEvent.focusOut(screen.getByLabelText("username"));

    const error = await screen.findByText("Username is required");
    expect(error).toBeInTheDocument();

    const input = screen.getByLabelText("username");
    expect(input).toHaveAttribute("aria-invalid", "true");

    const errorElement = error.closest("[role=alert]") ?? error;
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(errorElement.getAttribute("id")).toBe(describedBy);
  });

  it("respects rule trigger=submit for field validation", async () => {
    const rules: FormRule[] = [
      { required: true, message: "Username is required", trigger: "submit" },
    ];
    const Demo = defineComponent({
      setup() {
        const model = reactive({ username: "" });
        return () =>
          h(
            Form,
            { model },
            {
              default: () => [
                h(
                  FormItem,
                  { label: "Username", name: "username", rules },
                  {
                    default: () =>
                      h("input", {
                        "aria-label": "username",
                        value: model.username,
                        onInput: (e: Event) => {
                          model.username = (e.target as HTMLInputElement).value;
                        },
                      }),
                  }
                ),
                h("button", { type: "submit" }, "Submit"),
              ],
            }
          );
      },
    });

    render(Demo);
    await fireEvent.focusOut(screen.getByLabelText("username"));
    expect(screen.queryByText("Username is required")).not.toBeInTheDocument();

    const form = screen.getByRole("button", { name: "Submit" }).closest("form");
    expect(form).toBeTruthy();
    await fireEvent.submit(form as HTMLFormElement);
    expect(await screen.findByText("Username is required")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(Form, {
      props: { model: {} },
      slots: { default: "<div>Accessible form</div>" },
    });

    await expectNoA11yViolations(container);
  });
});
