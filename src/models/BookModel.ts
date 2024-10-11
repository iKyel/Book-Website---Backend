import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        publisherId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        discount: {
            type: String,
            default: 0
        },
        salePrice: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        publishedYear: {
            type: Number,
            required: true
        },
        size: {
            type: Array<Number>,
            required: true
        },
        coverForm: {
            type: String,
            enum: ['Soft', 'Hard'],
            required: true
        },
        content: String,
        imageURL: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
    }
);

export const BookModel = mongoose.model('book', BookSchema);