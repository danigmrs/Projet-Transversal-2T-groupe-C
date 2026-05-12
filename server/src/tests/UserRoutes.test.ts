import request from "supertest";
import app from "../app";
import sequelize from "../config/database";

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

test("POST /users crée un utilisateur", async () => {
  const res = await request(app)
    .post("/users")
    .send({
      lastname: "Colard",
      firstname: "Manon",
      mail: "manon@colard.be",
      password: "manon123"
    });

  expect(res.status).toBe(201);
  expect(res.body.mail_user).toBe("manon@colard.be");
});
