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

  private async send(
    path: string,
    init: RequestInit,
    acceptedStatuses: readonly number[],
  ): Promise<FollowersResult> {
    const response = await this.fetchImplementation(
      `${this.baseUrl}${path}`,
      init,
    );

    if (!acceptedStatuses.includes(response.status)) {
      throw new Error(
        `Não foi possível concluir a operação (HTTP ${response.status}).`,
      );
    }

    const result = (await response.json()) as FollowersResult;

    if (!this.isFollowersResult(result)) {
      throw new Error("A API retornou uma resposta inválida.");
    }

    return result;
  }
}
