import cors from 'cors';
import express from 'express';
import { FollowersService } from './application/services/followers.service';
import { errorHandlerMiddleware } from './presentation/http/middleware/error-handler.middleware';
import { createFollowersRoutes } from './presentation/http/routes/followers.routes';

export type AppOptions = Readonly<{
  followersService: FollowersService;
  creatorId: string;
  allowedOrigin: string;
}>;

export function createApp(options: AppOptions): express.Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: options.allowedOrigin }));
  app.use(express.json({ limit: '16kb' }));
  app.use('/creators', createFollowersRoutes(options.followersService, options.creatorId));
  app.use(errorHandlerMiddleware);

  return app;
}
