import request from "supertest";
import app from "../dist/app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Tải các biến môi trường từ tệp .env
dotenv.config();

describe("Auth Controllers", () => {
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

  test("Login success with valid credentials", async () => {
    // Gửi yêu cầu đăng nhập
    const response = await request(app)
      .post("/auth/login") // Đường dẫn đăng nhập
      .send({
        userName: "TestUser",
        password: "password123",
      });

    // Kiểm tra kết quả
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Đăng nhập thành công!");
    expect(response.body.userData).toEqual({
      fullName: "Test User",
      userName: "TestUser",
    });
  });

  test("Login failed with invalid username", async () => {
    // Gửi yêu cầu đăng nhập với tên đăng nhập không đúng
    const response = await request(app).post("/auth/login").send({
      userName: "WrongUser",
      password: "password123",
    });

    // Kiểm tra kết quả
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Tên đăng nhập hoặc mật khẩu không đúng!"
    );
  });

  test("Login failed with invalid password", async () => {
    // Gửi yêu cầu đăng nhập với mật khẩu không đúng
    const response = await request(app).post("/auth/login").send({
      userName: "TestUser",
      password: "wrongPassword",
    });

    // Kiểm tra kết quả
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Tên đăng nhập hoặc mật khẩu không đúng!"
    );
  });
});
