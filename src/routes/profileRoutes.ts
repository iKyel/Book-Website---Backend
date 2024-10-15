import express from "express";
import { changePassword, getProfileUser } from "../controllers/profileControllers.js";
import authenticate from "../middlewares/authenticateToken.js";

export const profileRouter = express.Router();

profileRouter.post('/getProfile', authenticate, getProfileUser);

profileRouter.put('/changePassword', authenticate, changePassword);