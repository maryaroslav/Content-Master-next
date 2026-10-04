import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from '../lib/logger';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload | string;
        }
    }
}
export { };

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload | string;
        req.user = decoded;
        next();
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        logger.debug({ err: errMsg }, "Invalid token");
        return res.status(403).json({ message: "Forbidden: Invalid token", error: errMsg });
    }
};

export default authMiddleware;
