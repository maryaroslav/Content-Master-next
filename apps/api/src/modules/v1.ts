import { Router } from 'express';
import { authRateLimit } from '../middlewares/rateLimit';
import authRoutes from './auth/routes';
import usersRoutes from './users/routes';

const v1 = Router();

v1.use('/auth', authRateLimit, authRoutes);
v1.use('/users', usersRoutes);

export default v1;
