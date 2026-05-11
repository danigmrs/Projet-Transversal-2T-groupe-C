import Utilisateur from "./Utilisateur";    
import Scores from "./Scores";

// Association entre Utilisateur et Scores
Utilisateur.hasMany(Scores, {
  foreignKey: "id_user",
  as: "scores",
});

Scores.belongsTo(Utilisateur, {
  foreignKey: "id_user",
  as: "utilisateur",
});
