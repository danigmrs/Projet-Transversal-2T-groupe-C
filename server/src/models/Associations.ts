import User from "./user";    
import Scores from "./Scores";

User.hasMany(Scores, {
  foreignKey: "id_user",
  as: "scores",
});

Scores.belongsTo(User, {
  foreignKey: "id_user",
  as: "utilisateur",
});
