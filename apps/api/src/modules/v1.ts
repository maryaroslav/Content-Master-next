import { Router } from 'express';
import { authRateLimit } from '../middlewares/rateLimit';
import { mountAuthRoutes } from './auth/routes';
import { mountUserRoutes } from './users/routes';
import { mountPostRoutes } from './posts/routes';
import { mountSearchRoutes } from './search/routes';
import { mountCommunityRoutes } from './communities/routes';
import { mountChatRoutes } from './chat/routes';

const v1 = Router();

v1.use('/auth', authRateLimit);

mountAuthRoutes(v1);
mountUserRoutes(v1);
mountPostRoutes(v1);
mountSearchRoutes(v1);
mountCommunityRoutes(v1);
mountChatRoutes(v1);

export default v1;
