import {
  getAllBooks,
  getFilteredBooks,
  getBooksByName,
  insertNewBook,
  getCategories,
  getAuthors,
  getPublishers,
} from "../dist/controllers/bookControllers";
import { BookModel } from "../dist/models/BookModel";
import { CategoryModel } from "../dist/models/CategoryModel";
import { AuthorOnBookModel } from "../dist/models/AuthorOnBookModel";
import { CategoryOnBookModel } from "../dist/models/CategoryOnBookModel";
import { PublisherModel } from "../dist/models/PublisherModel";
import { AuthorModel } from "../dist/models/AuthorModel";
import mongoose from "mongoose";

jest.mock("../dist/models/AuthorModel", () => ({
  AuthorModel: {
    find: jest.fn(),
  },
}));
jest.mock("../dist/models/PublisherModel", () => ({
  PublisherModel: {
    find: jest.fn(),
  },
}));

// Mock response và request của Express
const mockRequest = (body = {}) => ({
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
