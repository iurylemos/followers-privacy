import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UserIdInput from "./index";

describe("UserIdInput", () => {
  it("provides a labeled, keyboard-focusable input", async () => {
    const user = userEvent.setup();

    render(<UserIdInput value="" onChange={vi.fn()} />);

    const input = screen.getByRole("textbox", { name: "Seu identificador" });
    expect(input).toHaveAttribute("aria-describedby", "user-id-hint");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("maxLength", "64");

    await user.tab();
    expect(input).toHaveFocus();
  });

  it("identifies invalid values to assistive technology", () => {
    render(<UserIdInput value="reader id" onChange={vi.fn()} />);

    const input = screen.getByRole("textbox", { name: "Seu identificador" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "Use de 1 a 64 letras, números, hífen ou sublinhado.",
    );
  });

  it("uses a pattern valid under the modern regular expression syntax", () => {
    render(<UserIdInput value="" onChange={vi.fn()} />);

    const input = screen.getByRole("textbox", { name: "Seu identificador" });
    const pattern = new RegExp(`^(?:${input.getAttribute("pattern")})$`, "v");

    expect(pattern.test("reader-42")).toBe(true);
    expect(pattern.test("reader id")).toBe(false);
  });
});
