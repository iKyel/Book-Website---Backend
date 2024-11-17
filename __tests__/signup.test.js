import { registerUser } from "../dist/src/controllers/authControllers.js";
import { UserModel } from "../dist/src/models/UserModel.js";
import bcrypt from "bcrypt";

// Mock các phương thức của UserModel và bcrypt
jest.mock("../dist/src/models/UserModel.js");
jest.mock("bcrypt");

describe("registerUser", () => {
  let req, res;

  beforeEach(() => {
    // Khởi tạo giá trị mock cho req và res
    req = {
      body: {
        fullName: "Test User",
        userName: "testUser",
        password: "testPassword",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Clear mock data trước mỗi test
    jest.clearAllMocks();
  });

  it("should return 400 if username already exists", async () => {
    // Mock findOne trả về user (người dùng đã tồn tại)
    UserModel.findOne.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue({ userName: "testUser" }),
    }));

    await registerUser(req, res);

    expect(UserModel.findOne).toHaveBeenCalledWith({ userName: "testUser" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Tên đăng nhập đã tồn tại. Hãy dùng tên khác!",
    });
  });

  it("should return 201 if registration is successful", async () => {
    // Mock findOne trả về null (người dùng không tồn tại)
    UserModel.findOne.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));

    // Mock bcrypt.hash để trả về giá trị hashed password
    bcrypt.hash.mockResolvedValue("hashedPassword");

    // Mock create để không làm gì (để kiểm tra quá trình tạo người dùng)
    UserModel.create.mockResolvedValue({});

    await registerUser(req, res);

    expect(UserModel.findOne).toHaveBeenCalledWith({ userName: "testUser" });
    expect(bcrypt.hash).toHaveBeenCalledWith("testPassword", 10);
    expect(UserModel.create).toHaveBeenCalledWith({
      fullName: "Test User",
      userName: "testUser",
      password: "hashedPassword",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Đăng ký thành công!" });
  });

  it("should return 500 if there is a server error", async () => {
    // Mock findOne để trả về lỗi
    UserModel.findOne.mockImplementation(() => ({
      exec: jest.fn().mockRejectedValue(new Error("Server error")),
    }));

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống máy chủ." });
  });
});
