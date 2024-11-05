import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import 'dotenv/config';
import { profileRouter } from "./routes/profileRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { bookRouter } from "./routes/bookRoutes.js";
const app = express();
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || '';
app.use(morgan('dev'));
app.use(express.json()); // Parsing json from request body
app.use(cookieParser()); // Parsing cookie form request
// Middleware for handling CORS Policy
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));
app.get('/', (req, res) => {
    res.send("Home Page");
});
// Route for profile
app.use('/profile', profileRouter);
// Routes for authentication
app.use('/auth', authRouter);
// Routes for books
app.use('/books', bookRouter);
// Tạo hàm async để kết nối DB
const startServer = async () => {
    // Connect to db and load server if success
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('App connected to database');
        app.listen(PORT, () => {
            console.log(`App is listening to port: http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
};

export default app;
