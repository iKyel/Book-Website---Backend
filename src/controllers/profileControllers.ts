import { Request, Response } from "express";
import { UserModel } from "../models/UserModel.js";

const getProfileUser = async (req: Request, res: Response) => {
    const { userName } = req.body;
    try {
        const user = await UserModel.findOne({ userName: userName }).exec();
        if (user) {
            res.status(200).json({ message: "Success", user: user });
        } else {
            res.status(400).json({ message: "Failure" });
        }
    } catch (err) {
        res.status(500).json({ error: err });
    }
}

export { getProfileUser };