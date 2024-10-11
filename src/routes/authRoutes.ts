import express from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/authControllers.js";
import authenticate from "../middlewares/authenticateToken.js";

const authRouter = express.Router();

// Route for auth
authRouter.get('/', authenticate, (req, res) => {
    res.status(200).json({ message: 'Authentication' });
})
// Route for login
authRouter.post('/login', loginUser);

// Route for register
authRouter.post('/register', registerUser);

// Route for logout
authRouter.get('/logout', logoutUser);

export { authRouter };