import express from "express";
import { changePassword, getProfileUser } from "../controllers/profileControllers.js";
import authenticate from "../middlewares/authenticateToken.js";

export const profileRouter = express.Router();

<<<<<<< HEAD
profileRouter.post('/getProfile', authenticate, getProfileUser);

=======
// Route lấy thông tin user
profileRouter.get('/getProfile', authenticate, getProfileUser);

// Route sửa mật khẩu
>>>>>>> feature/loc-timkiem-sapxep
profileRouter.put('/changePassword', authenticate, changePassword);