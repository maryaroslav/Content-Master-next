import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

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
        console.log("Authorization header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET is not defined in environment");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, secret) as JwtPayload | string;
        req.user = decoded;
        next();
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Token error:", errMsg);
        return res.status(403).json({ message: "Forbidden: Invalid token", error: errMsg });
    }
};

export default authMiddleware;
