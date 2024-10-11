import mongoose from "mongoose";

const CategoryOnBookSchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        bookId: {
            type: mongoose.Types.ObjectId,
            required: true
        }
    }
);

export const CategoryOnBookModel = mongoose.model('categoryOnBook', CategoryOnBookSchema);