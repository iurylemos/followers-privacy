import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StatusMessage from "./index";

describe("StatusMessage", () => {
  it("announces loading and success politely", () => {
    const { rerender } = render(
      <StatusMessage kind="pending" message="Aguardando confirmação da API…" />,
    );

    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Aguardando confirmação da API…",
    );

    rerender(
      <StatusMessage
        kind="success"
        message="Agora você acompanha esta criadora."
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Agora você acompanha esta criadora.",
    );
  });

  it("announces errors assertively", () => {
    render(<StatusMessage kind="error" message="A API está indisponível." />);

    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
  });
});
