import express from "express";
import { addBookToCart, getCart, updateCart, deleteBookInCart } from "../controllers/orderControllers.js";
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
export { orderRouter };
