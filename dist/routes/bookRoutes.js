import express from "express";
import { getAllBooks, getAuthors, getBooksByName, getCategories, getDetailAuthor, getDetailBook, getFilteredBooks, getPublishers, insertNewBook } from "../controllers/bookControllers.js";
const bookRouter = express.Router();
// Lấy danh sách các sách
bookRouter.get('/getBooks', getAllBooks);
// Lấy danh sách các sách theo lọc, sắp xếp theo 1 tiêu chí (a-z, z-a, newest, oldest, bestseller)
bookRouter.get('/getFilteredBooks', getFilteredBooks); // fix logic lấy sách theo nhiều thể loại
// Lấy danh sách các sách theo tên tìm kiếm
bookRouter.get('/getBooksByName', getBooksByName);
// Thêm sách vào csdl
bookRouter.post('/createBook', insertNewBook);
// Lấy danh sách thể loại
bookRouter.get('/getCategories', getCategories);
// Lấy danh sách tác giả
bookRouter.get('/getAuthors', getAuthors);
// Lấy danh sách nhà xuất bản
bookRouter.get('/getPublishers', getPublishers);
// Lấy chi tiết sách theo bookId
bookRouter.get('/getDetailBook/:bookId', getDetailBook);
// Lấy chi tiết tác giả theo authorId
bookRouter.get('/getDetailAuthor/:authorId', getDetailAuthor); // fix logic lấy sách theo nhiều thể loại
export { bookRouter };
