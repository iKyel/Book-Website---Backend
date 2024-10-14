import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/jwtSecretKey.js";

// Verify user (Check tokens is valid or not vaild)
async function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).json({ message: 'Unauthenticated' });
    } else {
        jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
            if (err) {
                console.log(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
        })
        next();     // Authentication
    }
}

export default authenticate;