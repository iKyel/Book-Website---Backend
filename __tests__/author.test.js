import { AuthorModel } from "../dist/models/AuthorModel.js";
import { getAuthors } from "../dist/controllers/bookControllers.js";

// Mock các phương thức của AuthorModel
jest.mock("../dist/models/AuthorModel", () => ({
  find: jest.fn(),
}));

describe("Test author details", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("should return the list of authors successfully", async () => {
    const authors = [{ name: "Tác giả 1" }, { name: "Tác giả 2" }];
    AuthorModel.find.mockResolvedValue(authors);

    await getAuthors(mockReq, mockRes, mockNext);

    expect(AuthorModel.find).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Lấy danh sách các tác giả thành công!",
      authors,
    });
  });

  it("should return an error when the author list cannot be retrieved", async () => {
    const errorMessage = "Lỗi hệ thống máy chủ!";
    AuthorModel.find.mockRejectedValue(new Error(errorMessage));

    await getAuthors(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: errorMessage,
    });
  });
});
