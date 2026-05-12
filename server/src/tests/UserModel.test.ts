import sequelize from "../config/database";
import User from "../models/User";

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

test("Créer un utilisateur", async () => {
  const user = await User.create({
    nom_user: "Colard",
    prenom_user: "Manon",
    mail_user: "manon@colard.be",
    mdp_user: "manon123"
  });

  expect(user.id_user).toBeDefined();
  expect(user.nom_user).toBe("Colard");
});
