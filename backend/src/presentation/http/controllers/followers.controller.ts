import type { NextFunction, Request, Response } from "express";
import { FollowersService } from "../../../application/services/followers.service";
import {
  creatorIdSchema,
  followRequestBodySchema,
  userIdSchema,
} from "../schemas/followers.schema";
import { HttpError } from "../http-error";

export class FollowersController {
  constructor(
    private readonly service: FollowersService,
    private readonly configuredCreatorId: string,
  ) {}

  public follow(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const creatorId = creatorIdSchema.safeParse(request.params["creatorId"]);
    const body = followRequestBodySchema.safeParse(request.body);

    if (!creatorId.success || !body.success) {
      next(
        new HttpError(
          400,
          "INVALID_REQUEST",
          "The request contains an invalid ID or body.",
        ),
      );
      return;
    }

    if (creatorId.data !== this.configuredCreatorId) {
      next(
        new HttpError(
          404,
          "CREATOR_NOT_FOUND",
          "The requested creator is not configured.",
        ),
      );
      return;
    }

    const result = this.service.follow(body.data.userId);
    response.status(result.changed ? 201 : 200).json({
      following: true,
      followerCount: result.followerCount,
    });
  }

  public unfollow(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const creatorId = creatorIdSchema.safeParse(request.params["creatorId"]);
    const userId = userIdSchema.safeParse(request.params["userId"]);

    if (!creatorId.success || !userId.success) {
      next(
        new HttpError(
          400,
          "INVALID_REQUEST",
          "The request contains an invalid ID.",
        ),
      );
      return;
    }

    if (creatorId.data !== this.configuredCreatorId) {
      next(
        new HttpError(
          404,
          "CREATOR_NOT_FOUND",
          "The requested creator is not configured.",
        ),
      );
      return;
    }

    const result = this.service.unfollow(userId.data);

    response.status(200).json({
      following: false,
      followerCount: result.followerCount,
    });
  }
}
