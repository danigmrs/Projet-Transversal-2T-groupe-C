import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";

const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: "sqlite"});

/*const dbHost = process.env.DB_HOST;
if (!dbHost) {
  throw new Error("DB_HOST is not defined");
}

export const sequelize = new Sequelize(
  process.env.DB_NAME as string,      // nom de la base
  process.env.DB_USER as string,      // utilisateur
  process.env.DB_PASSWORD as string,  // mot de passe
  {
    host: dbHost,        // ex: localhost
    dialect: "mysql",
    logging: false,
  }
);*/

export default sequelize;
