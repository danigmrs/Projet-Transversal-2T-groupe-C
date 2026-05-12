import User from "../models/User";
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

test("Supprimer un utilisateur", async () => {
  const user = await User.create({
    nom_user: "Jean",
    prenom_user: "Dupont",
    mail_user: "delete@test.be",
    mdp_user: "1234",
  });

  const response = await request(app).delete(`/users/${user.id_user}`);

  expect(response.status).toBe(200);

  const found = await User.findByPk(user.id_user);

  expect(found).toBeNull();
});