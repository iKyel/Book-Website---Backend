import request from "supertest";
import express from "express";
import { orderRouter } from "../dist/src/routes/orderRoutes.js";
import { checkQuantityBook } from "../dist/src/controllers/orderControllers.js";

const app = express();
app.use(express.json());
app.use("/orders", orderRouter); // Mount routes

// Mock middleware
jest.mock("../dist/src/middlewares/authenticateToken.js", () =>
  jest.fn((req, res, next) => {
    req.user = { id: "mockUserId" }; // Fake user authentication
    next();
  })
);

// Mock controllers
jest.mock("../dist/src/controllers/orderControllers.js", () => ({
  addBookToCart: jest.fn((req, res) =>
    res.status(201).json({ message: "Book added to cart", data: req.body })
  ),
  getCart: jest.fn((req, res) =>
    res
      .status(200)
      .json({ message: "Cart details", data: [{ bookId: 1, quantity: 2 }] })
  ),
  updateCart: jest.fn((req, res) =>
    res.status(200).json({ message: "Cart updated", data: req.body })
  ),
  deleteBookInCart: jest.fn((req, res) =>
    res.status(200).json({
      message: "Book removed from cart",
      orderDetailId: req.params.orderDetailId,
    })
  ),
  checkQuantityBook: jest.fn((req, res) =>
    res.status(200).json({ message: "Quantity checked", data: true })
  ),
  createOrder: jest.fn((req, res) =>
    res.status(201).json({ message: "Order created", order: req.body })
  ),
  getOrders: jest.fn((req, res) =>
    res.status(200).json({
      message: "User orders",
      data: [{ orderId: "12345", total: 200 }],
    })
  ),
  getOrderDetails: jest.fn((req, res) =>
    res.status(200).json({
      message: "Order details retrieved successfully",
      data: { orderId: req.params.orderId, items: [] },
    })
  ),
}));

describe("Order Routes Unit Tests", () => {
  // Test thêm sách vào giỏ hàng
  it("should add a book to the cart", async () => {
    const response = await request(app)
      .post("/orders/addCart")
      .send({ bookId: 101, quantity: 3 })
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: "Book added to cart",
      data: { bookId: 101, quantity: 3 },
    });
  });

  // Test lấy thông tin giỏ hàng
  it("should get cart details", async () => {
    const response = await request(app)
      .get("/orders/getCart")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Cart details",
      data: [{ bookId: 1, quantity: 2 }],
    });
  });

  // Test cập nhật giỏ hàng
  it("should update the cart", async () => {
    const response = await request(app)
      .put("/orders/updateCart")
      .send({ bookId: 101, quantity: 5 })
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Cart updated",
      data: { bookId: 101, quantity: 5 },
    });
  });

  // Test xóa sách trong giỏ hàng
  it("should delete a book from the cart", async () => {
    const orderDetailId = "mockOrderDetailId";
    const response = await request(app)
      .delete(`/orders/deleteCart/${orderDetailId}`)
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Book removed from cart",
      orderDetailId,
    });
  });
});
