import { Request, Response, RequestHandler } from "express";
import { UserModel } from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/jwtSecretKey.js";

// Controller for login
const loginUser = async (req: Request, res: Response) => {
    const { userName, password } = req.body;
    try {
        // Check userName has existed?
        const user = await UserModel.findOne({ userName }).exec();
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ error: 'Internal server error' });   // Sth error happend
                } else {
                    if (result) {   // If password is valid then create token for user save in cookie
                        const token = jwt.sign({ userId: user._id, userName: user.userName }, SECRET_KEY, { expiresIn: '1d' });
                        res.cookie('token', token);
                        res.status(200).json({ message: 'Login successful' });
                    } else {    // else password is invalid
                        res.status(401).json({ message: 'Invalid username or password' });
                    }
                }
            })
        } else {
            res.status(401).json({ message: 'Invalid username or password' })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' })
    }
}

// Controller for register
const registerUser = async (req: Request, res: Response) => {
    const { fullName, userName, password } = req.body;
    try {
        // Ktra userName đã được đăng ký chưa
        const isHasUser = await UserModel.findOne({ userName }).exec();
        if (isHasUser) {
            res.status(400).json({ message: 'This username already exists. Please choose a different username!' });
            return;
        }
        bcrypt.hash(password, 10, async (err, hash) => {      // Hash password to store in DB
            if (err) {
                console.log(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            await UserModel.create({ fullName, userName, password: hash })
            res.status(201).json({ message: 'Register successful' });
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Controller for logout
const logoutUser = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Đăng xuất thành công' });
};

export { loginUser, registerUser, logoutUser };