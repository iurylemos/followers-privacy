import { afterEach, describe, expect, it, vi } from "vitest";
import { FollowersService } from "./followers.service";

describe("FollowersService", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("invokes the default fetch implementation with its global context", async () => {
    const fetchImplementation = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(function (this: typeof globalThis) {
        expect(this).toBe(globalThis);
        return Promise.resolve(
          new Response(JSON.stringify({ following: false }), { status: 200 }),
        );
      });
    const service = new FollowersService("http://localhost:3000");

    await expect(service.getFollowing("creator-1", "user-123")).resolves.toBe(
      false,
    );
    expect(fetchImplementation).toHaveBeenCalledWith(
      "http://localhost:3000/creators/creator-1/followers/user-123",
      { method: "GET" },
    );
  });

  it("reads the count response for the requested creator", async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(JSON.stringify({ creatorId: "creator-1", count: 42 }), {
          status: 200,
        }),
      );
    const service = new FollowersService(
      "http://localhost:3000",
      fetchImplementation,
    );

    await expect(service.getFollowerCount("creator-1")).resolves.toBe(42);
    expect(fetchImplementation).toHaveBeenCalledWith(
      "http://localhost:3000/creators/creator-1/followers/count",
      { method: "GET" },
    );
  });

  it("rejects a count response for a different creator", async () => {
    const service = new FollowersService(
      "http://localhost:3000",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(JSON.stringify({ creatorId: "creator-2", count: 42 }), {
            status: 200,
          }),
        ),
    );

    await expect(service.getFollowerCount("creator-1")).rejects.toThrow(
      "A API retornou uma resposta inválida.",
    );
  });
});
