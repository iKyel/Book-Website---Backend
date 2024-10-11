import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/jwtSecretKey.js";

// Verify user (Check tokens is valid or not vaild)
async function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;
    if (!token) {
        res.status(400).json({ message: 'Unauthentication' });
    } else {
        jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
            if (err) {
                res.status(500).json({ error: err });
                return;
            }
        })
        next();     // Authentication
    }
}

export default authenticate;