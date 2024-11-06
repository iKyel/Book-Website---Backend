import request from "supertest";
import app from "../dist/app.js";
import { AuthorModel } from "../dist/models/AuthorModel.js";
import { getAuthors } from "../dist/controllers/bookControllers.js";

// Mock mô-đun AuthorModel để tránh gọi thật vào cơ sở dữ liệu
jest.mock("../dist/models/AuthorModel.js", () => ({
  AuthorModel: {
    find: jest.fn(),
  },
}));

describe("GET /books/getAuthors", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Dọn dẹp mock trước mỗi test
  });

  it("should return a list of authors and a success message", async () => {
    const mockAuthors = [
      { _id: "author1", authorName: "Author 1", description: "Description 1" },
      { _id: "author2", authorName: "Author 2", description: "Description 2" },
    ];

    // Mock phương thức find của AuthorModel trả về dữ liệu mockAuthors
    AuthorModel.find.mockResolvedValue(mockAuthors);

    const response = await request(app).get("/books/getAuthors").expect(200);

    expect(response.body.message).toBe("Lấy danh sách các tác giả thành công!");
    expect(response.body.authors).toEqual(mockAuthors);
    expect(response.body.authors.length).toBe(2);
  });

  it("should return 500 if there is a server error", async () => {
    // Mock phương thức find gặp lỗi
    AuthorModel.find.mockRejectedValue(new Error("Server Error"));

    const response = await request(app).get("/books/getAuthors").expect(500);

    expect(response.body.message).toBe("Lỗi hệ thống máy chủ!");
  });
});
