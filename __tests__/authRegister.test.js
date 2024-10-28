import request from "supertest";
import app from "../dist/app.js";
import { UserModel } from "../dist/models/UserModel.js";

jest.mock("../models/UserModel.js");

describe("POST /auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mock data trước mỗi test
  });

  test("should register user successfully", async () => {
    // Mock dữ liệu trả về từ UserModel.findOne
    UserModel.findOne.mockResolvedValue(null); // Không tìm thấy user

    // Mock UserModel.create
    UserModel.create.mockResolvedValue({
      fullName: "Nguyễn Văn A",
      userName: "nguyenvana",
      password: "hashedPassword",
    });

    const response = await request(app).post("/auth/register").send({
      fullName: "Nguyễn Văn A",
      userName: "nguyenvana",
      password: "123456",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Đăng ký thành công!");
  });

  test("should return error if username already exists", async () => {
    // Mock dữ liệu trả về từ UserModel.findOne
    UserModel.findOne.mockResolvedValue({
      userName: "nguyenvana",
    }); // Tìm thấy user

    const response = await request(app).post("/auth/register").send({
      fullName: "Nguyễn Văn A",
      userName: "nguyenvana",
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Tên đăng nhập đã tồn tại. Hãy dùng tên khác!"
    );
  });

  test("should return server error", async () => {
    // Mock dữ liệu trả về từ UserModel.findOne
    UserModel.findOne.mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(app).post("/auth/register").send({
      fullName: "Nguyễn Văn A",
      userName: "nguyenvana",
      password: "123456",
    });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Lỗi hệ thống máy chủ.");
  });
});
