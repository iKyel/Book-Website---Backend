import mongoose from "mongoose";

const CartDetailSchema = new mongoose.Schema(
    {
        cartId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        bookId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
    }
);

export const CartDetailModel  = mongoose.model('cartdetail', CartDetailSchema);