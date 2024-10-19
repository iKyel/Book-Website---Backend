import express from "express";
import {
    getAllBooks,
    getBooksByName,
    getCategories,
    getFilteredBooks,
    insertNewBook
} from "../controllers/bookControllers.js";

const bookRouter = express.Router();

// Lấy danh sách các sách
bookRouter.get('/getBooks', getAllBooks);

// Lấy danh sách các sách theo lọc, sắp xếp theo 1 tiêu chí (a-z, z-a, newest, oldest, bestseller)
bookRouter.post('/getFilteredBooks', getFilteredBooks);

// Lấy danh sách các sách theo tên tìm kiếm
bookRouter.post('/getBooksByName', getBooksByName);

// Thêm sách vào csdl
bookRouter.post('/createBook', insertNewBook);

// Lấy danh sách thể loại
bookRouter.post('/getCategories', getCategories);

export { bookRouter };