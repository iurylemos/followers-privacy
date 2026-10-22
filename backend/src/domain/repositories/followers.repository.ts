export type FollowMutation = Readonly<{
  created: boolean;
  followerCount: number;
}>;

export type UnfollowMutation = Readonly<{
  removed: boolean;
  followerCount: number;
}>;

export interface FollowersRepository {
  follow(creatorId: string, userId: string): FollowMutation;
  unfollow(creatorId: string, userId: string): UnfollowMutation;
}
