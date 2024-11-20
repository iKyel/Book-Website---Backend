import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/jwtSecretKey.js";
import { UserModel } from "../models/UserModel.js";
// Verify user (Check tokens is valid or not vaild)
async function authenticate(req, res, next) {
    const token = req.cookies.token;
    // Check tokien is exists?
    if (!token) {
        res.status(401).json({ message: 'Token chưa có: Người dùng chưa đăng nhập!' });
    }
    else {
        // Check if token has expired, then throw error
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            // Check token is valid or not?
            const user = await UserModel.findOne({ _id: decoded.userId, userName: decoded.userName }).exec();
            if (!user) {
                res.status(401).json({ message: 'Token không hợp lệ: Không thấy người dùng!' });
            }
            else {
                // If Oke, then store 'user' in request and move to next middleware
                req.user = user;
                next();
            }
        }
        catch (error) {
            console.error('Lỗi khi xác thực token của người dùng:', error);
            res.status(403).json({ message: 'Token đã hết hạn. Hãy đăng nhập lại!' });
        }
    }
}
export default authenticate;
