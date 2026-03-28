import { Router } from 'express';
import { RoomController } from '../../controllers/room';
import { createRoomValidator, joinRoomValidator } from '../../validators/room';
import { authMiddleware } from '../../middlewares/auth';

const roomRouter: Router = Router();

roomRouter.use(authMiddleware);

roomRouter.post('/', createRoomValidator, RoomController.create);
roomRouter.post('/join', joinRoomValidator, RoomController.join);
roomRouter.get('/:code', RoomController.getDetails);
roomRouter.delete('/:id/leave', RoomController.leave);
roomRouter.delete('/:id', RoomController.close);
roomRouter.delete('/:roomId/kick/:userId', RoomController.kick);

export { roomRouter };
