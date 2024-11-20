import express from "express";
import { addBookToCart, getCart, updateCart, deleteBookInCart, getOrders, getOrderDetails, checkQuantityBook, createOrder } from "../controllers/orderControllers.js";
import authenticate from "../middlewares/authenticateToken.js";
const orderRouter = express.Router();
// Thêm sách vào giỏ hàng
orderRouter.post('/addCart', authenticate, addBookToCart);
// Lấy thông tin giỏ hàng
orderRouter.get('/getCart', authenticate, getCart);
// Cập nhật giỏ hàng
orderRouter.put('/updateCart', authenticate, updateCart);
// Xóa sách trong giỏ hàng
orderRouter.delete('/deleteCart/:orderDetailId', authenticate, deleteBookInCart);
// Kiểm tra số lượng sách trong giỏ có thỏa mãn sau khi ấn 'Thanh toán'
orderRouter.get('/checkQuantityBook', authenticate, checkQuantityBook);
// Tạo đơn hàng
orderRouter.put('/createOrder', authenticate, createOrder);
// Lấy danh sách đơn hàng của người dùng
orderRouter.get('/getOrders', authenticate, getOrders);
// Lấy chi tiết đơn hàng
orderRouter.get('/getOrderDetails/:orderId', authenticate, getOrderDetails);
export { orderRouter };
