import mongoose from "mongoose";

const OrderDetailSchema = new mongoose.Schema(
    {
        orderId: {
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

export const OrderDetailModel  = mongoose.model('orderdetail', OrderDetailSchema);