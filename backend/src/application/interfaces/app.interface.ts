import type { FollowersService } from "../services/followers.service";

export type AppOptions = {
  followersService: FollowersService;
  creatorId: string;
  allowedOrigin: string;
};
