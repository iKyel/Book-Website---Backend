import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema(
    {
        authorName: {
            type: String,
            required: true
        },
        description: String
    },
    {
        timestamps: true
    }
);

export const AuthorModel = mongoose.model('author', AuthorSchema);