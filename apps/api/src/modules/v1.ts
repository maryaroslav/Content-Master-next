import { Router } from 'express';
import { authRateLimit } from '../middlewares/rateLimit';
import authRoutes from './auth/routes';
import usersRoutes from './users/routes';
import postsRoutes from './posts/routes';
import searchRoutes from './search/routes';

const v1 = Router();

v1.use('/auth', authRateLimit, authRoutes);
v1.use('/users', usersRoutes);
v1.use('/posts', postsRoutes);
v1.use('/search', searchRoutes);

export default v1;
