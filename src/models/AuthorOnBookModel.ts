import mongoose from "mongoose";

const AuthorOnBookSchema = new mongoose.Schema(
    {
        authorId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        bookId: {
            type: mongoose.Types.ObjectId,
            required: true
        }
    }
);

export const AuthorOnBookModel = mongoose.model('authorOnBook', AuthorOnBookSchema);