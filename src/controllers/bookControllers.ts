import { Request, Response } from "express";
import { BookModel } from "../models/BookModel.js";
import { CategoryOnBookModel } from "../models/CategoryOnBookModel.js";
import { CategoryModel } from "../models/CategoryModel.js";
import { PublisherModel } from "../models/PublisherModel.js";
import { AuthorModel } from "../models/AuthorModel.js";
import { AuthorOnBookModel } from "../models/AuthorOnBookModel.js";

const BOOKS_PER_PAGE = 16;

/**
 * @desc    Lấy tất cả các sách
 * @route   GET '/books/getAllBooks'
 */
const getAllBooks = async (req: Request, res: Response) => {
    const { currentPage } = req.body;
    try {
        const listBooks = await BookModel.find()
            .select(['title', 'salePrice', 'imageURL'])
            .skip((currentPage - 1) * BOOKS_PER_PAGE)
            .limit(BOOKS_PER_PAGE)
            .exec();
        res.status(200).json({
            message: 'Lấy danh sách các sách thành công!',
            listBooks
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
}

/**
 * @desc    Lấy danh sách các sách theo tên tìm kiếm
 * @route   GET '/books/getBooksByName'
 */
const getBooksByName = async (req: Request, res: Response) => {
    try {
        const { searchName, currentPage } = req.body;
        const listBooks = await BookModel.find({
            title: {
                $regex: searchName,
                $options: 'i'
            }
        })
            .select(['title', 'salePrice', 'imageURL'])
            .skip((currentPage - 1) * BOOKS_PER_PAGE)
            .limit(BOOKS_PER_PAGE)
            .exec();
        res.status(200).json({
            message: 'Lấy danh sách các sách thành công!',
            listBooks
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
}

type FilteredFields = {
    salePrice?: any,
    _id?: any
}
type SortedFields = {
    title?: any,
    createAt?: any
}

/**
 * @desc    Lấy danh sách các sách theo lọc, tìm kiếm, sắp xếp theo 1 tiêu chí (a-z, z-a, newest, oldest, bestseller)
 * @route   GET '/books/getFilteredBooks'
 */
const getFilteredBooks = async (req: Request, res: Response) => {
    const { categoryNames, priceRange, sortByOrder, currentPage } = req.body;
    let args: FilteredFields = {};
    try {
        // Lọc theo khoảng giá
        if (priceRange) {
            const { minPrice, maxPrice } = priceRange;
            args.salePrice = {
                $gte: Number(minPrice) || 0,
                $lte: Number(maxPrice) || Number.MAX_VALUE,
            };
        }
        // Lọc theo danh mục sách
        if (categoryNames) {
            const categories = await CategoryModel.findOne({ categoryNames }).exec();
            const categoryOnBooks = await CategoryOnBookModel.find({ categoryId: categories?._id }).exec();
            const bookIds = categoryOnBooks.map(item => item.bookId);
            args._id = { $in: bookIds };
        }
        // Lọc theo tiêu chí sắp xếp
        let sortOption: SortedFields = {};
        switch (sortByOrder) {
            case 'a-z':
                sortOption.title = 1; break;
            case 'z-a':
                sortOption.title = -1; break;
            case 'newest':
                sortOption.createAt = -1; break;
            case 'oldest':
                sortOption.createAt = 1; break;
        }
        // Lấy ds sách theo các tiêu chí trên
        let listBooks = [];
        if (sortByOrder !== 'best-seller') {
            listBooks = await BookModel.find(args)
                .select(['title', 'salePrice', 'imageURL'])
                .sort(sortOption)
                .skip((currentPage - 1) * BOOKS_PER_PAGE)
                .limit(BOOKS_PER_PAGE)
                .exec();
        } else {
            // Lấy ds sách sắp xếp theo best-seller
            listBooks = await BookModel.aggregate()
                .match(args)
                .lookup({   // Join với 'OrderDetails' để lấy danh sách 'orders' có bookId = _id
                    from: 'OrderDetails',
                    localField: '_id',
                    foreignField: 'bookId',
                    as: 'orders'
                })
                .addFields({
                    totalQuantitySold: { $sum: '$orders.quantity' }
                })
                .project({
                    _id: 1,
                    title: 1,
                    salePrice: 1,
                    imageURL: 1,
                    totalQuantitySold: 1
                })
                .sort({ totalQuantitySold: -1 })
                .skip((currentPage - 1) * BOOKS_PER_PAGE)
                .limit(BOOKS_PER_PAGE)
                .exec();
        }
        res.status(200).json({
            message: 'Lấy danh sách các sách thành công!',
            listBooks
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
}


type NewBookType = {
    title: string,
    publisherName: string,
    categoryNames: string[],
    authorNames: string[],
    discount: number,
    salePrice: number,
    quantity: number,
    publishedYear: number,
    size: number[],
    coverForm: "Soft" | "Hard",
    content: string,
    imageURL: string
}

/**
 * @desc    Thêm sách vào cơ sở dữ liệu
 * @route   POST '/books/createBook'
 */
const insertNewBook = async (req: Request, res: Response) => {
    try {
        const bookInfo: NewBookType = req.body;
        const publisherId = (await PublisherModel.findOne({ publisherName: bookInfo.publisherName }).exec())?._id;
        const categoryIds = (await CategoryModel.find({ categoryName: { $in: bookInfo.categoryNames } }).exec()).map(category => category._id);
        const authorIds = (await AuthorModel.find({ authorName: { $in: bookInfo.authorNames } }).exec()).map(author => author._id);
        // Insert book into 'Books' collection
        const newBook = await BookModel.create({
            title: bookInfo.title,
            publisherId: publisherId,
            discount: bookInfo.discount,
            salePrice: bookInfo.salePrice,
            quantity: bookInfo.quantity,
            publishedYear: bookInfo.publishedYear,
            size: bookInfo.size,
            coverForm: bookInfo.coverForm,
            content: bookInfo.content,
            imageURL: bookInfo.imageURL
        });
        // Insert authorOnBooks into 'AuthorOnBooks' collection
        const authorOnBooks = authorIds.map(authorId => ({
            authorId,
            bookId: newBook._id
        }));
        await AuthorOnBookModel.insertMany(authorOnBooks);
        // Insert categoryOnBooks into 'CategoryOnBooks' collection
        const categoryOnBooks = categoryIds.map(categoryId => ({
            categoryId,
            bookId: newBook._id
        }));
        await CategoryOnBookModel.insertMany(categoryOnBooks);
        res.status(200).json({ message: "Thêm sách thành công!" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hoặc dữ liệu thêm vào ko phù hợp!" });
    }
}

/**
 * @desc    Lấy danh sách các thể loại
 * @route   POST '/books/getCategories'
 */
const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await CategoryModel.find().exec();
        res.status(200).json({
            message: 'Lấy danh sách các thể loại thành công!',
            categories
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
}

export { getAllBooks, getFilteredBooks, getBooksByName, insertNewBook, getCategories };