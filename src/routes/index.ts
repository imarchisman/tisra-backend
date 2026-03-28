import { Router } from 'express';
import { authRouter } from './auth';
import { userRouter } from './user';
import { musicRouter } from './music';
import { roomRouter } from './room';

const rootRouter: Router = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/users', userRouter);
rootRouter.use('/music', musicRouter);
rootRouter.use('/rooms', roomRouter);

export { rootRouter };
