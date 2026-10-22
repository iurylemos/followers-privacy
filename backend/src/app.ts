import cors from "cors";
import express, { type Express } from "express";
import type { AppOptions } from "./application/interfaces/app.interface";
import { ErrorHandlerMiddleware } from "./presentation/http/middleware/error-handler.middleware";
import { FollowersRoutes } from "./presentation/http/routes/followers.routes";
import { FollowersController } from "./presentation/http/controllers/followers.controller";

export function createApp(options: AppOptions): Express {
  const app = express();

  const { followersService, creatorId } = options;

  const followersController = new FollowersController(
    followersService,
    creatorId,
  );

  const followersRoutes = new FollowersRoutes(followersController);

  app.disable("x-powered-by");
  app.use(cors({ origin: options.allowedOrigin }));
  app.use(express.json({ limit: "16kb" }));
  app.use("/creators", followersRoutes.getRouterCreators());
  app.use(ErrorHandlerMiddleware.errorHandlerMiddleware);

  return app;
}
