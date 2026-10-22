import { Router } from 'express';
import { FollowersService } from '../../../application/services/followers.service';
import { FollowersController } from '../controllers/followers.controller';

export function createFollowersRoutes(
  service: FollowersService,
  creatorId: string,
): Router {
  const router = Router();
  const controller = new FollowersController(service, creatorId);

  router.post('/:creatorId/followers', controller.follow);
  router.delete('/:creatorId/followers/:userId', controller.unfollow);

  return router;
}
