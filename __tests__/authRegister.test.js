import request from "supertest";
import app from "../dist/app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Tải các biến môi trường từ tệp .env
dotenv.config();

describe("Auth Register Controllers", () => {
  beforeAll(async () => {
    // Kết nối đến MongoDB trước khi chạy các test
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Ngắt kết nối MongoDB sau khi hoàn thành các test
    await mongoose.disconnect();
  });

  test("Register failed with existing username", async () => {
    // Đăng ký người dùng đầu tiên
    await request(app).post("/auth/register").send({
      fullName: "Test User",
      userName: "TestUser",
      password: "password123",
    });

    // Gửi yêu cầu đăng ký với tên đăng nhập đã tồn tại
    const response = await request(app).post("/auth/register").send({
      fullName: "Another User",
      userName: "TestUser", // Tên đăng nhập đã tồn tại
      password: "password456",
    });

    // Kiểm tra kết quả
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Tên đăng nhập đã tồn tại. Hãy dùng tên khác!"
    );
  });
});
