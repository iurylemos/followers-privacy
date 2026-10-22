export type FollowMutation = {
  created: boolean;
  followerCount: number;
};

export type UnfollowMutation = {
  removed: boolean;
  followerCount: number;
};

export interface FollowersRepository {
  follow(creatorId: string, userId: string): FollowMutation;
  unfollow(creatorId: string, userId: string): UnfollowMutation;
  getFollowerCount(creatorId: string): number;
  getFollowing(creatorId: string, userId: string): boolean;
}
