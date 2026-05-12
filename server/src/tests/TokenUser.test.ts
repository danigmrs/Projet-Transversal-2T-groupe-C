import { AuthService } from "../services/auth.service";
import User from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sequelize from "../config/database";

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

jest.mock("../models/user");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

test("login - should return token if valid", async () => {
  (User.findOne as jest.Mock).mockResolvedValue({
    id_user: 1,
    mail_user: "test@mail.com",
    mdp_user: "hashed",
  });

  (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  (jwt.sign as jest.Mock).mockReturnValue("token123");

  const result = await AuthService.login("test@mail.com", "pass");

  expect(result.token).toBe("token123");
  expect(result.user.mail).toBe("test@mail.com");
});
