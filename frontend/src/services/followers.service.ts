export type FollowResult = Readonly<{
  following: boolean;
  followerCount: number;
}>;

export interface FollowersActions {
  follow(creatorId: string, userId: string): Promise<FollowResult>;
  unfollow(creatorId: string, userId: string): Promise<FollowResult>;
}

function isFollowResult(value: unknown): value is FollowResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('following' in value) || !('followerCount' in value)) {
    return false;
  }

  return (
    typeof value.following === 'boolean' &&
    typeof value.followerCount === 'number' &&
    Number.isSafeInteger(value.followerCount) &&
    value.followerCount >= 0
  );
}

export class FollowersService implements FollowersActions {
  private readonly baseUrl: string;

  constructor(
    baseUrl: string,
    private readonly fetchImplementation: typeof fetch = fetch,
  ) {
    this.baseUrl = new URL(baseUrl).toString().replace(/\/+$/, '');
  }

  follow(creatorId: string, userId: string): Promise<FollowResult> {
    return this.send(
      `/creators/${encodeURIComponent(creatorId)}/followers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      },
      [200, 201],
    );
  }

  unfollow(creatorId: string, userId: string): Promise<FollowResult> {
    return this.send(
      `/creators/${encodeURIComponent(creatorId)}/followers/${encodeURIComponent(userId)}`,
      { method: 'DELETE' },
      [200],
    );
  }

  private async send(
    path: string,
    init: RequestInit,
    acceptedStatuses: readonly number[],
  ): Promise<FollowResult> {
    const response = await this.fetchImplementation(`${this.baseUrl}${path}`, init);

    if (!acceptedStatuses.includes(response.status)) {
      throw new Error(`Não foi possível concluir a operação (HTTP ${response.status}).`);
    }

    const result: unknown = await response.json();

    if (!isFollowResult(result)) {
      throw new Error('A API retornou uma resposta inválida.');
    }

    return result;
  }
}
