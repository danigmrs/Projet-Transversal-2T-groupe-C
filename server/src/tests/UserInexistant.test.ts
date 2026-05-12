import app from "../app";
import request from "supertest";
import sequelize from "../config/database";

jest.mock("../middlewares/auth.middleware", () => ({
  authMiddleware: (req: any, res: any, next: Function) => next(),
}));


beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

test("Utilisateur inexistant", async () => {
  const response = await request(app).get("/users/999");

  expect(response.status).toBe(404);
});

