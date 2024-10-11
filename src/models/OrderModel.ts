import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        orderStatus: {
            type: String,
            enum: ['Order', 'Invoice'],
            default: 'Order'
        },
        paymentType: {
            type: String,
            enum: ['PayPal, COD'],
            default: 'COD'
        },
        totalPrice: {
            type: Number,
            default: 0
        },
        phoneNumber: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const OrderModel = mongoose.model('order', OrderSchema);