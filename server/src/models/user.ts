import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import {
  UserAttributes,
  UserCreationAttributes,
} from "../types/userType";



 
class User
  extends Model<UserAttributes, UserCreationAttributes>
  
{
  declare id_user: number;
  declare nom_user: string;
  declare prenom_user: string;
  declare mail_user: string;
  declare mdp_user: string;
} // vide car écrase les getter/setter


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