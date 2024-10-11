import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import 'dotenv/config';
import { authRouter } from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || '';

app.use(morgan('dev'));
app.use(express.json());    // Parsing json from request body
app.use(cookieParser());    // Parsing cookie form request

// Middleware for handling CORS Policy
app.use(cors({      // Allow custom origins
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}))

app.get('/', (req, res) => {
    res.send("Home Page");
})

// Routes for authentication
app.use('/auth', authRouter);


// Connect to db and load server if success
try {
    await mongoose.connect(MONGODB_URI);
    console.log('App connected to database');
    app.listen(PORT, () => {    // open server at port ''3000''
        console.log(`App is listening to port: http://localhost:${PORT}`);
    })
} catch (error) {
    console.log(error);
}