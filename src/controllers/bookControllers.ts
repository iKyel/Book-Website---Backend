import { Request, Response } from "express";
import { BookModel } from "../models/BookModel.js";
import { CategoryOnBookModel } from "../models/CategoryOnBookModel.js";
import { CategoryModel } from "../models/CategoryModel.js";

const BOOKS_PER_PAGE = 16;

// Lấy danh sách các sách
const getAllBooks = async (req: Request, res: Response) => {
    const { currentPage } = req.body;
    try {
        const listBooks = await BookModel.find()
            .select(['title', 'discount', 'salePrice', 'imageURL'])
            .skip((currentPage - 1) * BOOKS_PER_PAGE)
            .limit(BOOKS_PER_PAGE)
            .exec();
        res.status(200).json({ message: 'Lấy danh sách các sách thành công!', listBooks })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
}

// Lấy danh sách các sách theo tên tìm kiếm
const getBooksByName = async (req: Request, res: Response) => {
    try {
        const { searchName } = req.body || '';
        const listBooks = await BookModel.find({
            title: {
                $regex: searchName,     // Dùng biểu thức chính quy để tìm kiếm
                $options: 'i'   // Tìm kiếm không phân biệt hoa thường
            }
        })
            .select(['title', 'discount', 'salePrice', 'imageURL'])
            .exec();
        res.status(200).json({ message: 'Lấy danh sách các sách thành công!', listBooks });
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

// Lấy danh sách các sách theo lọc, tìm kiếm, sắp xếp theo 1 tiêu chí (a-z, z-a, newest, oldest, bestseller)
const getFilteredBooks = async (req: Request, res: Response) => {
    const { categoryNames, priceRange, sortByOrder, currentPage } = req.body;
    let args: FilteredFields = {};
    try {
        // Lọc theo khoảng giá
        if (priceRange) {
            const [minPrice, maxPrice] = priceRange.split("-");
            args.salePrice = {
                $gte: Number(minPrice) || 0,
                $lte: Number(maxPrice) || Infinity,
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
                .select(['title', 'discount', 'salePrice', 'imageURL'])
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
                .addFields({    // Thêm trường tổng số lượng bán của mỗi sách
                    totalQuantitySold: { $sum: '$orders.quantity' }
                })
                .project({      // select các trường
                    _id: 1,
                    title: 1,
                    salePrice: 1,
                    imageURL: 1,
                    totalQuantitySold: 1
                })
                .sort({ totalQuantitySold: -1 }) // Sắp xếp theo tổng số lượng bán giảm dần
                .skip((currentPage - 1) * BOOKS_PER_PAGE)
                .limit(BOOKS_PER_PAGE)
                .exec();
        }
        res.status(200).json({ message: 'Lấy danh sách các sách thành công!', listBooks });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
}

export { getAllBooks, getFilteredBooks, getBooksByName };