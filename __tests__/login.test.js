import { loginUser, logoutUser } from "../dist/controllers/authControllers.js";
import { UserModel } from "../dist/models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock các phương thức và đối tượng cần thiết
jest.mock("../dist/models/UserModel.js");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("loginUser", () => {
  let req, res;

  beforeEach(() => {
    // Khởi tạo giá trị mock cho req và res
    req = {
      body: {
        userName: "testUser",
        password: "testPassword",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    // Clear mock data trước mỗi test
    jest.clearAllMocks();
  });

  it("should return 401 if user is not found", async () => {
    // Mock findOne trả về null (người dùng không tồn tại)
    UserModel.findOne.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));

    await loginUser(req, res);

    expect(UserModel.findOne).toHaveBeenCalledWith({ userName: "testUser" });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Tên đăng nhập hoặc mật khẩu không đúng!",
    });
  });

  it("should return 401 if password does not match", async () => {
    // Mock findOne trả về user
    UserModel.findOne.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({
        userName: "testUser",
        password: "hashedPassword",
      }),
    }));

    // Mock bcrypt.compare trả về false (mật khẩu không đúng)
    bcrypt.compare.mockResolvedValue(false);

    await loginUser(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "testPassword",
      "hashedPassword"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Tên đăng nhập hoặc mật khẩu không đúng!",
    });
  });

  it("should return 500 if there is a server error", async () => {
    // Mock lỗi trong quá trình tìm kiếm user
    UserModel.findOne.mockImplementation(() => ({
      exec: jest.fn().mockRejectedValue(new Error("Server error")),
    }));

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống máy chủ." });
  });
});
