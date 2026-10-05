import { Router } from 'express';
import { authRateLimit } from '../middlewares/rateLimit';
import authRoutes from './auth/routes';
import usersRoutes from './users/routes';
import postsRoutes from './posts/routes';
import searchRoutes from './search/routes';
import communitiesRoutes from './communities/routes';
import chatRoutes from './chat/routes';

const v1 = Router();

v1.use('/auth', authRateLimit, authRoutes);
v1.use('/users', usersRoutes);
v1.use('/posts', postsRoutes);
v1.use('/search', searchRoutes);
v1.use('/communities', communitiesRoutes);
v1.use('/chat', chatRoutes);

export default v1;
