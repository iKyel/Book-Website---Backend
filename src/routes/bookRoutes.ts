import express from "express";
import {
    getAllBooks,
    getBooksByPriceRange,
    getNewestBooks,
    getBooksByName,
    getBestSellerBooks,
    getBooksByCategory,
    getOldestBooks,
    getAllBooksSortedByTitleAsc,
    getAllBooksSortedByTitleDesc
} from "../controllers/bookControllers.js";

const bookRouter = express.Router();

// Lấy danh sách các sách
bookRouter.get('/getBooks', getAllBooks);

// Lấy danh sách các sách mới nhất
bookRouter.get('/getNewestBooks', getNewestBooks);

// Lấy danh sách các sách cũ nhất
bookRouter.get('/getOldestBooks', getOldestBooks);

// Lấy danh sách các sách bán chạy
bookRouter.get('/getBestSellerBooks', getBestSellerBooks);

// Lấy danh sách các sách theo tên A-Z
bookRouter.get('/getAllBooksSortedByTitleAsc', getAllBooksSortedByTitleAsc);

// Lấy danh sách các sách theo tên Z-A
bookRouter.get('/getAllBooksSortedByTitleDesc', getAllBooksSortedByTitleDesc);

// Lấy danh sách sách theo khoảng giá
bookRouter.get('/getBooksByPriceRange/price=:minPrice-:maxPrice', getBooksByPriceRange);

// Lấy danh sách sách theo thể loại
bookRouter.get('/getBooksByCategory', getBooksByCategory);

// Lấy danh sách các sách theo tên tìm kiếm
bookRouter.get('/getBooksByName', getBooksByName);

export { bookRouter };