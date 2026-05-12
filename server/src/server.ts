import app from "./app";
import sequelize from "./config/database";
import "./models/user";
import "./models/Scores";
import "./models/Associations";

const PORT = 3000;

console.log("SERVER STARTED");

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Connexion DB OK");

    await sequelize.sync({ alter: true });
    console.log("DB synchronisée");

    app.listen(PORT, () => {
      console.log(`Serveur lancé sur le port ${PORT}`);
    });

  } catch (error) {
    console.error("Connexion DB échouée :", error);
  }
}

start();
