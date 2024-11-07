require("dotenv").config();
const mongoose = require("mongoose");

//test mongoDBConnection
describe("MongoDB Connection", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
  test("should connect to MongoDB successfully", async () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 means connected
  });
});
