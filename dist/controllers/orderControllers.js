import { OrderModel } from "../models/OrderModel.js";
import { OrderDetailModel } from "../models/OrderDetailModel.js";
import { getUserCart } from "../utils/checkUserHasCart.js";
import { BookModel } from "../models/BookModel.js";
/**
 * @desc    Thêm sách vào giỏ hàng
 * @route   POST '/order/addCart';
 */
const addBookToCart = async (req, res) => {
    const { bookId, soLgSachThem, price, soLgTonKho } = req.body;
    const userId = req.user?._id;
    try {
        // Lấy giỏ hàng của user
        const cart = await getUserCart(userId);
        // Kiểm tra xem bookId đã tồn tại trong giỏ hàng chưa?
        const existCartDetail = await OrderDetailModel.findOne({ orderId: cart._id, bookId }).exec();
        if (existCartDetail) { // Nếu đã có, cập nhật số lượng sách và thành tiền
            existCartDetail.quantity += Number(soLgSachThem);
            existCartDetail.price += Number(price);
            if (existCartDetail.quantity > soLgTonKho) { // Ktra số lượng sách thêm
                res.status(400).json({ message: `Sách này còn ${soLgTonKho}. Hãy giảm bớt!` });
                return;
            }
            await existCartDetail.save();
        }
        else { // Nếu chưa có, thêm sách mới vào giỏ hàng
            await OrderDetailModel.create({ orderId: cart._id, bookId, quantity: soLgSachThem, price });
        }
        // Tính tổng giá từ tất cả các orderDetails trong giỏ hàng
        const totalPrice = (await OrderDetailModel.find({ orderId: cart._id }).exec())
            .reduce((acc, item) => acc + item.price, 0);
        // Cập nhật tổng tiền trong Order
        await OrderModel.findOneAndUpdate({ _id: cart._id }, { totalPrice: totalPrice }).exec();
        res.status(200).json({ message: "Thêm sách vào giỏ hàng thành công!" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hệ thống!" });
    }
};
/**
 * @desc    Lấy giỏ hàng
 * @route   GET '/order/getCart'
 */
const getCart = async (req, res) => {
    const userId = req.user?._id;
    try {
        // Lấy giỏ hàng của user
        const cart = await getUserCart(userId);
        // Lấy chi tiết giỏ hàng
        const cartDetails = await OrderDetailModel.find({ orderId: cart._id })
            .populate({
            path: 'bookId',
            select: 'title salePrice imageURL', // Chỉ lấy title, salePrice và imageURL
            model: 'book' // Tên model của bảng Books
        })
            .exec();
        res.status(200).json({ message: "Lấy giỏ hàng thành công!", order: cart, orderDetails: cartDetails });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hệ thống!" });
    }
};
/**
 * @des     Cập nhật giỏ hàng
 * @route   PUT '/order/updateCart'
 */
const updateCart = async (req, res) => {
    const userId = req.user?._id;
    const updatedOrderDetails = req.body.updatedOrderDetails;
    try {
        // Lấy giỏ hàng của user
        const cart = await getUserCart(userId);
        // Duyệt từng updatedOrderDetail
        const bulkUpdates = [];
        for (const orderDetail of updatedOrderDetails) {
            // Kiểm tra số lượng sách thêm > số lượng sách tồn ko (theo bookId)?
            const newQuantity = orderDetail.quantity;
            const book = await BookModel.findById(orderDetail.bookId).exec();
            if (!book || newQuantity > book.quantity) {
                res.status(400).json({ message: "Số lượng sách thêm không đủ. Hãy giảm bớt!" });
                return;
            }
            // Thêm lệnh update vào bulk
            bulkUpdates.push({
                updateOne: {
                    filter: { _id: orderDetail._id },
                    update: {
                        quantity: newQuantity, // Cập nhật lại số lượng và thành tiền
                        price: orderDetail.price
                    }
                }
            });
        }
        // Thực hiện cập nhật hàng loạt các updateOrderDetail vào db
        if (bulkUpdates.length > 0) {
            await OrderDetailModel.bulkWrite(bulkUpdates);
        }
        // Lấy chi tiết giỏ hàng
        const cartDetails = await OrderDetailModel.find({ orderId: cart._id })
            .populate({
            path: 'bookId',
            select: 'title salePrice imageURL',
            model: 'book' // Tên model của bảng Books
        })
            .exec();
        // Tính lại tổng tiền trong Order
        const totalPrice = cartDetails.reduce((acc, item) => acc + item.price, 0);
        // Cập nhật tổng tiền trong Order vào db
        const updatedCart = await OrderModel.findOneAndUpdate({ _id: cart._id }, { totalPrice: totalPrice }, { new: true } // Trả về giá trị đã cập nhật
        ).exec();
        res.status(200).json({ message: "Cập nhật sách trong giỏ hàng thành công!", order: updatedCart, orderDetails: cartDetails });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hệ thống!" });
    }
};
/**
 * @des     Xóa sách trong giỏ hàng
 * @route   DELETE '/order/deleteCart/:orderDetailId'
 */
const deleteBookInCart = async (req, res) => {
    const userId = req.user?._id;
    const { orderDetailId } = req.params;
    try {
        // Lấy giỏ hàng của user
        const cart = await getUserCart(userId);
        // Xóa orderDetail của cart trong csdl
        const result = await OrderDetailModel.findByIdAndDelete(orderDetailId).exec();
        if (!result)
            throw new Error("Lỗi: Không thể xóa orderDetail được!");
        // Lấy chi tiết giỏ hàng
        const cartDetails = await OrderDetailModel.find({ orderId: cart._id })
            .populate({
            path: 'bookId',
            select: 'title salePrice imageURL',
            model: 'book' // Tên model của bảng Books
        })
            .exec();
        // Tính lại tổng tiền trong Order
        const totalPrice = cartDetails.reduce((acc, item) => acc + item.price, 0);
        // Cập nhật tổng tiền trong Order vào db
        const updatedCart = await OrderModel.findOneAndUpdate({ _id: cart._id }, { totalPrice: totalPrice }, { new: true } // Trả về giá trị đã cập nhật
        ).exec();
        res.status(200).json({ message: "Xóa sách trong giỏ hàng thành công!", order: updatedCart, orderDetails: cartDetails });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hệ thống!" });
    }
};
export { addBookToCart, getCart, updateCart, deleteBookInCart };
