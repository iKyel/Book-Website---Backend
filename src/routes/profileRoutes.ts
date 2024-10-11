import express from "express";
import { getProfileUser } from "../controllers/profileControllers.js";

export const profileRouter = express.Router();

profileRouter.post('/getProfile', getProfileUser);