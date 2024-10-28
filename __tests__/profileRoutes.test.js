import request from "supertest";
import app from "../dist/app.js";

import mongoose from "mongoose";
import { UserModel } from "../dist/models/UserModel.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

let createdUserId;
let authToken;

// Đăng ký người dùng trước khi chạy các bài kiểm tra
beforeAll(async () => {
  const newUser = {
    fullName: "Nguyễn Văn A",
    userName: "existingUser", // Đảm bảo tên người dùng đã tồn tại
    password: "password123",
  };

  const hashedPassword = await bcrypt.hash(newUser.password, 10);
  const user = await UserModel.create({
    ...newUser,
    password: hashedPassword,
  });

  createdUserId = user._id;

  // Đăng nhập để lấy token
  const loginResponse = await request(app)
    .post("/auth/login")
    .send({ userName: newUser.userName, password: newUser.password });

  authToken = loginResponse.body.token; // Giả sử bạn trả về token sau khi đăng nhập
});

// Xóa tài khoản người dùng đã tạo trong test
afterAll(async () => {
  if (createdUserId) {
    await UserModel.findByIdAndDelete(createdUserId);
  }
  await mongoose.connection.close();
});

describe("Profile Router", () => {
  describe("POST /profile/getProfile", () => {
    it("should return user profile successfully if user exists", async () => {
      const response = await request(app)
        .post("/profile/getProfile")
        .set("Authorization", `Bearer ${authToken}`) // Thêm token vào header
        .send({ userName: "existingUser" });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Success");
      expect(response.body.user).toBeDefined(); // Kiểm tra thông tin người dùng được trả về
    });

    it("should return failure if user does not exist", async () => {
      const response = await request(app)
        .post("/profile/getProfile")
        .set("Authorization", `Bearer ${authToken}`) // Thêm token vào header
        .send({ userName: "nonexistentUser" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Failure");
    });

    it("should handle server errors gracefully", async () => {
      const response = await request(app)
        .post("/profile/getProfile")
        .set("Authorization", `Bearer ${authToken}`) // Thêm token vào header
        .send({ userName: null }); // Trường hợp không hợp lệ có thể gây lỗi server

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBeDefined(); // Kiểm tra xem có thông báo lỗi không
    });
  });
});
