import User from "../models/User";
import sequelize from "../config/database";

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

test("Email unique", async () => {
  await User.create({
    nom_user: "Jean",
    prenom_user: "Dupont",
    mail_user: "test@test.be",
    mdp_user: "1234",
  });

  await expect(
    User.create({
      nom_user: "Pierre",
      prenom_user: "Martin",
      mail_user: "test@test.be",
      mdp_user: "5678",
    })
  ).rejects.toThrow();
});