import authenticate from "../dist/src/middlewares/authenticateToken.js";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");
jest.mock("../dist/src/models/UserModel.js");

describe("authenticate middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
      user: undefined,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  // Test: Thiếu token
  it("should return 401 if token is missing", () => {
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token chưa có: Người dùng chưa đăng nhập!",
    });
    expect(next).not.toHaveBeenCalled();
  });

  // Test: Token hết hạn
  it("should return 403 if token has expired", async () => {
    req.cookies.token = "expiredToken";
    jwt.verify.mockImplementation(() => {
      throw new Error("TokenExpiredError");
    });

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token đã hết hạn. Hãy đăng nhập lại!",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
