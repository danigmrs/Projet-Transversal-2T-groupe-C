import app from "./app";
import sequelize from "./config/database";
import "./models/Utilisateur";
import "./models/Scores";
import "./models/Associations";


console.log("SERVER STARTED");
const PORT = 3000;


  sequelize
  .sync({ alter: true }) 
  .then(() => {
    console.log("DB synchronisée");

    app.listen(PORT, () => {
      console.log(`Serveur lancé sur le port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Connexion DB échouée :", error);
  });
