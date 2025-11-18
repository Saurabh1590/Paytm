import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "./config.js";

const authMiddleware = (req, res, next) => {    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Token missing or invalid format" });
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        if(decoded.userId) {
            req.userId = decoded.userId;
            next();
        } else {
            return res.status(403).json({ message: "Invalid token payload" });
        }
    } catch(err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

export default authMiddleware;
