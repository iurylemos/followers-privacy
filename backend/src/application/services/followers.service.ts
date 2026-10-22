import type { FollowersRepository } from '../../domain/repositories/followers.repository';

export type FollowServiceResult = Readonly<{
  following: true;
  followerCount: number;
  changed: boolean;
}>;

export type UnfollowServiceResult = Readonly<{
  following: false;
  followerCount: number;
  changed: boolean;
}>;

export class FollowersService {
  constructor(
    private readonly repository: FollowersRepository,
    private readonly creatorId: string,
  ) {}

  follow(userId: string): FollowServiceResult {
    const result = this.repository.follow(this.creatorId, userId);

    return {
      following: true,
      followerCount: result.followerCount,
      changed: result.created,
    };
  }

  unfollow(userId: string): UnfollowServiceResult {
    const result = this.repository.unfollow(this.creatorId, userId);

    return {
      following: false,
      followerCount: result.followerCount,
      changed: result.removed,
    };
  }
}
