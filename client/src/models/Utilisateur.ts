import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Utilisateur extends Model {
  public id_user!: number;
  public nom_user!: string;
  public prenom_user!: string;
  public mail_user!: string;
  public mdp_user!: string;
  
}

Utilisateur.init(
  {
    id_user: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nom_user: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    prenom_user: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mail_user: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    mdp_user: {
      type: DataTypes.STRING,
      allowNull: false,
    },

   
  },
  {
    sequelize,
    modelName: "Utilisateur",
    tableName: "Utilisateurs",
    timestamps: false,
  }
);

export default Utilisateur;
