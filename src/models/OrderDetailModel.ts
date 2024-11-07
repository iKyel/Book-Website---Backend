import mongoose from "mongoose";

export type OrderDetailType = {
    _id: mongoose.Types.ObjectId,
    orderId: mongoose.Types.ObjectId,
    bookId: mongoose.Types.ObjectId,
    quantity: number,
    price: number   // Thành tiền
}

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

export const OrderDetailModel  = mongoose.model('orderdetail', OrderDetailSchema, 'OrderDetails');