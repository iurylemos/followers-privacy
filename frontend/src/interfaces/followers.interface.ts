export type FollowersStatusKind = "idle" | "pending" | "success" | "error";

export type FollowersResult = {
  following: boolean;
  followerCount: number;
};

export interface FollowersActions {
  follow(creatorId: string, userId: string): Promise<FollowersResult>;
  unfollow(creatorId: string, userId: string): Promise<FollowersResult>;
  getFollowerCount(creatorId: string): Promise<number>;
  getFollowing(creatorId: string, userId: string): Promise<boolean>;
}

export type FollowingResult = { following: boolean };

export type FollowersCount = { creatorId: string; count: number };
