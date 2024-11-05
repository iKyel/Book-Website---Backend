import { BookModel } from "../models/BookModel.js";
import { CategoryOnBookModel } from "../models/CategoryOnBookModel.js";
import { CategoryModel } from "../models/CategoryModel.js";
import { PublisherModel } from "../models/PublisherModel.js";
import { AuthorModel } from "../models/AuthorModel.js";
import { AuthorOnBookModel } from "../models/AuthorOnBookModel.js";
import mongoose from "mongoose";
const BOOKS_PER_PAGE = 16;
/**
 * @desc    Lấy tất cả các sách
 * @route   GET '/books/getAllBooks'
 */
const getAllBooks = async (req, res) => {
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
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
};
/**
 * @desc    Lấy danh sách các sách theo tên tìm kiếm
 * @route   POST '/books/getBooksByName'
 */
const getBooksByName = async (req, res) => {
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
};
/**
 * @desc    Lấy danh sách các sách theo lọc, tìm kiếm, sắp xếp theo 1 tiêu chí (a-z, z-a, newest, oldest, bestseller)
 * @route   POST '/books/getFilteredBooks'
 */
const getFilteredBooks = async (req, res) => {
    const { categoryNames, priceRange, sortByOrder, currentPage } = req.body;
    let args = {};
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
        let sortOption = {};
        switch (sortByOrder) {
            case 'a-z':
                sortOption.title = 1;
                break;
            case 'z-a':
                sortOption.title = -1;
                break;
            case 'newest':
                sortOption.createAt = -1;
                break;
            case 'oldest':
                sortOption.createAt = 1;
                break;
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
        }
        else {
            // Lấy ds sách sắp xếp theo best-seller
            listBooks = await BookModel.aggregate()
                .match(args)
                .lookup({
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
};
/**
 * @desc    Thêm sách vào cơ sở dữ liệu
 * @route   POST '/books/createBook'
 */
const insertNewBook = async (req, res) => {
    try {
        const bookInfo = req.body;
        const publisherId = mongoose.Types.ObjectId.createFromHexString(bookInfo.publisherId);
        const categoryIds = bookInfo.categoryIds.map(categoryId => mongoose.Types.ObjectId.createFromHexString(categoryId));
        const authorIds = bookInfo.authorIds.map(authorId => mongoose.Types.ObjectId.createFromHexString(authorId));
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
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi máy chủ hoặc dữ liệu thêm vào ko phù hợp!" });
    }
};
/**
 * @desc    Lấy danh sách các thể loại
 * @route   GET '/books/getCategories'
 */
const getCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.find().exec();
        res.status(200).json({
            message: 'Lấy danh sách các thể loại thành công!',
            categories
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
};
/**
 * @desc    Lấy danh sách các tác giả
 * @route   GET '/books/getAuthors'
 */
const getAuthors = async (req, res) => {
    try {
        const authors = await AuthorModel.find().exec();
        res.status(200).json({
            message: 'Lấy danh sách các tác giả thành công!',
            authors
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
};
/**
 * @desc    Lấy danh sách các nhà xuất bản
 * @route   GET '/books/getPublishers'
 */
const getPublishers = async (req, res) => {
    try {
        const publishers = await PublisherModel.find().exec();
        res.status(200).json({
            message: 'Lấy danh sách các nhà xuất bản thành công!',
            publishers
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
};
export { getAllBooks, getFilteredBooks, getBooksByName, insertNewBook, getCategories, getAuthors, getPublishers };
