import { Request, Response } from "express";
import { UserModel } from "../models/UserModel.js";
import bcrypt from "bcrypt";

// Get profile
const getProfileUser = async (req: Request, res: Response) => {
    const { userName } = req.body;
    try {
        const user = await UserModel.findOne({ userName: userName }).exec();
        if (user) {
            res.status(200).json({ message: 'Lấy thông tin người dùng thành công!', user: user });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

// update password
const changePassword = async (req: Request, res: Response) => {
    const { userName, newPassword } = req.body;
    try {
        const user = await UserModel.findOne({ userName: userName }).exec();
        if (user) {
            // Hash the new password before updating
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updatedUser = await UserModel.findOneAndUpdate({ userName }, { password: hashedPassword });
            res.status(200).json({ message: 'Cập nhật mật khẩu thành công!', user: updatedUser });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
}

export { getProfileUser, changePassword };