import mongoose from "mongoose";

export type UserType = {
    _id: mongoose.Types.ObjectId;
    fullName: String,
    userName: String,
    password: String
};

const UserSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);

export const UserModel = mongoose.model('user', UserSchema);