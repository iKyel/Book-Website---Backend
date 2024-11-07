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
    const page = req.query.page || 1;
    try {
        const listBooks = await BookModel.find()
            .select(['title', 'salePrice', 'imageURL'])
            .skip((Number(page) - 1) * BOOKS_PER_PAGE)
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
 * @route   GET '/books/getBooksByName'
 */
const getBooksByName = async (req, res) => {
    try {
        // const { searchName, currentPage } = req.body;
        const searchName = req.query.searchName || '';
        const page = req.query.page || 1;
        const listBooks = await BookModel.find({
            title: {
                $regex: searchName,
                $options: 'i'
            }
        })
            .select(['title', 'salePrice', 'imageURL'])
            .skip((Number(page) - 1) * BOOKS_PER_PAGE)
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
    // const { categoryNames, priceRange, sortByOrder, currentPage } = req.body;
    const page = req.query.page || 1;
    const sortBy = req.query.sortBy || 'a-z';
    const types = req.query.types;
    const priceRange = req.query.priceRange;
    let args = {};
    try {
        // Lọc theo khoảng giá
        if (priceRange) {
            const [minPrice, maxPrice] = priceRange.split(':');
            args.salePrice = {
                $gte: Number(minPrice) || 0,
                $lte: Number(maxPrice) || Number.MAX_VALUE,
            };
        }
        // Lọc sách theo các thể loại
        if (types) {
            const cateNames = types.split(',');
            const categoryIds = (await CategoryModel.find({ categoryName: { $in: cateNames } })
                .exec()).map(category => category._id);
            const bookIdByCategories = (await CategoryOnBookModel.find({ categoryId: { $in: categoryIds } })
                .exec()).map(item => item.bookId);
            args._id = { $in: bookIdByCategories };
        }
        // Lọc theo tiêu chí sắp xếp
        let sortOption = {};
        switch (sortBy) {
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
            case 'best-seller':
                sortOption.totalQuantitySold = -1;
                break;
        }
        // Xây dựng query chung
        let query = BookModel.aggregate().match(args);
        // Nếu là best-seller thì cần join với OrderDetails và tính tổng số lượng bán
        if (sortBy === 'best-seller') {
            query = query.lookup({
                from: 'OrderDetails',
                localField: '_id',
                foreignField: 'bookId',
                as: 'orders'
            })
                .addFields({
                totalQuantitySold: { $sum: '$orders.quantity' }
            });
        }
        // Chọn các trường cần thiết và sắp xếp
        query = query.sort(sortOption)
            .project({
            _id: 1,
            title: 1,
            salePrice: 1,
            imageURL: 1,
            createAt: 1,
        })
            .skip((Number(page) - 1) * BOOKS_PER_PAGE)
            .limit(BOOKS_PER_PAGE);
        // Thực thi query (Lấy danh sách các sách phù hợp với tiêu chí trên)
        const listBooks = await query.exec();
        if (listBooks.length === 0) {
            res.status(404).json({ message: 'Không tìm thấy sách theo yêu cầu!' });
            return;
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
/**
 * @desc    Lấy chi tiết của sách
 * @route   GET '/books/getDetailBook/:bookId'
 */
const getDetailBook = async (req, res) => {
    const { bookId } = req.params;
    try {
        // Lấy chi tiết của sách
        const book = await BookModel.findById(bookId).exec();
        if (!book) {
            res.status(404).json({ message: 'Không tìm thấy cuốn sách này!' });
            return;
        }
        const [authorOnBooks, categoryOnBooks, publisher] = await Promise.all([
            AuthorOnBookModel.find({ bookId: book._id }).exec(),
            CategoryOnBookModel.find({ bookId: book._id }).exec(),
            PublisherModel.findById(book.publisherId).exec(),
        ]);
        const authorIds = authorOnBooks.map(item => item.authorId);
        const categoryIds = categoryOnBooks.map(item => item.categoryId);
        const [authors, categories] = await Promise.all([
            AuthorModel.find({ _id: { $in: authorIds } })
                .select('authorName').exec(),
            CategoryModel.find({ _id: { $in: categoryIds } }).exec(),
        ]);
        const detailBook = {
            ...book.toObject(),
            publisherName: publisher?.publisherName,
            authors: authors,
            categories: categories.map((category) => category.categoryName),
        };
        // Lấy danh sách các sách có cùng thể loại với sách trên
        const bookIdByCategories = (await CategoryOnBookModel.find({ categoryId: { $in: categoryIds } })
            .exec()).map(item => item.bookId);
        const listBooks = await BookModel.find({ _id: { $in: bookIdByCategories } })
            .select(['title', 'salePrice', 'imageURL'])
            .limit(3)
            .exec();
        res.status(200).json({ message: 'Lấy chi tiết cuốn sách thành công!', detailBook, listBooks });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
};
/**
 * @desc    Lấy chi tiết tác giả
 * @route   GET '/books/getDetailAuthor/:authorId'
 */
const getDetailAuthor = async (req, res) => {
    const { authorId } = req.params;
    const page = req.query.page || 1;
    const sortBy = req.query.sortBy || 'a-z';
    const types = req.query.types;
    const priceRange = req.query.priceRange;
    try {
        // Lấy thông tin tác giả
        const author = await AuthorModel.findById(authorId).exec();
        if (!author) {
            res.status(404).json({ message: 'Không tìm thấy tác giả này!' });
            return;
        }
        // Lấy danh sách các sách liên quan đến tác giả
        let args = {};
        // Lọc sách theo khoảng giá
        if (priceRange) {
            const [minPrice, maxPrice] = priceRange.split(':');
            args.salePrice = {
                $gte: Number(minPrice) || 0,
                $lte: Number(maxPrice) || Number.MAX_VALUE,
            };
        }
        // Lọc sách theo tác giả và các thể loại
        const bookIdByAuthors = (await AuthorOnBookModel.find({ authorId: authorId }) // Lọc sách theo tác giả
            .exec()).map(authorOnBook => authorOnBook.bookId.toString());
        let bookIds;
        if (types) { // Lọc sách theo các thể loại
            const cateNames = types.split(',');
            const categoryIds = (await CategoryModel.find({ categoryName: { $in: cateNames } })
                .exec()).map(category => category._id);
            const bookIdByCategories = (await CategoryOnBookModel.find({ categoryId: { $in: categoryIds } })
                .exec()).map(item => item.bookId);
            bookIds = bookIdByCategories.filter(bookIdByCategory => bookIdByAuthors.includes(bookIdByCategory.toString())); // Tìm các bookId vừa thuộc author và categories
        }
        else {
            bookIds = bookIdByAuthors.map(bookIdByAuthor => mongoose.Types.ObjectId.createFromHexString(bookIdByAuthor));
        }
        args._id = { $in: bookIds };
        // Lọc sách theo tiêu chí sắp xếp
        let sortOption = {};
        switch (sortBy) {
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
            case 'best-seller':
                sortOption.totalQuantitySold = -1;
                break;
        }
        let query = BookModel.aggregate().match(args);
        if (sortBy === 'best-seller') { // Nếu là 'best-seller' thì innerJoin với OrderDetails
            query = query.lookup({
                from: 'OrderDetails',
                localField: '_id',
                foreignField: 'bookId',
                as: 'orders'
            })
                .addFields({
                totalQuantitySold: { $sum: '$orders.quantity' }
            });
        }
        query = query.sort(sortOption)
            .project({
            _id: 1,
            title: 1,
            salePrice: 1,
            imageURL: 1,
            createAt: 1
        })
            .skip((Number(page) - 1) * BOOKS_PER_PAGE)
            .limit(BOOKS_PER_PAGE);
        const listBooks = await query.exec();
        if (listBooks.length === 0) {
            res.status(404).json({ message: 'Không có sách nào phù hợp!', author });
            return;
        }
        res.status(200).json({ message: 'Lấy chi tiết tác giả thành công!', author, listBooks });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
};
export { getAllBooks, getFilteredBooks, getBooksByName, insertNewBook, getCategories, getAuthors, getPublishers, getDetailBook, getDetailAuthor };
