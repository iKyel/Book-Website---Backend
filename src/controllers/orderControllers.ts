import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/authenticateToken.js";
import { OrderModel } from "../models/OrderModel.js";
import { OrderDetailModel, OrderDetailType } from "../models/OrderDetailModel.js";
import { getUserCart } from "../utils/checkUserHasCart.js";
import { BookModel } from "../models/BookModel.js";

/**
 * @desc    Thêm sách vào giỏ hàng
 * @route   POST '/order/addCart';
 */
const addBookToCart = async (req: AuthenticatedRequest, res: Response) => {
    const { bookId, soLgSachThem, price, soLgTonKho } = req.body;
    const userId = req.user?._id;
    try {
        // Lấy giỏ hàng của user
        const cart = await getUserCart(userId);
        // Kiểm tra xem bookId đã tồn tại trong giỏ hàng chưa?
        const existCartDetail = await OrderDetailModel.findOne({ orderId: cart._id, bookId }).exec();
        if (existCartDetail) {      // Nếu đã có, cập nhật số lượng sách và thành tiền
            existCartDetail.quantity += soLgSachThem;
            existCartDetail.price += price;
            if (existCartDetail.quantity > soLgTonKho) {    // Ktra tổng số lượng sách thêm trong giỏ
                res.status(400).json({ message: `Sách này còn ${soLgTonKho}. Hãy giảm bớt!` });
                return;
            }
            await existCartDetail.save();
        } else {        // Nếu chưa có, thêm sách mới vào giỏ hàng
            await OrderDetailModel.create({ orderId: cart._id, bookId, quantity: soLgSachThem, price });
        }
        // Tính tổng giá từ tất cả các orderDetails trong giỏ hàng
        const totalPrice = (await OrderDetailModel.find({ orderId: cart._id }).exec())
            .reduce((acc, item) => acc + item.price, 0);
        // Cập nhật tổng tiền trong Order
        await OrderModel.findOneAndUpdate(
            { _id: cart._id },
            { totalPrice: totalPrice },
        ).exec();
        res.status(200).json({ message: "Thêm sách vào giỏ hàng thành công!" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hệ thống!" });
    }
};

/**
 * @desc    Lấy giỏ hàng
 * @route   GET '/order/getCart'
 */
const getCart = async (req: AuthenticatedRequest, res: Response) => {
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
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hệ thống!" });
    }
}

/**
 * @des     Cập nhật giỏ hàng
 * @route   PUT '/order/updateCart'
 */
const updateCart = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const updatedOrderDetails = req.body.updatedOrderDetails as Array<OrderDetailType>;
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
                res.status(400).json({ message: `Sách '${book?.title}' còn ${book?.quantity}. Hãy giảm bớt!` });
                return;
            }
            // Thêm lệnh update vào bulk
            bulkUpdates.push({
                updateOne: {
                    filter: { _id: orderDetail._id },
                    update: {
                        quantity: newQuantity,      // Cập nhật lại số lượng và thành tiền
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
        const updatedCart = await OrderModel.findOneAndUpdate(
            { _id: cart._id },
            { totalPrice: totalPrice },
            { new: true }   // Trả về giá trị đã cập nhật
        ).exec();
        res.status(200).json({ message: "Cập nhật sách trong giỏ hàng thành công!", order: updatedCart, orderDetails: cartDetails })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hệ thống!" });
    }
}

/**
 * @des     Xóa sách trong giỏ hàng
 * @route   DELETE '/order/deleteCart/:orderDetailId'
 */
const deleteBookInCart = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const { orderDetailId } = req.params;
    try {
        // Lấy giỏ hàng của user
        const cart = await getUserCart(userId);
        // Xóa orderDetail của cart trong csdl
        const result = await OrderDetailModel.findByIdAndDelete(orderDetailId).exec();
        if (!result) throw new Error("Lỗi: Không thể xóa orderDetail được!");
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
        const updatedCart = await OrderModel.findOneAndUpdate(
            { _id: cart._id },
            { totalPrice: totalPrice },
            { new: true }   // Trả về giá trị đã cập nhật
        ).exec();
        res.status(200).json({ message: "Xóa sách trong giỏ hàng thành công!", order: updatedCart, orderDetails: cartDetails })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hệ thống!" });
    }
}

/**
 * @desc    Kiểm tra số lượng sách trong giỏ có thỏa mãn sau khi ấn 'Thanh toán'
 * @route   GET '/order/checkQuantityBook'
 */
const checkQuantityBook = async (req: AuthenticatedRequest, res: Response) => {
    const { orderId } = req.query;
    try {
        // Lấy danh sách các cartDetails
        const cartDetails = await OrderDetailModel.find({ orderId }).exec();
        // Lấy danh sách các sách trong DB
        const bookInDBs = await BookModel.find({
            _id: { $in: cartDetails.map(item => item.bookId) }
        }).exec();
        // Tạo một Map để tra cứu nhanh số lượng tồn kho của từng sách trong DB
        const bookStockMap = new Map(bookInDBs.map(book => [book._id.toString(), { title: book.title, quantity: book.quantity }]));
        let invalidBook = {
            title: '',
            quantity: 0
        };
        // Kiểm tra số lượng sách thêm trong cartDetails có nhỏ hơn số lượng sách tồn trong BookInDB
        const isQuantityValid = cartDetails.every(item => {
            const stockQuantity = bookStockMap.get(item.bookId.toString());
            if (stockQuantity !== undefined) {
                if (item.quantity <= stockQuantity.quantity) {
                    return true;
                }
                invalidBook.title = stockQuantity.title;
                invalidBook.quantity = stockQuantity.quantity;
                return false;
            }
        });
        if (!isQuantityValid) {
            res.status(400).json({ message: `Sách '${invalidBook.title}' còn ${invalidBook.quantity} quyển. Hãy chỉnh lại số lượng trong giỏ!` })
        } else {
            res.status(200).json({ message: "Cho phép thanh toán!" })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hệ thống!" });
    }
}

/**
 * @desc    Tạo đơn đặt hàng khi người dùng ấn 'Hoàn tất đơn hàng'
 * @route   PUT '/order/createOrder'
 */
const createOrder = async (req: AuthenticatedRequest, res: Response) => {
    const { order } = req.body;
    try {
        // Kiểm tra phoneNumber và address có chưa?
        if (!(order.phoneNumber && order.address)) {
            res.status(400).json({ message: "Hãy điền đầy đủ số điện thoại và địa chỉ nhận hàng!" });
            return;
        }
        //------------------------------------------------------
        // Cập nhật lại số lượng sách tồn kho sau khi mua
        const orderDetails = await OrderDetailModel.find({orderId: order.id}).exec();
        const bulkUpdates = [];
        for (const orderDetail of orderDetails) {
            const quantityAdded = orderDetail.quantity;
            const book = await BookModel.findById(orderDetail.bookId).exec();
            // Thêm lệnh update vào bulk
            bulkUpdates.push({
                updateOne: {
                    filter: { _id: orderDetail.bookId },
                    update: {
                        quantity: book?.quantity! - quantityAdded,      // Cập nhật lại số lượng trong kho
                    }
                }
            });
        }
        await BookModel.bulkWrite(bulkUpdates);
        //------------------------------------------------------
        // Cập nhật orderStatus từ 'Cart' -> 'Order'
        const updatedOrder = await OrderModel.findByIdAndUpdate(
            order.id,
            {
                orderStatus: 'Order',
                paymentType: order.paymentType,
                phoneNumber: order.phoneNumber,
                address: order.address
            },
            { new: true }
        )
            .exec();
        if (!updatedOrder) {
            res.status(400).json({ message: "Tạo đơn hàng không thành công!" });
            return;
        }
        res.status(200).json({
            message: "Đặt hàng thành công!",
            order: updatedOrder
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hệ thống!" });
    }
}

/**
 * @desc    Lấy danh sách đơn hàng của người dùng (Gồm đơn đặt và hóa đơn)
 * @route   GET '/order/getOrders'
 */
const getOrders = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id;
    const deliveryBrand = 'ViettelPost';
    try {
        // Lấy danh sách đơn hàng
        const orders = await OrderModel.find({
            userId,
            orderStatus: { $in: ['Order', 'Invoice'] }
        })
            .select(['_id', 'updatedAt', 'orderStatus', 'totalPrice'])
            .exec();
        // Thêm trường deliveryBrand vào mỗi order
        const ordersWithDeliveryBrand = orders.map(order => ({
            ...order.toObject(),
            deliveryBrand: deliveryBrand
        }));
        res.status(200).json({
            message: "Lấy danh sách đơn hàng thành công!",
            orders: ordersWithDeliveryBrand
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hệ thống!" });
    }
}

/**
 * @desc    Lấy chi tiết đơn hàng
 * @route   GET '/order/getOrderDetails/:orderId'
 */
const getOrderDetails = async (req: AuthenticatedRequest, res: Response) => {
    const orderId = req.params.orderId;
    try {
        // Lấy thông tin order
        const order = await OrderModel.findById(orderId).exec();
        if (!order) {
            res.status(400).json({ message: "Không tìm thấy mã đơn hàng này!" });
            return;
        }
        const orderDetails = await OrderDetailModel.find({ orderId })
            .populate({
                path: 'bookId',
                select: '_id title salePrice imageURL',
                model: 'book'
            })
            .exec();
        res.status(200).json({ message: "Lấy chi tiết đơn hàng thành công!", order, orderDetails });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hệ thống!" });
    }
}

export {
    addBookToCart,
    getCart,
    updateCart,
    deleteBookInCart,
    getOrders,
    getOrderDetails,
    checkQuantityBook,
    createOrder
}