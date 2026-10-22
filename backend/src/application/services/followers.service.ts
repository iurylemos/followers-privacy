import type { FollowersRepository } from "../../domain/repositories/followers.repository";
import type { FollowResult } from "../interfaces/followers.interface";

export class FollowersService {
  constructor(
    private readonly repository: FollowersRepository,
    private readonly creatorId: string,
  ) {}

  public follow(userId: string): FollowResult {
    const result = this.repository.follow(this.creatorId, userId);

    return {
      following: true,
      followerCount: result.followerCount,
      changed: result.created,
    };
  }

  public unfollow(userId: string): FollowResult {
    const result = this.repository.unfollow(this.creatorId, userId);

    return {
      following: false,
      followerCount: result.followerCount,
      changed: result.removed,
    };
  }

  public getFollowerCount(): number {
    return this.repository.getFollowerCount(this.creatorId);
  }

  public getFollowing(userId: string): boolean {
    return this.repository.getFollowing(this.creatorId, userId);
  }
}
