import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FollowerCount } from "./index";

describe("FollowerCount", () => {
  it.each([
    [0, "Nenhuma pessoa acompanha esta criadora."],
    [1, "1 pessoa acompanha esta criadora."],
    [2, "2 pessoas acompanham esta criadora."],
  ])("presents the persisted count %i accessibly", (count, message) => {
    render(<FollowerCount count={count} />);

    expect(screen.getByText(message)).toHaveAttribute("aria-live", "polite");
  });
});
