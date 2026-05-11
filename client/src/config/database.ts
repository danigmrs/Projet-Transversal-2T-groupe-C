import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME as string,      // nom de la base
  process.env.DB_USER as string,      // utilisateur
  process.env.DB_PASSWORD as string,  // mot de passe
  {
    host: process.env.DB_HOST,        // ex: localhost
    dialect: "mysql",
    logging: false,
  }
);

export default sequelize;
