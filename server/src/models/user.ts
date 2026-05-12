import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

/**
 * 1. Définition des attributs
 */
interface UtilisateurAttributes {
  id_user: number;
  nom_user: string;
  prenom_user: string;
  mail_user: string;
  mdp_user: string;
}

/**
 * 2. Attributs optionnels (pour create)
 */
interface UtilisateurCreationAttributes
  extends Optional<UtilisateurAttributes, "id_user"> {}

/**
 * 3. Classe Model typée
 */
class Utilisateur
  extends Model<UtilisateurAttributes, UtilisateurCreationAttributes>
  implements UtilisateurAttributes
{
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