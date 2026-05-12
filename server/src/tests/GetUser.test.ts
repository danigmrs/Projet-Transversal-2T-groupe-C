import app from "../app";
import User from "../models/user";
import request from "supertest";
import sequelize from "../config/database";
import { NextFunction } from "express";

jest.mock("../middlewares/auth.middleware", () => ({
  authMiddleware: (req: any, res: any, next: NextFunction) => next(),
}));

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

test("Récupérer les utilisateurs", async () => {
  await User.create({
    nom_user: "Dupont",
    prenom_user: "Jean",
    mail_user: "jean@dupont.be",
    mdp_user: "1234",
  });

  const response = await request(app).get("/users");

  expect(response.status).toBe(200);
  expect(response.body.length).toBe(1);
  expect(response.body[0].nom_user).toBe("Dupont");
});
