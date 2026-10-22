import { Router } from "express";
import { FollowersController } from "../controllers/followers.controller";

export class FollowersRoutes {
  constructor(private readonly controller: FollowersController) {}

  public getRouterCreators(): Router {
    const router = Router();

    router.post(
      "/:creatorId/followers",
      this.controller.follow.bind(this.controller),
    );
    router.get(
      "/:creatorId/followers/count",
      this.controller.getFollowerCount.bind(this.controller),
    );
    router.get(
      "/:creatorId/followers/:userId",
      this.controller.getFollowing.bind(this.controller),
    );
    router.delete(
      "/:creatorId/followers/:userId",
      this.controller.unfollow.bind(this.controller),
    );

    return router;
  }
}
