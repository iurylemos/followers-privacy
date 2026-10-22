import type {
  FollowersActions,
  FollowersResult,
  FollowingResult,
  FollowersCount,
} from "../interfaces/followers.interface";

export class FollowersService implements FollowersActions {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string,
    private readonly fetchImplementation: typeof fetch = globalThis.fetch.bind(
      globalThis,
    ),
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
    const result = await this.request<FollowersCount>(
      `/creators/${encodeURIComponent(creatorId)}/followers/count`,
      { method: "GET" },
      [200],
    );

    if (!this.isFollowerCount(result) || result.creatorId !== creatorId) {
      throw new Error("A API retornou uma resposta inválida.");
    }

    return result.count;
  }

  public async getFollowing(
    creatorId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.request<FollowingResult>(
      `/creators/${encodeURIComponent(creatorId)}/followers/${encodeURIComponent(userId)}`,
      { method: "GET" },
      [200],
    );

    if (!this.isFollowState(result)) {
      throw new Error("A API retornou uma resposta inválida.");
    }

    return result.following;
  }

  private isFollowersResult(value: unknown): boolean {
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

  private isFollowerCount(value: unknown): boolean {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    if (!("creatorId" in value) || !("count" in value)) {
      return false;
    }

    return (
      typeof value.creatorId === "string" &&
      typeof value.count === "number" &&
      Number.isSafeInteger(value.count) &&
      value.count >= 0
    );
  }

  private isFollowState(value: unknown): boolean {
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
    const result = await this.request<FollowersResult>(
      path,
      init,
      acceptedStatuses,
    );

    if (!this.isFollowersResult(result)) {
      throw new Error("A API retornou uma resposta inválida.");
    }

    return result;
  }

  private async request<T>(
    path: string,
    init: RequestInit,
    acceptedStatuses: readonly number[],
  ): Promise<T> {
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
