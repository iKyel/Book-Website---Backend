import { Request, Response } from "express";
import { UserModel } from "../models/UserModel.js";
import bcrypt, { hash } from "bcrypt";

// Get profile
const getProfileUser = async (req: Request, res: Response) => {
    const { userName } = req.body;
    try {
        const user = await UserModel.findOne({ userName: userName }).exec();
        if (user) {
            res.status(200).json({ message: 'Profile retrieved successfully', user: user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal server error' });
    }
}

// update password
const changePassword = async (req: Request, res: Response) => {
    const { userName, newPassword } = req.body;
    try {
        const user = await UserModel.findOne({ userName: userName }).exec();
        if (user) {
            // Hash the new password before updating
            bcrypt.hash(newPassword, 10, async (err, hashedPassword) => {
                if (err) throw err;
                const updatedUser = await UserModel.findOneAndUpdate({ userName }, { password: hashedPassword });
                if (updatedUser) {
                    res.status(200).json({ message: 'Password updated successfully', user: updatedUser });
                } else {
                    res.status(500).json({ message: 'Failed to update password' });
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export { getProfileUser, changePassword };