import request from "supertest";
import app from "../app"; // Đảm bảo bạn đã export app từ file app.js
import { OrderModel } from "../models/OrderModel.js";
import { OrderDetailModel } from "../models/OrderDetailModel.js";

// Mock các mô hình Mongoose
jest.mock("../models/OrderModel.js");
jest.mock("../models/OrderDetailModel.js");

describe("Order Controllers", () => {
  let userToken;
  let userId;
  let orderId;
  let bookId;

  beforeAll(async () => {
    // Giả lập quá trình đăng nhập và lấy token người dùng
    const userResponse = await request(app)
      .post("/auth/login")
      .send({ email: "testuser@example.com", password: "password" });

    userToken = userResponse.body.token;
    userId = userResponse.body.userId;

    // Giả lập một bookId
    bookId = "60c72b2f9b1e8c6b2c8f7a3f"; // ID giả lập cho sách

    // Giả lập OrderModel.save() và trả về một orderId
    OrderModel.prototype.save = jest.fn().mockResolvedValue({
      _id: "orderId123", // ID giả lập cho order
      userId,
      orderStatus: "Cart",
    });

    // Giả lập OrderDetailModel.save()
    OrderDetailModel.prototype.save = jest.fn().mockResolvedValue({
      _id: "orderDetailId123",
      orderId: "orderId123",
      bookId,
      quantity: 1,
      price: 200,
    });

    // Giả lập OrderDetailModel.findOne()
    OrderDetailModel.findOne = jest.fn().mockResolvedValue({
      _id: "orderDetailId123",
      orderId: "orderId123",
      bookId,
      quantity: 1,
      price: 200,
    });
  });

  describe("POST /order/addCart", () => {
    it("should add a book to the cart", async () => {
      const res = await request(app)
        .post("/order/addCart")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          bookId,
          soLgSachThem: 1,
          price: 200,
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Thêm sách vào giỏ hàng thành công!");

      // Kiểm tra mock phương thức save
      expect(OrderDetailModel.prototype.save).toHaveBeenCalledTimes(1);
      expect(OrderDetailModel.prototype.save).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: "orderId123",
          bookId,
          quantity: 2, // Giả lập thêm 1 cuốn vào giỏ hàng
          price: 200,
        })
      );
    });
  });

  describe("GET /order/getCart", () => {
    it("should get the cart details", async () => {
      const res = await request(app)
        .get("/order/getCart")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Lấy giỏ hàng thành công!");
      expect(res.body.orderDetails).toHaveLength(1);
      expect(res.body.orderDetails[0].bookId).toBeDefined();
    });
  });

  describe("PUT /order/updateCart", () => {
    it("should update the quantity of a book in the cart", async () => {
      const res = await request(app)
        .put("/order/updateCart")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          updatedOrderDetails: [
            {
              _id: "orderDetailId123",
              bookId,
              quantity: 5,
              price: 1000,
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Cập nhật sách trong giỏ hàng thành công!");
    });
  });

  describe("DELETE /order/deleteCart/:orderDetailId", () => {
    it("should delete a book from the cart", async () => {
      const res = await request(app)
        .delete(`/order/deleteCart/orderDetailId123`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Xóa sách trong giỏ hàng thành công!");
    });
  });
});
