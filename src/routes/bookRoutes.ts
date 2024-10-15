import express from "express";
import { getAllBooks, getAllBooksByFilter, getAllBooksByOrder, getBooksByName } from "../controllers/bookControllers.js";

const bookRouter = express.Router();

// Get list of books
bookRouter.get('/getBooks', getAllBooks);

// Get list of books by sorted order
bookRouter.get('/getBooksByOrder', getAllBooksByOrder);

// Get list of books by filter
bookRouter.get('/getBooksByFilter', getAllBooksByFilter);

// Get list of books by search name
bookRouter.get('/getBooksByName', getBooksByName);

export { bookRouter };