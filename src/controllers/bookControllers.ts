import { Request, Response } from "express";
import { BookModel } from "../models/BookModel.js";

// Get list of books
const getAllBooks = async (req: Request, res: Response) => {
    try {
        const listBooks = await BookModel.find().exec();
        res.status(200).json({ message: 'Get listBooks successful', listBooks })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get list of books by sorted order
const getAllBooksByOrder = async (req: Request, res: Response) => {

}

// Get list of books by filter
const getAllBooksByFilter = async (req: Request, res: Response) => {

}

// Get list of books by search name
const getBooksByName = async (req: Request, res: Response) => {

}

export { getAllBooks, getAllBooksByOrder, getAllBooksByFilter, getBooksByName };