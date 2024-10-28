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
        },
        address: {
            type: String,
        }
    },
    {
        timestamps: true
    }
);

export const OrderModel = mongoose.model('order', OrderSchema, 'Orders');