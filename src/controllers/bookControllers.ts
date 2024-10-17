import { Request, Response } from "express";
import { BookModel } from "../models/BookModel.js";
import { AuthorOnBookModel } from "../models/AuthorOnBookModel.js";
import { AuthorModel } from "../models/AuthorModel.js";
import { CategoryOnBookModel } from "../models/CategoryOnBookModel.js";
import { CategoryModel } from "../models/CategoryModel.js";
import { PublisherModel } from "../models/PublisherModel.js";

// Lấy danh sách các sách
const getAllBooks = async (req: Request, res: Response) => {
    try {
        const listBooks = await BookModel.find()
            .select(['title', 'discount', 'salePrice'])
            .exec();
        res.status(200).json({ message: 'Lấy danh sách các sách thành công!', listBooks })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi hệ thống máy chủ!' });
    }
}

// Lấy danh sách các sách mới nhất
export const getNewestBooks = async (req: Request, res: Response) => {
    try {
        const listOfNewestBooks = await BookModel.find()
            .select(['title', 'discount', 'salePrice'])
            .sort({ 'createAt': -1 })
            .exec();
        res.status(200).json({ message: 'Lấy danh sách các sách thành công!', listOfNewestBooks })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi hệ thống máy chủ!' });
    }
}

// Lấy danh sách các sách cũ nhất
export const getOldestBooks = async (req: Request, res: Response) => {
    try {
        const listOfNewestBooks = await BookModel.find()
            .select(['title', 'discount', 'salePrice'])
            .sort({ 'createAt': 1 })
            .exec();
        res.status(200).json({ message: 'Lấy danh sách các sách thành công!', listOfNewestBooks })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi hệ thống máy chủ!' });
    }
}

// Lấy danh sách các sách bán chạy nhất
export const getBestSellerBooks = async (req: Request, res: Response) => {
    try {
        // Thực hiện phép truy vấn aggregation để tính tổng số lượng bán của mỗi cuốn sách
        const booksWithSales = await BookModel.aggregate()
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
                totalQuantitySold: 1
            })
            .sort({ totalQuantitySold: -1 }) // Sắp xếp theo tổng số lượng bán tăng dần
            .exec();
        res.status(200).json({ message: 'Lấy danh sách các sách thành công!', booksWithSales });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Lỗi hệ thống máy chủ!' });
    }
};

// Lấy danh sách các sách sắp xếp theo tên 'title' từ A-Z
export const getAllBooksSortedByTitleAsc = async (req: Request, res: Response) => {
    try {
        const listBooks = await BookModel.find()
            .select(['title', 'discount', 'salePrice'])
            .sort({ title: 1 }) // Sắp xếp theo title từ A-Z (1 cho ascending)
            .exec();
        res.status(200).json({ message: 'Lấy danh sách các sách thành công!', listBooks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi hệ thống máy chủ!' });
    }
};

// Lấy danh sách các sách sắp xếp theo tên 'title' từ Z-A
export const getAllBooksSortedByTitleDesc = async (req: Request, res: Response) => {
    try {
        const listBooks = await BookModel.find()
            .select(['title', 'discount', 'salePrice'])
            .sort({ title: -1 }) // Sắp xếp theo title từ Z-A
            .exec();
        res.status(200).json({ message: 'Lấy danh sách các sách thành công!', listBooks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi hệ thống máy chủ!' });
    }
};


// // Lấy danh sách các sách (gồm chi tiết sách)
// const getListOfBookDetails = async (req: Request, res: Response) => {
//     try {
//         const listBooks = await BookModel.find().exec();
//         // Tạo một promise để lấy thông tin chi tiết của từng cuốn sách
//         const listDetailBooks = await Promise.all(
//             listBooks.map(async (book) => {
//                 // Lấy các authorId liên quan đến bookId từ AuthorOnBooks
//                 const authorOnBooks = await AuthorOnBookModel.find({ bookId: book._id }).exec();
//                 const authorIds = authorOnBooks.map((item) => item.authorId);
//                 const authors = await AuthorModel.find({ _id: { $in: authorIds } }).exec();
//                 // Lấy các categoryId liên quan đến bookId từ CategoryOnBooks
//                 const categoryOnBooks = await CategoryOnBookModel.find({ bookId: book._id }).exec();
//                 const categoryIds = categoryOnBooks.map((item) => item.categoryId);
//                 const categories = await CategoryModel.find({ _id: { $in: categoryIds } }).exec();
//                 // Lấy tên Nhà Xuất Bản theo publisherId
//                 const publisher = await PublisherModel.findById(book.publisherId).exec();
//                 return {
//                     ...book.toObject(),
//                     publisherName: publisher?.publisherName,
//                     authors: authors.map((author) => author.authorName),
//                     categories: categories.map((category) => category.categoryName),
//                 };
//             })
//         );
//         res.status(200).json({ message: 'Get listBooks successful', listDetailBooks })
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }


// Lấy danh sách sách theo khoảng giá
const getBooksByPriceRange = async (req: Request, res: Response) => {
    const { minPrice, maxPrice } = req.params; // Lấy giá từ params
    try {
        const listBooks = await BookModel.find({
            salePrice: {
                $gte: Number(minPrice), // Giá tối thiểu
                $lte: Number(maxPrice), // Giá tối đa
            }
        })
            .select(['title', 'discount', 'salePrice'])
            .exec();
        res.status(200).json({ message: 'Lấy danh sách sách theo khoảng giá thành công!', listBooks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi hệ thống máy chủ!' });
    }
};

// Lấy danh sách sách theo thể loại
export const getBooksByCategory = async (req: Request, res: Response) => {
    const { categoryName } = req.body;
    try {
        // Tìm categoryId theo categoryName
        const category = await CategoryModel.findOne({ categoryName }).exec();
        // Tìm các sách thuộc categoryId và lấy danh sách các bookId
        const categoryOnBooks = await CategoryOnBookModel.find({ categoryId: category?._id }).exec();
        const bookIds = categoryOnBooks.map(item => item.bookId);
        // Lấy các sách có trong bookId
        const listBooks = await BookModel.find({ _id: { $in: bookIds } })
            .select(['title', 'discount', 'salePrice'])
            .exec();
        res.status(200).json({ message: 'Lấy danh sách sách theo thể loại thành công!', listBooks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi hệ thống máy chủ!' });
    }
};

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
            .select(['title', 'discount', 'salePrice'])
            .exec();
        res.status(200).json({ message: 'Lấy danh sách các sách thành công!', listBooks });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
}

// Lấy danh sách các sách theo lọc, tìm kiếm, sắp xếp theo 1 tiêu chí (a-z, z-a, newest, oldest, bestseller)
export const getFilteredBooks = async (req: Request, res: Response) => {
    const { categoryNames, priceRange, searchName, sortByOrder } = req.body;
    let args: any = {};
    try {
        // Lọc theo khoảng giá
        if (priceRange) {
            const [minPrice, maxPrice] = priceRange.split("-");
            args.salePrice = {
                $gte: Number(minPrice) || 0,
                $lte: Number(maxPrice) || Infinity,
            };
        }
        // Tìm kiếm theo tên sách
        if (searchName) {
            args.title = {
                $regex: searchName,
                $options: "i"
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
        let sortOption: any = {};
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
            default:
                break;
        }
        // Lấy ds sách theo các tiêu chí trên
        let listBooks;
        if (sortByOrder !== 'best-seller') {
            listBooks = await BookModel.find(args)
                .select(['title', 'discount', 'salePrice', 'imageURL'])
                .sort(sortOption)
                .exec();
        } else {
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
                .sort({ totalQuantitySold: -1 }) // Sắp xếp theo tổng số lượng bán tăng dần
                .exec();
        }
        res.status(200).json({ message: 'Lấy danh sách các sách thành công!', listBooks });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Lỗi hệ thống máy chủ!' });
    }
}

export { getAllBooks, getBooksByPriceRange, getBooksByName };