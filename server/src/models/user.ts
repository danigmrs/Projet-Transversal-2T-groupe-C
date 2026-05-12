import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";


 //Définition des attributs
 
interface UserAttributes {
  id_user: number;
  nom_user: string;
  prenom_user: string;
  mail_user: string;
  mdp_user: string;
}

//Attributs optionnels (pour create)
 
interface UserCreationAttributes
  extends Optional<UserAttributes, "id_user"> {}

// Classe Model typée
 
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{} // vide car écrase les getter/setter


User.init(
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
    modelName: "User",
    tableName: "Users",
    timestamps: false,
  }
);

export default User;