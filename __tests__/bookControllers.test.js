import {
  getAllBooks,
  getFilteredBooks,
  getBooksByName,
  insertNewBook,
  getCategories,
  getAuthors,
  getPublishers,
} from "../dist/src/controllers/bookControllers";
import { BookModel } from "../dist/src/models/BookModel";
import { CategoryModel } from "../dist/src/models/CategoryModel";
import { PublisherModel } from "../dist/src/models/PublisherModel";
import { AuthorModel } from "../dist/src/models/AuthorModel";
// Mock các phương thức của Mongoose
jest.mock("../dist/src/models/BookModel");
jest.mock("../dist/src/models/CategoryModel");
jest.mock("../dist/src/models/AuthorOnBookModel");
jest.mock("../dist/src/models/CategoryOnBookModel");
jest.mock("../dist/src/models/AuthorModel", () => ({
  AuthorModel: {
    find: jest.fn(),
  },
}));
jest.mock("../dist/src/models/PublisherModel", () => ({
  PublisherModel: {
    find: jest.fn(),
  },
}));

// Mock response và request của Express
const mockRequest = (query = {}, body = {}) => ({
  query,
  body,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Book Controllers", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls giữa các tests
  });

  // Test hàm getAllBooks
  describe("getAllBooks", () => {
    it("should return list of books with correct pagination", async () => {
      const req = mockRequest({ page: 1 });
      const res = mockResponse();
      const books = [{ title: "Book 1", salePrice: 100, imageURL: "img1.jpg" }];
      BookModel.find.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(books),
      });
      await getAllBooks(req, res);
      expect(BookModel.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Lấy danh sách các sách thành công!",
        listBooks: books,
      });
    });

    it("should return 500 error on failure", async () => {
      const req = mockRequest({ currentPage: 1 });
      const res = mockResponse();
      BookModel.find.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValueOnce(new Error("Server Error")),
      });
      await getAllBooks(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Lỗi hệ thống máy chủ!",
      });
    });
  });

  // Test hàm getBooksByName
  describe("getBooksByName", () => {
    it("should return books that match the search name", async () => {
      const req = mockRequest({ searchName: "Book", currentPage: 1 });
      const res = mockResponse();
      const books = [{ title: "Book 1", salePrice: 100, imageURL: "img1.jpg" }];
      BookModel.find.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(books),
      });
      await getBooksByName(req, res);
      expect(BookModel.find).toHaveBeenCalledWith({
        title: {
          $regex: "Book",
          $options: "i",
        },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Lấy danh sách các sách thành công!",
        listBooks: books,
      });
    });

    it("should return 500 error on failure", async () => {
      const req = mockRequest({ searchName: "Book", currentPage: 1 });
      const res = mockResponse();
      BookModel.find.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValueOnce(new Error("Server Error")),
      });
      await getBooksByName(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Lỗi hệ thống máy chủ!",
      });
    });
  });

  // Test hàm getCategories
  describe("getCategories", () => {
    it("should return list of categories", async () => {
      const req = mockRequest();
      const res = mockResponse();
      const categories = [{ name: "Fiction" }, { name: "Science" }];
      CategoryModel.find.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(categories),
      });
      await getCategories(req, res);
      expect(CategoryModel.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Lấy danh sách các thể loại thành công!",
        categories,
      });
    });

    it("should return 500 error on failure", async () => {
      const req = mockRequest();
      const res = mockResponse();
      CategoryModel.find.mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error("Server Error")),
      });
      await getCategories(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Lỗi hệ thống máy chủ!",
      });
    });
  });
});

// Test hàm getAuthors
describe("getAuthors", () => {
  it("should return list of authors", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const authors = [
      { name: "Author 1", bio: "Bio 1", imageURL: "author1.jpg" },
    ];
    AuthorModel.find.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce(authors),
    });
    await getAuthors(req, res);
    expect(AuthorModel.find).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Lấy danh sách các tác giả thành công!", // Change here
      authors,
    });
  });

  it("should return 500 error on failure", async () => {
    const req = mockRequest();
    const res = mockResponse();
    AuthorModel.find.mockReturnValueOnce({
      exec: jest.fn().mockRejectedValueOnce(new Error("Server Error")),
    });
    await getAuthors(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Lỗi hệ thống máy chủ!",
    });
  });
});

// Test hàm getPublishers
describe("getPublishers", () => {
  it("should return list of publishers", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const publishers = [
      { name: "Publisher 1", address: "Address 1", contactInfo: "Contact 1" },
    ];
    PublisherModel.find.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValueOnce(publishers),
    });
    await getPublishers(req, res);
    expect(PublisherModel.find).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Lấy danh sách các nhà xuất bản thành công!", // Change here
      publishers,
    });
  });

  it("should return 500 error on failure", async () => {
    const req = mockRequest();
    const res = mockResponse();
    PublisherModel.find.mockReturnValueOnce({
      exec: jest.fn().mockRejectedValueOnce(new Error("Server Error")),
    });
    await getPublishers(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Lỗi hệ thống máy chủ!",
    });
  });
});
