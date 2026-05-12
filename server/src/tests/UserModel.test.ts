import sequelize from "../src/config/database.js";
import Utilisateur from "../src/models/User.js";

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

test("Créer un utilisateur", async () => {
  const user = await Utilisateur.create({
    nom_user: "Colard",
    prenom_user: "Manon",
    mail_user: "manon@colard.be",
    mdp_user: "manon123"
  });

  expect(user.id_user).toBeDefined();
  expect(user.nom_user).toBe("Colard");
});
