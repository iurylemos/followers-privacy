import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FollowButton } from "./index";

describe("FollowButton", () => {
  it("is keyboard operable and reflects following state", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <FollowButton
        following={true}
        isPending={false}
        onClick={onClick}
        userIdIsValid={true}
      />,
    );

    const button = screen.getByRole("button", { name: "Deixar de seguir" });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("announces loading and prevents a duplicate submission", () => {
    render(
      <FollowButton
        following={false}
        isPending={true}
        onClick={vi.fn()}
        userIdIsValid={true}
      />,
    );

    expect(screen.getByRole("button", { name: "Salvando…" })).toBeDisabled();
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });

  it("is disabled for an invalid identifier", () => {
    render(
      <FollowButton
        following={false}
        isPending={false}
        onClick={vi.fn()}
        userIdIsValid={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Seguir" })).toBeDisabled();
  });
});
