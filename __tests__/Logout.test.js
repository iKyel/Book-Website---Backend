import { logoutUser } from "../dist/controllers/authControllers.js";
// Mock bcrypt and jwt
jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

// Mock UserModel
jest.mock("../dist/models/UserModel.js", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

// Mock response and request of Express
const mockRequest = (body = {}) => ({
  body,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn();
  res.clearCookie = jest.fn();
  return res;
};

describe("Auth Controllers", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  test("should logout successfully", async () => {
    const req = mockRequest();
    const res = mockResponse();
    // Call the controller
    await logoutUser(req, res);
    // Check results
    expect(res.clearCookie).toHaveBeenCalledWith("token");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Đăng xuất thành công!",
    });
  });
});
