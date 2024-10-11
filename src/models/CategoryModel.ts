import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const CategoryModel = mongoose.model('category', CategorySchema);