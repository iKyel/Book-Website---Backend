import { getProfileUser } from "../dist/controllers/profileControllers.js";
import { UserModel } from "../dist/models/UserModel.js";

// Mock the UserModel
jest.mock("../dist/models/UserModel.js", () => ({
  findOne: jest.fn(),
}));

// Mock request và response
const mockRequest = {
  user: { _id: "123", userName: "testuser", fullName: "Test User" }, // Mocked user data
};

const mockResponse = {
  status: jest.fn(() => mockResponse),
  json: jest.fn(),
};

describe("getProfileUser", () => {
  it("should return user profile successfully", async () => {
    await getProfileUser(mockRequest, mockResponse);

    // Kiểm tra status code trả về
    expect(mockResponse.status).toHaveBeenCalledWith(200);

    // Kiểm tra dữ liệu trả về từ API
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Lấy thông tin người dùng thành công!",
      user: { userId: "123", userName: "testuser", fullName: "Test User" },
    });
  });

  it("should return 404 if no user found", async () => {
    const mockReqWithoutUser = {
      user: null,
    };
    await getProfileUser(mockReqWithoutUser, mockResponse);

    // Kiểm tra status code trả về khi không có người dùng
    expect(mockResponse.status).toHaveBeenCalledWith(404);

    // Kiểm tra thông báo lỗi trả về từ API
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Không tìm thấy người dùng!",
    });
  });
});
