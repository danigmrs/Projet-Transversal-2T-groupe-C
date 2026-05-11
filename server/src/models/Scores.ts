import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Scores extends Model {
  public id_score!: number;
  public id_user!: number;
  public score!: number;
}

Scores.init(
  {
    id_score: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    }, 
    {
        sequelize,
        modelName: "Scores",
        tableName: "Scores",
        timestamps: false,
    });

export default Scores;  