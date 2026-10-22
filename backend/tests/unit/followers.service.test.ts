import { describe, expect, it } from "vitest";
import type {
  FollowersRepository,
  FollowMutation,
  UnfollowMutation,
} from "../../src/domain/repositories/followers.repository";
import { FollowersService } from "../../src/application/services/followers.service";

class InMemoryFollowersRepository implements FollowersRepository {
  private readonly followers = new Map<string, Set<string>>();

  follow(creatorId: string, userId: string): FollowMutation {
    const creatorFollowers = this.followers.get(creatorId) ?? new Set<string>();
    const created = !creatorFollowers.has(userId);
    creatorFollowers.add(userId);
    this.followers.set(creatorId, creatorFollowers);

    return {
      created,
      followerCount: creatorFollowers.size,
    };
  }

  unfollow(creatorId: string, userId: string): UnfollowMutation {
    const creatorFollowers = this.followers.get(creatorId);
    const removed = creatorFollowers?.delete(userId) ?? false;

    return {
      removed,
      followerCount: creatorFollowers?.size ?? 0,
    };
  }
}

function createService(): FollowersService {
  return new FollowersService(new InMemoryFollowersRepository(), "creator-1");
}

describe("FollowersService", () => {
  it("creates a relation and returns the confirmed state and count", () => {
    expect(createService().follow("reader-1")).toEqual({
      following: true,
      followerCount: 1,
      changed: true,
    });
  });

  it("does not duplicate a repeated follow request", () => {
    const service = createService();
    service.follow("reader-1");

    expect(service.follow("reader-1")).toEqual({
      following: true,
      followerCount: 1,
      changed: false,
    });
  });

  it("removes an existing relation and returns the final count", () => {
    const service = createService();
    service.follow("reader-1");

    expect(service.unfollow("reader-1")).toEqual({
      following: false,
      followerCount: 0,
      changed: true,
    });
  });

  it("keeps an absent relation unchanged when unfollow is repeated", () => {
    expect(createService().unfollow("reader-1")).toEqual({
      following: false,
      followerCount: 0,
      changed: false,
    });
  });
});
