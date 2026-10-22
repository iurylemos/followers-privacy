import type {
  FollowersActions,
  FollowersResult,
} from "../interfaces/followers.interface";

export class FollowersService implements FollowersActions {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string,
    private readonly fetchImplementation: typeof fetch = fetch,
  ) {
    this.baseUrl = new URL(baseUrl).toString().replace(/\/+$/, "");
  }

  public follow(creatorId: string, userId: string): Promise<FollowersResult> {
    return this.send(
      `/creators/${encodeURIComponent(creatorId)}/followers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      },
      [200, 201],
    );
  }

  public unfollow(creatorId: string, userId: string): Promise<FollowersResult> {
    return this.send(
      `/creators/${encodeURIComponent(creatorId)}/followers/${encodeURIComponent(userId)}`,
      { method: "DELETE" },
      [200],
    );
  }

  public async getFollowerCount(creatorId: string): Promise<number> {
    const result = await this.request(
      `/creators/${encodeURIComponent(creatorId)}/followers/count`,
      { method: "GET" },
      [200],
    );

    if (!this.isFollowerCount(result)) {
      throw new Error("A API retornou uma resposta inválida.");
    }

    return result.followerCount;
  }

  public async getFollowing(
    creatorId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.request(
      `/creators/${encodeURIComponent(creatorId)}/followers/${encodeURIComponent(userId)}`,
      { method: "GET" },
      [200],
    );

    if (!this.isFollowState(result)) {
      throw new Error("A API retornou uma resposta inválida.");
    }

    return result.following;
  }

  private isFollowersResult(value: unknown): value is FollowersResult {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    if (!("following" in value) || !("followerCount" in value)) {
      return false;
    }

    return (
      typeof value.following === "boolean" &&
      typeof value.followerCount === "number" &&
      Number.isSafeInteger(value.followerCount) &&
      value.followerCount >= 0
    );
  }

  private isFollowerCount(
    value: unknown,
  ): value is Readonly<{ followerCount: number }> {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    if (!("followerCount" in value)) {
      return false;
    }

    return (
      typeof value.followerCount === "number" &&
      Number.isSafeInteger(value.followerCount) &&
      value.followerCount >= 0
    );
  }

  private isFollowState(
    value: unknown,
  ): value is Readonly<{ following: boolean }> {
    return (
      typeof value === "object" &&
      value !== null &&
      "following" in value &&
      typeof value.following === "boolean"
    );
  }

  private async send(
    path: string,
    init: RequestInit,
    acceptedStatuses: readonly number[],
  ): Promise<FollowersResult> {
    const result = await this.request(path, init, acceptedStatuses);

    if (!this.isFollowersResult(result)) {
      throw new Error("A API retornou uma resposta inválida.");
    }

    return result;
  }

  private async request(
    path: string,
    init: RequestInit,
    acceptedStatuses: readonly number[],
  ): Promise<unknown> {
    const response = await this.fetchImplementation(
      `${this.baseUrl}${path}`,
      init,
    );

    if (!acceptedStatuses.includes(response.status)) {
      throw new Error(
        `Não foi possível concluir a operação (HTTP ${response.status}).`,
      );
    }

    return response.json();
  }
}
