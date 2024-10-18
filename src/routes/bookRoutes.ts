import express from "express";
import {
    getAllBooks,
    getBooksByName,
    getFilteredBooks
} from "../controllers/bookControllers.js";

const bookRouter = express.Router();

// Lấy danh sách các sách
bookRouter.get('/getBooks', getAllBooks);

// Lấy danh sách các sách theo lọc, sắp xếp theo 1 tiêu chí (a-z, z-a, newest, oldest, bestseller)
bookRouter.get('/getFilteredBooks', getFilteredBooks);

// Lấy danh sách các sách theo tên tìm kiếm
bookRouter.get('/getBooksByName', getBooksByName);

export { bookRouter };