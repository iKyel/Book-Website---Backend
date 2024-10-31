import mongoose from "mongoose";
import { OrderModel } from "../models/OrderModel.js";

// Lấy giỏ hàng của user
async function getUserCart(userId: mongoose.Types.ObjectId | undefined) {
    // Kiểm tra user đã có cart chưa, nếu chưa thì tạo cart trong Order
    let cart = await OrderModel.findOne({ userId: userId, orderStatus: 'Cart' }).exec();
    if (!cart) {
        cart = await OrderModel.create({ userId });
    }
    return cart;
}

export { getUserCart }