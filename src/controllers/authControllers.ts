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
            const isCompare = await bcrypt.compare(password, user.password);
            if (isCompare) {   // If password is valid then create token for user save in cookie
                const token = jwt.sign({ userId: user._id, userName: user.userName }, SECRET_KEY, { expiresIn: '1d' });
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
                });
                res.status(200).json({ message: 'Đăng nhập thành công!', userData: { fullName: user.fullName, userName: user.userName } });
                return;
            }
        }
        // userName or password not correct
        res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
};


// Controller for register
const registerUser = async (req: Request, res: Response) => {
    const { fullName, userName, password } = req.body;
    try {
        // Ktra userName đã được đăng ký chưa
        const isHasUser = await UserModel.findOne({ userName }).exec();
        if (isHasUser) {
            res.status(400).json({ message: 'Tên đăng nhập đã tồn tại. Hãy dùng tên khác!' });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);      // Hash password to store in DB
        await UserModel.create({ fullName, userName, password: hashedPassword });
        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

// Controller for logout
const logoutUser = (req: Request, res: Response) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Đăng xuất thành công!' });
};

export { loginUser, registerUser, logoutUser };