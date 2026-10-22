import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FollowersTemplate from "./index";
import type {
  FollowersActions,
  FollowersResult,
} from "../../../interfaces/followers.interface";

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<Value>((fulfill, fail) => {
    resolve = fulfill;
    reject = fail;
  });

  return { promise, resolve, reject };
}

function createService(
  follow: () => Promise<FollowersResult>,
  unfollow: () => Promise<FollowersResult>,
    getFollowerCount: () => Promise<number> = () => Promise.resolve(0),
    getFollowing: (_creatorId: string, _userId: string) => Promise<boolean> = () =>
      Promise.resolve(false),
): FollowersActions {
    return {
    follow: vi.fn(follow),
    unfollow: vi.fn(unfollow),
    getFollowerCount: vi.fn(getFollowerCount),
    getFollowing: vi.fn(getFollowing),
    };
}

describe("FollowersPage", () => {
  it("loads the persisted count and restores state when the user ID changes", async () => {
    const user = userEvent.setup();
    const getFollowing = vi.fn((_creatorId: string, userId: string) =>
      Promise.resolve(userId === "reader-1"),
    );
    const service = createService(
      () => Promise.resolve({ following: true, followerCount: 2 }),
      () => Promise.resolve({ following: false, followerCount: 1 }),
      () => Promise.resolve(2),
      getFollowing,
    );

    render(
      <FollowersTemplate
        creatorId="creator-1"
        creatorName="Criadora em destaque"
        service={service}
      />,
    );

    expect(
      await screen.findByText("2 pessoas acompanham esta criadora."),
    ).toBeInTheDocument();

    const userIdInput = screen.getByRole("textbox", {
      name: "Seu identificador",
    });
    await user.type(userIdInput, "reader-1");

    expect(
      await screen.findByRole("button", { name: "Deixar de seguir" }),
    ).toBeEnabled();

    await user.clear(userIdInput);
    await user.type(userIdInput, "reader-2");

    expect(await screen.findByRole("button", { name: "Seguir" })).toBeEnabled();
    expect(getFollowing).toHaveBeenCalledWith("creator-1", "reader-1");
    expect(getFollowing).toHaveBeenCalledWith("creator-1", "reader-2");
    expect(
      screen.getByText("2 pessoas acompanham esta criadora."),
    ).toBeInTheDocument();
  });

  it("changes follow state only after the API confirms each operation", async () => {
    const user = userEvent.setup();
    const followRequest = deferred<FollowersResult>();
    const unfollowRequest = deferred<FollowersResult>();
    const service = createService(
      () => followRequest.promise,
      () => unfollowRequest.promise,
    );

    render(
      <FollowersTemplate
        creatorId="creator-1"
        creatorName="Criadora em destaque"
        service={service}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Seu identificador" }),
      "reader-1",
    );
    await user.click(screen.getByRole("button", { name: "Seguir" }));

    expect(
      await screen.findByRole("button", { name: "Salvando…" }),
    ).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Aguardando confirmação",
    );
    expect(
      screen.queryByText("1 pessoa acompanha esta criadora."),
    ).not.toBeInTheDocument();

    followRequest.resolve({ following: true, followerCount: 1 });

    expect(
      await screen.findByRole("button", { name: "Deixar de seguir" }),
    ).toBeEnabled();
    expect(
      screen.getByText("1 pessoa acompanha esta criadora."),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Agora você acompanha esta criadora.",
    );

    await user.click(screen.getByRole("button", { name: "Deixar de seguir" }));

    expect(
      await screen.findByRole("button", { name: "Salvando…" }),
    ).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Aguardando confirmação",
    );
    expect(
      screen.queryByText("Você deixou de seguir a criadora."),
    ).not.toBeInTheDocument();

    unfollowRequest.resolve({ following: false, followerCount: 0 });

    expect(await screen.findByRole("button", { name: "Seguir" })).toBeEnabled();
    expect(
      screen.getByText("Nenhuma pessoa acompanha esta criadora."),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Você deixou de seguir a criadora.",
    );
  });

  it("keeps the unconfirmed state and shows an API error", async () => {
    const user = userEvent.setup();
    const service = createService(
      () => Promise.reject(new Error("A API está indisponível.")),
      () => Promise.resolve({ following: false, followerCount: 0 }),
    );

    render(
      <FollowersTemplate
        creatorId="creator-1"
        creatorName="Criadora em destaque"
        service={service}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Seu identificador" }),
      "reader-1",
    );
    await user.click(screen.getByRole("button", { name: "Seguir" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "A API está indisponível.",
    );
    expect(screen.getByRole("button", { name: "Seguir" })).toBeEnabled();
    expect(
      screen.queryByText("Agora você acompanha esta criadora."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Você deixou de seguir a criadora."),
    ).not.toBeInTheDocument();
  });
});
