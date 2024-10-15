import express from "express";
import { changePassword, getProfileUser } from "../controllers/profileControllers.js";

export const profileRouter = express.Router();

profileRouter.post('/getProfile', getProfileUser);

profileRouter.put('/changePassword', changePassword);