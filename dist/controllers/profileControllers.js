import { UserModel } from "../models/UserModel.js";
import bcrypt from "bcrypt";
// Get profile
const getProfileUser = async (req, res) => {
    try {
        const user = req.user;
        if (user) {
            res.status(200).json({
                message: 'Lấy thông tin người dùng thành công!',
                user: { userId: user._id, userName: user.userName, fullName: user.fullName }
            });
        }
        else {
            res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
};
// update password
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;
    try {
        if (user) {
            // So sánh mật khẩu cũ
            const isCompare = await bcrypt.compare(oldPassword, user.password);
            if (isCompare) {
                // Hash the new password before updating
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                await UserModel.findOneAndUpdate({ _id: user._id }, { password: hashedPassword });
                res.status(200).json({
                    message: 'Cập nhật mật khẩu thành công!',
                    user: { userId: user._id, userName: user.userName, fullName: user.fullName }
                });
            }
            else {
                res.status(400).json({ message: 'Mật khẩu cũ bị sai, hãy nhập lại!' });
            }
        }
        else {
            res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ.' });
    }
};
export { getProfileUser, changePassword };
